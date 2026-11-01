"""
Prepare the generated studio images for the site.
  Objects (shot on flat grey) are cut out with SAM, trimmed and saved with alpha to public/props/<name>.webp.
  The doves image holds three birds; each becomes dove-1..3.webp.
  The laptop's screen corners are read by hand for the transform in globals.css (.laptop__screen).
  Well photographs and the About painting lose the generator's sparkle mark and are resized.
Run from the site folder: .art-work/venv/Scripts/python scripts/cut-props.py <props dir> <wells dir> <about dir>
"""
import glob
import os
import sys

import cv2
import numpy as np
from PIL import Image
from segment_anything import SamPredictor, sam_model_registry

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROPS_IN, WELLS_IN, ABOUT_IN = sys.argv[1:4]
OUT = os.path.join(ROOT, "public")
NAMES = ["bell", "robot", "coin", "stamp", "chip", "cable", "pen", "letter", "phone", "keycap", "lens", "compass", "book", "laptop", "chart", "doves"]
WELLS = ["agents", "automation", "data", "language", "apps", "insight"]

sam = SamPredictor(sam_model_registry["vit_b"](checkpoint=os.path.join(ROOT, ".art-work", "sam_vit_b.pth")))


def by_index(folder, n):
    hits = glob.glob(os.path.join(folder, f"{n} - *"))
    return hits[0] if hits else None


def unmark(img):
    """The generator's sparkle sits near the bottom-right corner: find the brightest small star there and inpaint it."""
    h, w = img.shape[:2]
    y0, x0 = int(h * 0.8), int(w * 0.8)
    g = cv2.cvtColor(img[y0:, x0:], cv2.COLOR_RGB2GRAY).astype(np.float32)
    k = max(15, (min(h, w) // 20) | 1)
    top = g - cv2.medianBlur(g.astype(np.uint8), k).astype(np.float32)
    m = (top > max(18, top.max() * 0.45)).astype(np.uint8)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return img
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    x, y, bw, bh, _ = stats[i]
    if max(bw, bh) > min(h, w) * 0.08:  # too big to be the mark: leave the picture alone
        return img
    mask = np.zeros((h, w), np.uint8)
    cx, cy = x0 + x + bw // 2, y0 + y + bh // 2
    cv2.circle(mask, (cx, cy), int(max(bw, bh) * 0.75) + 4, 255, -1)
    return cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)


def foreground(img):
    """Rough foreground: the backdrop is a vignetted grey, so fit a smooth quadratic surface per channel to a band of
    border pixels and keep what differs from it. Floor shadows are dark but grey, so chroma is weighted in too."""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = xx / w - 0.5, yy / h - 0.5
    terms = np.stack([np.ones_like(u), u, v, u * u, v * v, u * v], -1)
    band = np.zeros((h, w), bool)
    k = max(6, h // 30)
    band[:k], band[-k:], band[:, :k], band[:, -k:] = True, True, True, True
    f = img.astype(np.float32)
    fit = np.zeros_like(f)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(terms[band], f[..., c][band], rcond=None)
        fit[..., c] = terms @ coef
    d = np.abs(f - fit)
    lum = d.mean(axis=2)
    chroma = np.abs(f - f.mean(axis=2, keepdims=True)).max(axis=2)
    score = np.maximum(lum * 0.6, chroma * 2.2) + np.maximum(0, (f.mean(axis=2) - fit.mean(axis=2))) * 0.8  # bright parts count fully, darkening (shadow) only partly
    m = (cv2.GaussianBlur(score, (0, 0), 2) > 20).astype(np.uint8) * 255
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))


def sam_cut(img, box):
    sam.set_image(img)
    masks, scores, _ = sam.predict(box=np.array(box), multimask_output=True)
    return masks[int(np.argmax(scores))].astype(np.uint8) * 255


def save_cut(img, mask, name, size=560):
    mask = cv2.GaussianBlur(cv2.dilate(mask, np.ones((3, 3), np.uint8)), (0, 0), 1.2)
    ys, xs = np.where(mask > 8)
    pad = 6
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    rgba = np.dstack([img, mask])[y0:y1, x0:x1]
    im = Image.fromarray(rgba)
    im.thumbnail((size, size), Image.LANCZOS)
    path = os.path.join(OUT, "props", f"{name}.webp")
    im.save(path, "WEBP", quality=86, method=6)
    print(f"  {name}.webp {im.size[0]}x{im.size[1]} {os.path.getsize(path) // 1024} KB")
    return (x0, y0, x1, y1)


os.makedirs(os.path.join(OUT, "props"), exist_ok=True)
os.makedirs(os.path.join(OUT, "wells"), exist_ok=True)

for n, name in enumerate(NAMES, 1):
    f = by_index(PROPS_IN, n)
    if not f:
        print(name, "missing")
        continue
    print(name)
    img = unmark(np.array(Image.open(f).convert("RGB")))
    fg = foreground(img)
    cnt, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
    blobs = sorted([stats[i] for i in range(1, cnt) if stats[i, cv2.CC_STAT_AREA] > 0.004 * fg.size], key=lambda s: -s[cv2.CC_STAT_AREA])
    if name == "doves":
        for k, (x, y, w, h, _) in enumerate(sorted(blobs[:3], key=lambda s: s[0]), 1):
            m = sam_cut(img, [x - 6, y - 6, x + w + 6, y + h + 6])
            keep = np.zeros_like(m)
            keep[max(0, y - 6) : y + h + 6, max(0, x - 6) : x + w + 6] = 255
            save_cut(img, m & keep, f"dove-{k}", 320)
        continue
    # box the object, then let SAM trace it inside the box and keep its most confident mask
    x, y, bw, bh, _ = blobs[0]
    for b in blobs[1:]:  # merge pieces that belong to the same object (a cable's plugs, a robot's key)
        if b[cv2.CC_STAT_AREA] > 0.15 * blobs[0][cv2.CC_STAT_AREA]:
            x1, y1 = max(x + bw, b[0] + b[2]), max(y + bh, b[1] + b[3])
            x, y = min(x, b[0]), min(y, b[1])
            bw, bh = x1 - x, y1 - y
    m = sam_cut(img, [x - 8, y - 8, x + bw + 8, y + bh + 8])
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # fill holes that are part of the object (a wax seal), not backdrop seen through it (a compass ring)
    inv = cv2.bitwise_not(m)
    nh, lh, sh, _ = cv2.connectedComponentsWithStats(inv, 8)
    for i in range(1, nh):
        hx, hy, hw, hh, ha = sh[i]
        if hx > 0 and hy > 0 and hx + hw < m.shape[1] and hy + hh < m.shape[0] and (fg[lh == i] > 0).mean() > 0.5:
            m[lh == i] = 255
    save_cut(img, m, name, 900 if name == "laptop" else 560)
    if name == "laptop":
        # the dark screen runs into the dark keyboard, so its corners were read by hand (see .laptop__screen in globals.css)
        print("  re-read the screen corners if laptop.webp is no longer 290 x 227")

for n in range(1, 13):
    f = by_index(WELLS_IN, n)
    if not f:
        print("well", n, "missing")
        continue
    img = unmark(np.array(Image.open(f).convert("RGB")))
    im = Image.fromarray(img)
    im.thumbnail((1200, 1200), Image.LANCZOS)
    name = f"{WELLS[(n - 1) // 2]}-{(n - 1) % 2 + 1}"
    im.save(os.path.join(OUT, "wells", f"{name}.webp"), "WEBP", quality=78, method=6)
    print(f"well {name} {im.size}")

f = by_index(ABOUT_IN, 1)
if f:
    im = Image.fromarray(unmark(np.array(Image.open(f).convert("RGB"))))
    im.save(os.path.join(OUT, "art", "council.webp"), "WEBP", quality=80, method=6)
    print("council.webp", im.size)
