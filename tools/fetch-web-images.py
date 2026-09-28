"""Download product images from real KakaoTalk 선물하기 listings into prototype/assets/img/web-*.jpg.
Each entry is (image name, gift.kakao.com product id); the page's og:image is fetched, flattened on white
and resized to 480x480. Images are used only in this class prototype (CSE4115) — sources listed below.
Run:  python tools/fetch-web-images.py   (needs Pillow + network)"""
import io
import re
import urllib.request
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "prototype" / "assets" / "img"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
SIZE = 480

PRODUCTS = [  # image name → https://gift.kakao.com/product/<id>
    ("web-starbucks-americano", 3818571),   # 아이스 카페 아메리카노 T 2잔 · 9,000원
    ("web-kgc-everytime", 556025),          # [정관장] 에브리타임 레귤러 (10ml x 30포) · 67,000원
    ("web-kgc-everytime-bojagi", 3789709),  # [정관장] 홍삼정에브리타임 리미티드 보자기 (10ml x 30포) · 144,000원
    ("web-hanwoo-set", 10939583),           # 신세계푸드 한우 1++등급 구이 선물세트 750g · 159,000원
    ("web-lactofit-50", 4705210),           # 종근당건강 락토핏 50대+ 1통 · 22,900원
    ("web-choonsik", 10090399),             # 카카오프렌즈 별별춘식 춘식이 드레스업 인형 · 26,000원
    ("web-kuromi", 11930452),               # 산리오 미드나잇 중형 인형 (쿠로미/마이멜로디) · 27,900원
    ("web-pikachu", 5019731),               # 포켓몬스터 빙글빙글 피카츄 인형 · 23,000원
    ("web-oliveyoung-card", 1138952),       # 올리브영 기프트카드 3만원권 · 30,000원
]


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return r.read()


def main():
    for name, product_id in PRODUCTS:
        page = get(f"https://gift.kakao.com/product/{product_id}").decode("utf-8", "replace")
        image_url = re.search(r'<meta property="og:image" content="([^"]+)"', page).group(1)
        img = Image.open(io.BytesIO(get(image_url))).convert("RGBA")
        flat = Image.new("RGB", img.size, "white")
        flat.paste(img, mask=img.getchannel("A"))
        flat.thumbnail((SIZE, SIZE))
        canvas = Image.new("RGB", (SIZE, SIZE), "white")  # pad non-square images
        canvas.paste(flat, ((SIZE - flat.width) // 2, (SIZE - flat.height) // 2))
        canvas.save(OUT / f"{name}.jpg", quality=86)
        print(f"{name}: {image_url}")


if __name__ == "__main__":
    main()
