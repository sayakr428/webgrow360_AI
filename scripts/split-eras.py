"""
Cut the era variants of Adam and God for the hero's scroll sequence (cover, wild, 1500s, 2020s).

Inputs, in .art-work/eras/ (re-dressed versions of the source crops, made with an image-editing model):
  adam-<i>.png   edit of adam-src.jpg  (the square crop at the left edge of the fresco)
  god-<i>.png    edit of god-src.jpg   (the 16:9 crop at the right edge)
Each edit is registered back onto its source crop (affine ECC, so a small shift or zoom from the model is undone),
pasted into the full 3524 x 1599 canvas and cut out with the same SAM prompts as split-creation.py. The fingertips are
then restored from the source so the touch point stays pixel-exact in every era.

Outputs: public/art/creation/{adam,god}-<i>{,-1600w}.webp, and creation-cover.webp (era 0 flattened, the poster).
Run from the site folder: .art-work/venv/Scripts/python scripts/split-eras.py
"""
import os

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, ".art-work")
ERAS = os.path.join(WORK, "eras")
OUT = os.path.join(ROOT, "public", "art", "creation")

src = np.array(Image.open(os.path.join(ROOT, ".art-src", "creation.jpg")).convert("RGB"))
H, W = src.shape[:2]
CROPS = {"adam": (0, H), "god": (W - round(H * 16 / 9), W)}  # x0, x1 of each source crop, full height
TIPS = {"adam": (0.377, 0.46), "god": (0.38, 0.452)}
# the editing model stamps a small sparkle near the bottom-right corner: centre and radius as fractions of its width
MARK = {"adam": (0.900, 0.900, 0.03), "god": (0.930, 0.880, 0.024)}


def unmark(gen, fig):
    h, w = gen.shape[:2]
    cx, cy, r = MARK[fig]
    m = np.zeros((h, w), np.uint8)
    cv2.circle(m, (round(cx * w), round(cy * h)), round(r * w), 255, -1)
    return cv2.inpaint(gen, m, 5, cv2.INPAINT_TELEA)


def detail(gen, ref, sigma=2.5):
    """The edits come back smaller than the source: add the source's fine detail (cracks, brushwork) back wherever
    the painting is unchanged, judged by how close the blurred colours are."""
    g = gen.astype(np.float32)
    r = ref.astype(np.float32)
    hi = r - cv2.GaussianBlur(r, (0, 0), sigma)
    diff = np.abs(cv2.GaussianBlur(g, (0, 0), 6) - cv2.GaussianBlur(r, (0, 0), 6)).mean(axis=2)
    same = np.clip(1 - (diff - 10) / 20, 0, 1)
    same = cv2.GaussianBlur(same, (0, 0), 4)[..., None]
    g_hi = g - cv2.GaussianBlur(g, (0, 0), sigma)
    out = cv2.GaussianBlur(g, (0, 0), sigma) + g_hi * (1 - same) + hi * same
    return np.clip(out, 0, 255).astype(np.uint8)


def px(fx, fy):
    return [fx * W, fy * H]


def register(gen, ref):
    """Warp gen onto ref with an affine ECC fit at quarter size; returns gen at ref's size."""
    gen = cv2.resize(gen, (ref.shape[1], ref.shape[0]), interpolation=cv2.INTER_CUBIC)
    s = 0.25
    a = cv2.cvtColor(cv2.resize(ref, None, fx=s, fy=s), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    b = cv2.cvtColor(cv2.resize(gen, None, fx=s, fy=s), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(a, b, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error as e:
        print("  ECC did not converge, using the plain resize:", e)
        return gen
    warp[:, 2] /= s
    print(f"  registered: scale {np.hypot(*warp[0, :2]):.3f}, shift {warp[0, 2]:+.1f},{warp[1, 2]:+.1f}px")
    return cv2.warpAffine(gen, warp, (ref.shape[1], ref.shape[0]), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)


from segment_anything import SamPredictor, sam_model_registry

sam = sam_model_registry["vit_b"](checkpoint=os.path.join(WORK, "sam_vit_b.pth"))
pred = SamPredictor(sam)

PLASTER = [(0.40, 0.18), (0.47, 0.62), (0.36, 0.30), (0.55, 0.85), (0.30, 0.12), (0.05, 0.12), (0.10, 0.20)]
SKY = [(0.06, 0.18), (0.12, 0.26), (0.20, 0.18), (0.30, 0.22), (0.37, 0.20), (0.33, 0.52), (0.36, 0.60), (0.02, 0.35)]


def segment(pos, neg, label, tight=False):
    pts = np.array([px(*p) for p in pos] + [px(*p) for p in neg])
    lab = np.array([1] * len(pos) + [0] * len(neg))
    masks, scores, _ = pred.predict(point_coords=pts, point_labels=lab, multimask_output=True)
    order = sorted(range(len(scores)), key=lambda i: (round(float(scores[i]), 2), masks[i].sum()), reverse=True)
    if tight:
        best = float(scores[order[0]])
        order = sorted([i for i in range(len(scores)) if scores[i] >= best - 0.04], key=lambda i: masks[i].sum())
    m = masks[order[0]]
    print(f"  {label}: picked {order[0]} covering {m.mean():.1%}")
    return m


def tidy(m, close=9, open_=5):
    m = m.astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (open_, open_)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.002 * W * H:
            keep[lab == i] = 255
    inv = cv2.bitwise_not(keep)
    n2, lab2, stats2, _ = cv2.connectedComponentsWithStats(inv, 8)
    for i in range(1, n2):
        x, y, w, h, a = stats2[i]
        if x > 0 and y > 0 and x + w < W and y + h < H and a < 0.01 * W * H:
            keep[lab2 == i] = 255
    return keep


def soft(m):
    d = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    return cv2.GaussianBlur(d, (0, 0), 2)


def cut(img, fig):
    pred.set_image(img)
    if fig == "adam":
        body = segment([(0.18, 0.55), (0.30, 0.40), (0.12, 0.62), (0.26, 0.70)], PLASTER + [(0.60, 0.40), (0.75, 0.20)], "adam body")
        bank = segment([(0.22, 0.90), (0.10, 0.82), (0.33, 0.82), (0.45, 0.93), (0.04, 0.70)], PLASTER + SKY + [(0.18, 0.55), (0.60, 0.40)], "adam bank", tight=True)
        return tidy(body | bank)
    main = segment([(0.58, 0.25), (0.75, 0.20), (0.70, 0.45), (0.45, 0.42), (0.62, 0.55)], PLASTER + [(0.18, 0.55), (0.25, 0.85)], "god group")
    shroud = segment([(0.75, 0.20), (0.90, 0.15), (0.97, 0.30), (0.60, 0.10)], PLASTER + [(0.18, 0.55)], "red shroud")
    drape = segment([(0.80, 0.80), (0.72, 0.72), (0.86, 0.90)], PLASTER + [(0.18, 0.55)], "green drapery")
    lower = segment([(0.66, 0.72), (0.62, 0.66), (0.95, 0.66)], PLASTER + [(0.18, 0.55)], "lower angels")
    adam_body = segment([(0.18, 0.55), (0.30, 0.40), (0.12, 0.62), (0.26, 0.70)], PLASTER + [(0.60, 0.40), (0.75, 0.20)], "adam body (excluded)")
    return tidy((main | shroud | drape | lower) & ~adam_body)


def restore_tip(img, fig, r=0.022):
    """Put the source fingertips back, feathered, so every era touches at exactly the same point."""
    cx, cy = TIPS[fig]
    # centre the patch a little up the finger, away from the gap
    cx += -0.012 if fig == "adam" else 0.012
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.hypot(xx - cx * W, yy - cy * H) / (r * W)
    a = np.clip(1.6 - d * 1.6, 0, 1)[..., None]  # flat core, soft edge
    return (img * (1 - a) + src * a).astype(np.uint8)


def save(arr, name, limit=350 * 1024):
    full = Image.fromarray(arr)
    for suffix, im in (("", full), ("-1600w", full.resize((1600, round(1600 * H / W)), Image.LANCZOS))):
        path = os.path.join(OUT, f"{name}{suffix}.webp")
        q = 82
        while True:
            im.save(path, "WEBP", quality=q, method=6)
            size = os.path.getsize(path)
            if suffix or size <= limit or q <= 50:
                break
            q -= 6
        print(f"  {name}{suffix}.webp {size // 1024} KB q{q}")


def largest(m):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n <= 2:
        return m
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return np.where(lab == i, 255, 0).astype(np.uint8)


def era_mask(base, img):
    """SAM is unreliable once the clothes change, so: the figure's mask on the untouched source, plus every pixel the
    edit changed close to it (a new hood, a sneaker, a cloak), keeping only the main body."""
    diff = np.abs(cv2.GaussianBlur(img.astype(np.float32), (0, 0), 3) - cv2.GaussianBlur(src.astype(np.float32), (0, 0), 3)).max(axis=2)
    near = cv2.dilate(base, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (81, 81)))
    changed = ((diff > 28) & (near > 0)).astype(np.uint8) * 255
    return largest(tidy((base > 0) | (changed > 0), close=15))


layers = {}
for fig in ("adam", "god"):
    x0, x1 = CROPS[fig]
    print(f"{fig}: base mask from the source")
    base = largest(cut(src, fig))
    for i in range(4):
        f = os.path.join(ERAS, f"{fig}-{i}.png")
        if not os.path.exists(f):
            print(f"{fig}-{i}: missing, skipped")
            continue
        print(f"{fig}-{i}")
        gen = register(unmark(np.array(Image.open(f).convert("RGB")), fig), src[:, x0:x1])
        gen = detail(gen, src[:, x0:x1])
        img = src.copy()
        img[:, x0:x1] = gen
        img = restore_tip(img, fig)
        m = era_mask(base, img)
        a = soft(m)
        save(np.dstack([img, a]), f"{fig}-{i}")
        layers[(fig, i)] = (img, a)
        ov = img.copy()
        ov[m > 0] = (ov[m > 0] * 0.45 + np.array([0, 160, 255] if fig == "adam" else [255, 80, 0]) * 0.55).astype(np.uint8)
        Image.fromarray(ov).resize((1600, round(1600 * H / W))).save(os.path.join(ERAS, f"debug-{fig}-{i}.jpg"), quality=85)

# flattened stills: era 0 is the hero's poster, era 3 the finale's close-up of the hands
for i, name in ((0, "creation-cover"), (3, "creation-2020s")):
    if ("adam", i) not in layers or ("god", i) not in layers:
        continue
    bg = np.array(Image.open(os.path.join(OUT, "bg.webp")).convert("RGB")).astype(np.float32)
    for fig in ("god", "adam"):
        img, a = layers[(fig, i)]
        k = a.astype(np.float32)[..., None] / 255
        bg = bg * (1 - k) + img * k
    path = os.path.join(ROOT, "public", "art", f"{name}.webp")
    Image.fromarray(bg.astype(np.uint8)).resize((2400, round(2400 * H / W)), Image.LANCZOS).save(path, "WEBP", quality=80, method=6)
    print(f"{name}.webp", os.path.getsize(path) // 1024, "KB")
print("done")
