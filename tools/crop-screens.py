"""Crop product photos, category tiles and Kakao assets out of docs/reference-screens/
into prototype/assets/img/. Re-run after adding entries:  python tools/crop-screens.py
Boxes are in screenshot pixels (1080 px wide). Needs Pillow."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "reference-screens"
OUT = ROOT / "prototype" / "assets" / "img"


def shot(stamp):
    return SRC / f"Screenshot_20260928_{stamp}_KakaoTalk.jpg"


def square(x, y, size):
    return (x, y, x + size, y + size)


def centered(cx, cy, half):
    return (cx - half, cy - half, cx + half, cy + half)


CROPS = {}

# 164450 ranking grid (3 cols x 2 rows, 318 px images). Inner 240 px square skips baked-in rank/promo badges.
for name, x0, y0 in [
    ("p-sentica", 42, 2312), ("p-neoldam", 381, 2312), ("p-bodyfim", 720, 2312),
    ("p-mac", 42, 3131), ("p-nuart", 381, 3131), ("p-aesop", 720, 3131),
]:
    CROPS[name] = ("164450", square(x0 + 39, y0 + 78, 240))

# 164609 category list (2 cols, 488 px images). Inner 400 px square skips the "단독" badge.
for name, x0, y0 in [
    ("p-godiva", 551, 1120), ("p-josun-deli", 42, 2160), ("p-hart-tiramisu", 551, 2160),
    ("p-parisbaguette", 42, 3141), ("p-osulloc", 551, 3141),
]:
    CROPS[name] = ("164609", square(x0 + 44, y0 + 88, 400))

# 164618 product detail hero (1080 px) — inner square skips "단독" and "1/2".
CROPS["p-haagen-realblanc"] = ("164618", (180, 360, 980, 1160))
# 164618 brand recommendations (336 px images)
for name, x0 in [("p-haagen-biscuit", 42), ("p-haagen-mini", 399), ("p-haagen-kukka", 756)]:
    CROPS[name] = ("164618", square(x0 + 12, 2955 + 18, 300))

# 164507 "similar products" row (272 px) and recent-view circles
CROPS["p-bbq"] = ("164507", square(79, 1177, 200))  # top part only: skips the "내가 본" badge
CROPS["p-gamachi"] = ("164507", square(336, 1177, 272))
CROPS["p-kkubrakko"] = ("164507", square(632, 1177, 272))
for name, cx in [("p-mango", 270), ("p-strawberry-cake-set", 427), ("p-br-icecream", 584), ("p-chocolate-box", 740)]:
    CROPS[name] = ("164507", centered(cx, 986, 56))

# Category tiles: 5 x 3 grid, same positions on 164450 / 164501 / 164602
GRID_X = [130, 335, 541, 746, 951]
GRID_Y = [994, 1239, 1482]
TILES = {
    "164450": ["theme-birthday", "theme-moisture", "theme-tasty", "theme-health", "theme-hotdeal",
               "theme-light", "theme-luxury", "theme-small-luxury", "theme-baby", "theme-wedding",
               "theme-voucher", "theme-coworker", "theme-cheer", "theme-funny", "theme-new"],
    "164501": ["kakao-ryan-card", "cat-cake", "cat-vitamin", "cat-headphone", "cat-mango",
               "cat-makeup", "cat-perfume", "cat-jewelry", "cat-living", "cat-cafe",
               "cat-wine", "cat-golf", "cat-giftcard", "cat-kids", "cat-fandom"],
    "164602": [None, "cat-cake-2", "cat-redginseng", "cat-minidevice", "cat-orange",
               None, None, "cat-fashion", "cat-cushion", "cat-chicken",
               "cat-sake", "cat-golfball", None, None, "cat-kitty"],
}
for stamp, names in TILES.items():
    for i, name in enumerate(names):
        if name:
            CROPS[name] = (stamp, centered(GRID_X[i % 5], GRID_Y[i // 5], 63))

# 164514 category page list tiles (2 cols)
for i, name in enumerate(["list-exchange", "list-giftcard", "list-beauty", "list-fashion", "list-food",
                          "list-liquor", "list-living", "list-sports", "list-books", "list-kids", "list-digital"]):
    CROPS[name] = ("164514", centered([102, 600][i % 2], [271, 419, 566, 712, 860, 1007][i // 2], 50))

# Kakao assets
CROPS["kakao-talk"] = ("164826", centered(119, 162, 34))
for name, x0 in [("msg-theme-1", 182), ("msg-theme-2", 337), ("msg-theme-3", 492),
                 ("msg-theme-5", 801)]:
    CROPS[name] = ("164646", square(x0, 1241, 135))
CROPS["msg-theme-4"] = ("164646", square(656, 1247, 122))  # selected one: inside the black ring
CROPS["msg-art-blue"] = ("164646", (90, 759, 990, 1199))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (stamp, box) in CROPS.items():
        Image.open(shot(stamp)).convert("RGB").crop(box).save(OUT / f"{name}.jpg", quality=88)
    print(f"{len(CROPS)} images -> {OUT}")


if __name__ == "__main__":
    main()
