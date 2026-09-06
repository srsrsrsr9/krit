#!/usr/bin/env python3
"""Annotate review screenshots with numbered callouts for psychology review."""
from PIL import Image, ImageDraw, ImageFont

PURPLE = (124, 58, 237)
PURPLE_FILL = (124, 58, 237, 36)
ORANGE = (245, 158, 11)
ORANGE_FILL = (245, 158, 11, 46)
WHITE = (255, 255, 255)


def font(size):
    paths = [
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def annotate(base_path, out_path, calls):
    img = Image.open(base_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    f = font(22)
    for c in calls:
        x1, y1, x2, y2 = c["bbox"]
        col = PURPLE if c["color"] == "purple" else ORANGE
        fill = PURPLE_FILL if c["color"] == "purple" else ORANGE_FILL
        draw.rectangle([x1, y1, x2, y2], fill=fill, outline=col, width=3)
        cx, cy = x1 - 4, y1
        r = 14
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE, outline=col, width=2)
        n = str(c["n"])
        bbox = draw.textbbox((0, 0), n, font=f)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        draw.text((cx - w / 2, cy - h / 2 - 2), n, fill=col, font=f)
    out = Image.alpha_composite(img, overlay).convert("RGB")
    out.save(out_path, "PNG")
    print("wrote", out_path)


ROOT = "/Users/srinivasvedantam/Documents/Me/elemes/v2/project-docs-v6/docs/review"
SS = f"{ROOT}/screenshots"
OUT = f"{ROOT}/psychology"

annotate(
    f"{SS}/01-embeddings-top.png",
    f"{OUT}/annotated-01-embeddings-calibration-friction.png",
    [
        {"bbox": (195, 8, 285, 42), "color": "orange", "n": 1},
        {"bbox": (1308, 8, 1398, 42), "color": "orange", "n": 2},
        {"bbox": (395, 425, 1040, 800), "color": "purple", "n": 3},
    ],
)

annotate(
    f"{SS}/02-finance-top.png",
    f"{OUT}/annotated-02-finance-hook-and-commit.png",
    [
        {"bbox": (333, 170, 1075, 280), "color": "orange", "n": 1},
        {"bbox": (333, 540, 555, 595), "color": "purple", "n": 2},
    ],
)

annotate(
    f"{SS}/03-marketing-top.png",
    f"{OUT}/annotated-03-marketing-essay-cliff.png",
    [
        {"bbox": (392, 200, 1050, 360), "color": "purple", "n": 1},
        {"bbox": (392, 380, 1050, 625), "color": "purple", "n": 2},
    ],
)

annotate(
    f"{SS}/04-mechanics-top.png",
    f"{OUT}/annotated-04-bicycle-falsify-commit.png",
    [
        {"bbox": (425, 140, 985, 260), "color": "orange", "n": 1},
        {"bbox": (425, 460, 1015, 820), "color": "purple", "n": 2},
    ],
)
