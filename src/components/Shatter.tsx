"use client";

import { useEffect, useRef } from "react";
import type { Art } from "@/lib/chapters";
import { onScroll, pinProgress, reducedMotion } from "@/lib/scroll";

const FRAG = /* glsl */ `
  uniform sampler2D uA; uniform sampler2D uB;
  uniform vec2 uRes; uniform vec2 uSizeA; uniform vec2 uSizeB;
  uniform float uP; uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  vec2 cover(vec2 uv, vec2 size){
    float rs = uRes.x / uRes.y, ri = size.x / size.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  void main(){
    vec2 uv = vUv;
    float n = fbm(uv * vec2(6.0, 4.0) + vec2(0.0, uTime * 0.05));
    // the dissolve front sweeps upward with a noisy, shard-like edge
    float front = uP * 1.5 - 0.25;
    float field = n * 0.6 + (1.0 - uv.y) * 0.55;
    float edge = smoothstep(front - 0.04, front, field) - smoothstep(front, front + 0.04, field);
    float showB = step(field, front);
    vec2 drift = vec2(0.0, (front - field) * 0.06) * (1.0 - showB);
    vec3 a = texture2D(uA, cover(uv + drift, uSizeA)).rgb;
    vec3 b = texture2D(uB, cover(uv, uSizeB)).rgb;
    vec3 col = mix(a, b, showB);
    // emissive white rim and sparkles along the tear
    float spark = step(0.985, hash(floor(uv * uRes / 3.0) + floor(uTime * 8.0))) * smoothstep(front - 0.15, front, field) * (1.0 - showB);
    col += vec3(1.0, 0.97, 0.9) * (edge * 1.6 + spark * 1.2);
    gl_FragColor = vec4(col, 1.0);
  }`;

// The outgoing painting disintegrates into glowing shards as the next one assembles behind it, scrubbed by scroll.
export function ShatterTransition({ from, to }: { from: Art; to: Art }) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const fallB = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const box = host.current;
    if (!el || !box) return;
    const reduce = reducedMotion();
    let gl = false;
    try {
      gl = !!document.createElement("canvas").getContext("webgl");
    } catch {}
    const offFallback = onScroll(() => {
      if (fallB.current) fallB.current.style.opacity = String(pinProgress(el));
    });
    if (reduce || !gl) return offFallback;

    let disposed = false;
    let cleanup = () => {};
    let started = false;
    const start = () =>
      import("three").then((THREE) => {
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        box.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        const scene = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const loader = new THREE.TextureLoader();
        const uniforms = {
          uA: { value: null as unknown as InstanceType<typeof THREE.Texture> },
          uB: { value: null as unknown as InstanceType<typeof THREE.Texture> },
          uRes: { value: new THREE.Vector2(1, 1) },
          uSizeA: { value: new THREE.Vector2(1, 1) },
          uSizeB: { value: new THREE.Vector2(1, 1) },
          uP: { value: 0 },
          uTime: { value: 0 },
        };
        const load = (src: string, key: "uA" | "uB", size: "uSizeA" | "uSizeB") =>
          new Promise<void>((res) =>
            loader.load(src, (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              uniforms[key].value = t;
              const im = t.image as HTMLImageElement;
              uniforms[size].value.set(im.width, im.height);
              res();
            })
          );
        const mat = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
          fragmentShader: FRAG,
        });
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
        scene.add(quad);
        const resize = () => {
          const w = box.clientWidth,
            h = box.clientHeight;
          renderer.setSize(w, h, false);
          uniforms.uRes.value.set(w, h);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(box);
        let raf = 0,
          ready = false,
          visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);
        Promise.all([load(from.src, "uA", "uSizeA"), load(to.src, "uB", "uSizeB")]).then(() => {
          ready = true;
          box.classList.add("is-gl");
        });
        const frame = (t: number) => {
          raf = requestAnimationFrame(frame);
          if (!ready || !visible) return;
          uniforms.uP.value = pinProgress(el);
          uniforms.uTime.value = t / 1000;
          renderer.render(scene, cam);
        };
        raf = requestAnimationFrame(frame);
        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          mat.dispose();
          quad.geometry.dispose();
          uniforms.uA.value?.dispose();
          uniforms.uB.value?.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      });
    // Mount WebGL only when the section is near.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          start();
        }
      },
      { rootMargin: "100% 0px" }
    );
    near.observe(el);
    return () => {
      disposed = true;
      near.disconnect();
      offFallback();
      cleanup();
    };
  }, [from.src, to.src]);

  return (
    <div className="shatter" ref={wrap} data-theme="dark" aria-hidden="true">
      <div className="shatter__pin" ref={host}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="shatter__img" src={from.src} alt="" loading="lazy" style={{ objectPosition: from.pos }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={fallB} className="shatter__img shatter__img--b" src={to.src} alt="" loading="lazy" style={{ objectPosition: to.pos }} />
      </div>
    </div>
  );
}
