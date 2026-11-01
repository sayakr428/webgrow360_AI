// The hero's WebGL layer, loaded on demand. It redraws the three fresco layers with the same offsets the DOM uses
// (so switching to it is invisible), turns them into glowing line-art, and tears a ragged hole at the touch point:
// the painting crumbles into glittering pixel fragments along a lumpy, drifting edge, with a cloud of sparks around it.
import * as THREE from "three";

export type Layer = { tx: number; ty: number; rot: number };
export type FxState = {
  plate: { x: number; y: number; w: number; h: number };
  bg: Layer;
  god: Layer;
  adam: Layer;
  touch: { x: number; y: number };
  voidR: number;
  u: number;
  p: number;
  time: number;
};

// The hole's outline, shared by the hole and the sparks: slow angular lobes (-1..1) that drift over time.
const LOBES = /* glsl */ `
  float lobes(float th, float t){
    return 0.5 * sin(3.0 * th + t * 0.6) + 0.3 * sin(5.0 * th - t * 0.9 + 1.7) + 0.2 * sin(8.0 * th + t * 0.4 + 4.0);
  }`;

const FRAG = /* glsl */ `
  precision highp float;
  ${LOBES}
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  uniform sampler2D uBg, uGod, uAdam;
  uniform vec2 uView;            // css px
  uniform float uDpr;
  uniform vec4 uPlate;           // x, y, w, h (css px)
  uniform vec3 uLBg, uLGod, uLAdam; // tx, ty, rot
  uniform vec2 uTouch;
  uniform float uVoid, uU, uTime;

  vec4 layer(sampler2D t, vec3 L, vec2 px){
    vec2 c = uPlate.xy + uPlate.zw * 0.5;
    vec2 q = px - vec2(L.x, L.y) - c;
    float s = sin(-L.z), co = cos(-L.z);
    q = vec2(co * q.x - s * q.y, s * q.x + co * q.y) + uPlate.zw * 0.5;
    vec2 uv = q / uPlate.zw;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
    return texture2D(t, vec2(uv.x, 1.0 - uv.y));
  }
  vec3 comp(vec2 px){
    vec3 col = layer(uBg, uLBg, px).rgb;
    vec4 g = layer(uGod, uLGod, px);
    col = mix(col, g.rgb, g.a);
    vec4 a = layer(uAdam, uLAdam, px);
    return mix(col, a.rgb, a.a);
  }
  float lum(vec2 px){ return dot(comp(px), vec3(0.299, 0.587, 0.114)); }
  float sobel(vec2 px, float r){
    float tl = lum(px + vec2(-r, -r)), t = lum(px + vec2(0.0, -r)), tr = lum(px + vec2(r, -r));
    float l = lum(px + vec2(-r, 0.0)), rr = lum(px + vec2(r, 0.0));
    float bl = lum(px + vec2(-r, r)), b = lum(px + vec2(0.0, r)), br = lum(px + vec2(r, r));
    float gx = -tl - 2.0 * l - bl + tr + 2.0 * rr + br;
    float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    return length(vec2(gx, gy));
  }
  void main(){
    vec2 px = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
    vec3 col = comp(px);
    if (uU > 0.001) {
      vec2 jit = vec2(sin(uTime * 7.0 + px.y * 0.05), cos(uTime * 6.0 + px.x * 0.05)) * 0.5;
      float e = sobel(px + jit, 1.5);
      float lines = smoothstep(0.08, 0.35, e);
      float glow = smoothstep(0.06, 0.3, sobel(px, 3.5)) * 0.4;
      vec3 ink = vec3(1.0, 0.98, 0.94) * 1.6;
      col = mix(col, col * 0.25 + (lines + glow) * ink, uU);
    }
    if (uVoid > 0.5) {
      // a ragged outline: angular lobes for the overall lumpiness, fbm for the torn detail
      vec2 v = px - uTouch;
      float d = length(v);
      float R = uVoid * (1.0 + 0.3 * lobes(atan(v.y, v.x), uTime));
      R += (fbm(px * 0.011 + uTime * 0.05) - 0.5) * (0.4 * uVoid + 40.0);
      float W = 0.3 * uVoid + 36.0;       // width of the crumbling band on either side of the edge
      float e = d - R;                    // < 0 inside the hole
      vec2 cell = floor(px / 5.0);        // the painting breaks up into 5px fragments
      float h = hash(cell), h2 = hash(cell + 17.3);
      float tw = 0.5 + 0.5 * sin(uTime * (3.0 + h2 * 5.0) + h * 40.0);
      vec3 spark = vec3(1.0, 0.97, 0.92);
      vec3 dark = vec3(0.025, 0.025, 0.03) + fbm(px * 0.03 + uTime * 0.1) * 0.07;
      if (e < 0.0) {
        // inside: smoky black, a few fragments still hanging on near the edge, and scattered sparks
        float near = clamp(1.0 + e / W, 0.0, 1.0);
        float keep = step(h, near * near * 0.55);
        col = mix(dark, col * 1.3 + 0.08, keep) + step(0.985, h2) * tw * spark * (0.5 + near);
      } else if (e < W) {
        // outside: the paint glows and flakes away, more of it the closer it is to the hole
        float k = e / W;
        float missing = step(h, (1.0 - k) * (1.0 - k) * 0.7);
        vec3 lit = col * (1.0 + 0.6 * (1.0 - k)) + 0.1 * (1.0 - k);
        col = mix(lit, dark, missing) + step(0.95, h2) * (1.0 - k) * tw * spark;
      }
    }
    gl_FragColor = vec4(col, 1.0);
  }`;

// Sparks: a ragged cloud hugging the hole's outline, thickest at the edge, thinning inwards and outwards,
// each drifting and wobbling on its own.
const PVERT = /* glsl */ `
  attribute vec3 dir; attribute float seed;
  uniform vec2 uCenter; uniform float uR, uTime, uP, uDpr;
  varying float vA; varying float vBig;
  ${LOBES}
  void main(){
    float th = atan(dir.y, dir.x) + uTime * 0.03 * (seed - 0.5);
    float edge = uR * (1.0 + 0.3 * lobes(th, uTime));
    // dir.z (-1..1) places the spark across the band; squared so most gather at the edge
    float off = dir.z * abs(dir.z) * (0.35 * uR + 50.0) * (0.6 + seed);
    float wob = 8.0 * sin(uTime * (1.0 + seed * 2.0) + seed * 50.0);
    float drift = max(0.0, uP - 0.55) * 0.9 * seed * uR;
    vec2 pos = uCenter + vec2(cos(th), sin(th)) * (edge + off + wob + drift);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    vBig = step(0.96, fract(seed * 91.7));
    float tw = 0.55 + 0.45 * sin(uTime * (2.0 + seed * 3.0) + seed * 60.0);
    vA = tw * (1.0 - 0.6 * abs(dir.z)) * step(1.0, uR);
    gl_PointSize = (vBig > 0.5 ? 9.0 : 1.0 + seed * 2.0) * uDpr;
  }`;
const PFRAG = /* glsl */ `
  varying float vA; varying float vBig;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a;
    if (vBig > 0.5) {
      // a four-point sparkle
      float cross = max(1.0 - abs(c.x) * 18.0, 0.0) * (1.0 - abs(c.y) * 2.0) + max(1.0 - abs(c.y) * 18.0, 0.0) * (1.0 - abs(c.x) * 2.0);
      a = clamp(cross + (1.0 - smoothstep(0.0, 0.18, length(c))), 0.0, 1.0);
    } else {
      a = 1.0 - smoothstep(0.2, 0.5, length(c));
    }
    gl_FragColor = vec4(vec3(1.0, 0.98, 0.94), a * vA);
  }`;

export function createHeroFx(host: HTMLElement, srcs: { bg: string; god: string; adam: string }, phone: boolean) {
  const dpr = Math.min(devicePixelRatio, 1.5);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  canvas.className = "hero__fx";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const loader = new THREE.TextureLoader();
  const tex = (src: string) =>
    new Promise<THREE.Texture>((res, rej) =>
      loader.load(
        src,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          res(t);
        },
        undefined,
        rej
      )
    );

  const u = {
    uBg: { value: null as THREE.Texture | null },
    uGod: { value: null as THREE.Texture | null },
    uAdam: { value: null as THREE.Texture | null },
    uView: { value: new THREE.Vector2(1, 1) },
    uDpr: { value: dpr },
    uPlate: { value: new THREE.Vector4() },
    uLBg: { value: new THREE.Vector3() },
    uLGod: { value: new THREE.Vector3() },
    uLAdam: { value: new THREE.Vector3() },
    uTouch: { value: new THREE.Vector2() },
    uVoid: { value: 0 },
    uU: { value: 0 },
    uTime: { value: 0 },
  };
  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadMat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: FRAG,
    depthTest: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat);
  quadScene.add(quad);

  // spark cloud: each spark gets an angle (from dir.xy) and a place across the edge band (dir.z)
  const N = phone ? 2500 : 5000;
  const dir = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const z = Math.random() * 2 - 1,
      t = Math.random() * Math.PI * 2,
      r = Math.sqrt(1 - z * z);
    dir.set([r * Math.cos(t), r * Math.sin(t), z], i * 3);
    seed[i] = Math.random();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  pg.setAttribute("dir", new THREE.BufferAttribute(dir, 3));
  pg.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
  const pu = { uCenter: { value: new THREE.Vector2() }, uR: { value: 0 }, uTime: { value: 0 }, uP: { value: 0 }, uDpr: { value: dpr } };
  const pMat = new THREE.ShaderMaterial({
    uniforms: pu,
    vertexShader: PVERT,
    fragmentShader: PFRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pg, pMat);
  points.frustumCulled = false;
  const pScene = new THREE.Scene();
  pScene.add(points);
  let pCam = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);

  let ready = false;
  const loaded = Promise.all([tex(srcs.bg), tex(srcs.god), tex(srcs.adam)]).then(([b, g, a]) => {
    u.uBg.value = b;
    u.uGod.value = g;
    u.uAdam.value = a;
    ready = true;
  });

  const resize = (w: number, h: number) => {
    renderer.setSize(w, h, false);
    u.uView.value.set(w, h);
    pCam = new THREE.OrthographicCamera(0, w, 0, h, -10, 10);
  };

  const render = (s: FxState) => {
    if (!ready) return false;
    u.uPlate.value.set(s.plate.x, s.plate.y, s.plate.w, s.plate.h);
    u.uLBg.value.set(s.bg.tx, s.bg.ty, s.bg.rot);
    u.uLGod.value.set(s.god.tx, s.god.ty, s.god.rot);
    u.uLAdam.value.set(s.adam.tx, s.adam.ty, s.adam.rot);
    u.uTouch.value.set(s.touch.x, s.touch.y);
    u.uVoid.value = s.voidR;
    u.uU.value = s.u;
    u.uTime.value = s.time;
    pu.uCenter.value.set(s.touch.x, s.touch.y);
    pu.uR.value = s.voidR;
    pu.uTime.value = s.time;
    pu.uP.value = s.p;
    renderer.clear();
    renderer.render(quadScene, quadCam);
    if (s.voidR > 1) renderer.render(pScene, pCam);
    return true;
  };

  const dispose = () => {
    quadMat.dispose();
    quad.geometry.dispose();
    pMat.dispose();
    pg.dispose();
    u.uBg.value?.dispose();
    u.uGod.value?.dispose();
    u.uAdam.value?.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { canvas, loaded, resize, render, dispose };
}
