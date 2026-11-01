"""
Split Michelangelo's Creation of Adam into three aligned layers for the hero:
  public/art/creation/bg.webp    the wall, sky and ground with both figures removed (inpainted), opaque
  public/art/creation/adam.webp  Adam and the green bank he lies on, transparent elsewhere
  public/art/creation/god.webp   God, the red shroud, the angels and the green drapery, transparent elsewhere
All three keep the full source canvas (3524 x 1599) so they stack pixel for pixel. Each also gets a -1600w copy.

Run once, from the site folder, with the isolated venv (it pins numpy/Pillow versions the global Python should not get):
  .art-work/venv/Scripts/python scripts/split-creation.py
Needs .art-work/sam_vit_b.pth (Segment Anything ViT-B). LaMa downloads its own weights on first use.
Debug overlays and a fingertip close-up are written to .art-work/ for checking. Not shipped to the client.
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".art-src", "creation.jpg")
WORK = os.path.join(ROOT, ".art-work")
OUT = os.path.join(ROOT, "public", "art", "creation")
os.makedirs(OUT, exist_ok=True)

img = np.array(Image.open(SRC).convert("RGB"))
H, W = img.shape[:2]
print("source", W, "x", H)


def px(fx, fy):
    return [fx * W, fy * H]


# ── 1. Segment with SAM, using positive and negative point prompts ──
from segment_anything import SamPredictor, sam_model_registry

sam = sam_model_registry["vit_b"](checkpoint=os.path.join(WORK, "sam_vit_b.pth"))
pred = SamPredictor(sam)
pred.set_image(img)

# negative points: plaster around and between the figures, the sky and the blue hills
PLASTER = [(0.40, 0.18), (0.47, 0.62), (0.36, 0.30), (0.55, 0.85), (0.30, 0.12), (0.05, 0.12), (0.10, 0.20)]


def segment(pos, neg, label, tight=False):
    pts = np.array([px(*p) for p in pos] + [px(*p) for p in neg])
    lab = np.array([1] * len(pos) + [0] * len(neg))
    masks, scores, _ = pred.predict(point_coords=pts, point_labels=lab, multimask_output=True)
    # prefer the highest-scoring mask, ties broken towards the larger one
    order = sorted(range(len(scores)), key=lambda i: (round(float(scores[i]), 2), masks[i].sum()), reverse=True)
    if tight:  # the smallest mask whose score is within 0.04 of the best
        best = float(scores[order[0]])
        order = sorted([i for i in range(len(scores)) if scores[i] >= best - 0.04], key=lambda i: masks[i].sum())
    m = masks[order[0]]
    print(f"{label}: scores {np.round(scores, 3)} -> picked {order[0]} covering {m.mean():.1%}")
    return m


def union(*ms):
    out = np.zeros((H, W), bool)
    for m in ms:
        out |= m
    return out


adam_body = segment([(0.18, 0.55), (0.30, 0.40), (0.12, 0.62), (0.26, 0.70)], PLASTER + [(0.60, 0.40), (0.75, 0.20)], "adam body")
# the bank: green and brown ground under Adam. Negatives keep out the blue mountain, the sky and the plaster above.
SKY = [(0.06, 0.18), (0.12, 0.26), (0.20, 0.18), (0.30, 0.22), (0.37, 0.20), (0.33, 0.52), (0.36, 0.60), (0.02, 0.35)]
adam_bank = segment([(0.22, 0.90), (0.10, 0.82), (0.33, 0.82), (0.45, 0.93), (0.04, 0.70)], PLASTER + SKY + [(0.18, 0.55), (0.60, 0.40)], "adam bank", tight=True)
god_main = segment([(0.58, 0.25), (0.75, 0.20), (0.70, 0.45), (0.45, 0.42), (0.62, 0.55)], PLASTER + [(0.18, 0.55), (0.25, 0.85)], "god group")
god_shroud = segment([(0.75, 0.20), (0.90, 0.15), (0.97, 0.30), (0.60, 0.10)], PLASTER + [(0.18, 0.55)], "red shroud")
god_drape = segment([(0.80, 0.80), (0.72, 0.72), (0.86, 0.90)], PLASTER + [(0.18, 0.55)], "green drapery")
god_lower = segment([(0.66, 0.72), (0.62, 0.66), (0.95, 0.66)], PLASTER + [(0.18, 0.55)], "lower angels")

adam = union(adam_body, adam_bank)
god = union(god_main, god_shroud, god_drape, god_lower) & ~adam_body

# clean small holes and specks
def tidy(m, close=9, open_=5):
    m = m.astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (open_, open_)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.002 * W * H:
            keep[lab == i] = 255
    # fill interior holes
    inv = cv2.bitwise_not(keep)
    n2, lab2, stats2, _ = cv2.connectedComponentsWithStats(inv, 8)
    for i in range(1, n2):
        x, y, w, h, a = stats2[i]
        if x > 0 and y > 0 and x + w < W and y + h < H and a < 0.01 * W * H:
            keep[lab2 == i] = 255
    return keep


adam_m = tidy(adam)
god_m = tidy(god)

# ── 2. Feather 2px and dilate 3px so cut edges never show a halo seam ──
def soft(m):
    d = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))  # 3px
    return cv2.GaussianBlur(d, (0, 0), 2)


adam_a = soft(adam_m)
god_a = soft(god_m)

# ── 3. Background plate: inpaint the union of both masks dilated by 25px ──
hole = cv2.dilate(np.maximum(adam_m, god_m), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51, 51)))
try:
    from simple_lama_inpainting import SimpleLama

    lama = SimpleLama()
    # LaMa at half size on CPU, then composite the filled area back at full size
    small = cv2.resize(img, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    small_hole = cv2.resize(hole, (W // 2, H // 2), interpolation=cv2.INTER_NEAREST)
    filled_small = np.array(lama(Image.fromarray(small), Image.fromarray(small_hole)))[: H // 2, : W // 2]
    filled = cv2.resize(filled_small, (W, H), interpolation=cv2.INTER_CUBIC)
    print("background: LaMa")
except Exception as e:  # fall back to OpenCV Telea plus a light blur
    print("LaMa unavailable, using cv2 Telea:", e)
    filled = cv2.inpaint(img, hole, 9, cv2.INPAINT_TELEA)
    filled = cv2.GaussianBlur(filled, (0, 0), 1.2)
blend = cv2.GaussianBlur(hole, (0, 0), 6).astype(np.float32)[..., None] / 255.0
bg = (img * (1 - blend) + filled * blend).astype(np.uint8)

# ── 4. Export at full size and 1600w ──
def save(arr, name, limit):
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
        print(f"{name}{suffix}.webp  {size // 1024} KB  q{q}")


save(bg, "bg", 450 * 1024)
save(np.dstack([img, adam_a]), "adam", 350 * 1024)
save(np.dstack([img, god_a]), "god", 350 * 1024)

# ── 5. Debug: mask overlays and a close-up of the fingertips with a 0.5% grid ──
ov = img.copy()
ov[adam_m > 0] = (ov[adam_m > 0] * 0.4 + np.array([0, 160, 255]) * 0.6).astype(np.uint8)
ov[god_m > 0] = (ov[god_m > 0] * 0.4 + np.array([255, 80, 0]) * 0.6).astype(np.uint8)
Image.fromarray(ov).resize((1600, round(1600 * H / W))).save(os.path.join(WORK, "debug-masks.jpg"), quality=85)
Image.fromarray(bg).resize((1600, round(1600 * H / W))).save(os.path.join(WORK, "debug-bg.jpg"), quality=85)

x0, x1, y0, y1 = int(0.34 * W), int(0.42 * W), int(0.40 * H), int(0.50 * H)
crop = img[y0:y1, x0:x1].copy()
crop = cv2.resize(crop, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
for f in np.arange(0.34, 0.4201, 0.005):
    x = int((f * W - x0) * 4)
    cv2.line(crop, (x, 0), (x, crop.shape[0]), (255, 0, 0) if abs(f * 100 % 1) < 1e-6 else (255, 200, 200), 1)
    if abs(f * 100 % 1) < 1e-6:
        cv2.putText(crop, f"{f:.2f}", (x + 3, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
for f in np.arange(0.40, 0.5001, 0.005):
    y = int((f * H - y0) * 4)
    cv2.line(crop, (0, y), (crop.shape[1], y), (0, 0, 255) if abs(f * 100 % 1) < 1e-6 else (200, 200, 255), 1)
    if abs(f * 100 % 1) < 1e-6:
        cv2.putText(crop, f"{f:.2f}", (3, y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
Image.fromarray(crop).save(os.path.join(WORK, "debug-fingers.jpg"), quality=90)
print("done")
sys.exit(0)
