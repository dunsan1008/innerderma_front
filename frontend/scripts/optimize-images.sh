#!/bin/zsh
#
# 이미지 에셋 최적화 (일회용).
# 원본 PNG를 용도별 해상도로 리사이즈하고 JPEG q85로 변환한다.
# 원본은 .assets-backup/ 에 보관한다.
#
# 사용법: zsh scripts/optimize-images.sh
#
# 용도별 최대 렌더 크기 (@2x):
#   카드 상품 이미지: 378x326  (189x163 @2x)
#   배너 이미지:     730x456  (365x228 @2x)
#   상세 hero:       786x724  (393x362 @2x)
#   콤보 이미지:     170x170  (85x85 @2x)
#   장바구니 썸네일:  144x144  (72x72 @2x)
#   윔 상품:         이미 332x286 → 그대로 JPEG 변환만
#   로고/노이즈:     건드리지 않음 (이미 작거나 투명도 필수)

set -euo pipefail
cd "$(dirname "$0")/../src/assets/figma"

BACKUP="../../../.assets-backup"
mkdir -p "$BACKUP/products"

QUALITY=85

# ── 변환 함수 ────────────────────────────────────────────────────────
convert_to_jpg() {
  local src="$1"
  local max_dim="$2"  # 긴 변 기준
  local dst="${src%.png}.jpg"

  # 백업
  cp "$src" "$BACKUP/$src"

  # 리사이즈 — 긴 변이 max_dim 이하면 그대로 둔다
  local w h
  w=$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$src" | awk '/pixelHeight/{print $2}')
  local longer=$(( w > h ? w : h ))

  if (( longer > max_dim )); then
    if (( w >= h )); then
      sips --resampleWidth "$max_dim" "$src" --out "$src" >/dev/null 2>&1
    else
      sips --resampleHeight "$max_dim" "$src" --out "$src" >/dev/null 2>&1
    fi
  fi

  # PNG → JPEG
  sips -s format jpeg -s formatOptions "$QUALITY" "$src" --out "$dst" >/dev/null 2>&1

  # 원본 PNG 삭제 (JPEG 로 대체)
  rm "$src"

  local orig_kb=$(du -k "$BACKUP/$src" | cut -f1)
  local new_kb=$(du -k "$dst" | cut -f1)
  printf "  %-40s %5dKB → %4dKB  (-%d%%)\n" "$dst" "$orig_kb" "$new_kb" "$(( (orig_kb - new_kb) * 100 / orig_kb ))"
}

# ── 카드 상품 이미지 (378px) ─────────────────────────────────────────
echo "카드 상품 이미지 → 378px JPEG q$QUALITY"
for f in \
  products/banner-53.png products/banner-58.png \
  products/img-15.png products/img-16.png products/img-17.png \
  products/img-18.png products/img-19.png products/img-20.png products/img-21.png \
  products/m2-15.png products/m2-16.png products/m2-17.png products/m2-18.png \
  products/m2-19.png products/m2-20.png \
  products/m3-15.png products/m3-16.png products/m3-17.png products/m3-18.png \
  products/m3-19.png products/m3-20.png products/m3-21.png products/m3-22.png
do
  convert_to_jpg "$f" 378
done

# ── 배너 전용 (730px) — 배너로도 쓰이는 파일은 위에서 이미 378로 줄었으므로
#    별도 배너 전용 파일만. banner-59 는 배너에서 크롭·확대돼 쓰이므로 더 크게.
echo ""
echo "배너 전용 이미지 → 730px JPEG q$QUALITY"
convert_to_jpg products/banner-59.png 730

# ── 상세 hero (786px) ────────────────────────────────────────────────
echo ""
echo "상세 hero → 786px JPEG q$QUALITY"
convert_to_jpg pd-hero.png 786

# ── 콤보 이미지 (170px) ──────────────────────────────────────────────
echo ""
echo "콤보 이미지 → 170px JPEG q$QUALITY"
for f in pd-combo-1.png pd-combo-2.png pd-combo-3.png; do
  convert_to_jpg "$f" 170
done

# ── 장바구니 썸네일 (144px) ──────────────────────────────────────────
echo ""
echo "장바구니 썸네일 → 144px JPEG q$QUALITY"
for f in cart-serum.png cart-cream.png cart-cleanser.png; do
  convert_to_jpg "$f" 144
done

# ── 윔 상품 (이미 332px, 변환만) ────────────────────────────────────
echo ""
echo "윔 상품 이미지 → JPEG q$QUALITY (리사이즈 없음)"
for f in products/wim-1.png products/wim-2.png products/wim-3.png \
         products/wim-4.png products/wim-5.png products/wim-6.png \
         products/wim-banner.png; do
  convert_to_jpg "$f" 9999
done

# ── 건드리지 않는 파일 ───────────────────────────────────────────────
echo ""
echo "건드리지 않는 파일:"
echo "  camera-noise.png   (투명 노이즈 텍스처)"
echo "  pith-logo.png      (로고 — 배경 반전에 투명 필수)"
echo "  wim-logo-white.png (로고 — 배경 반전에 투명 필수)"

# ── 결과 요약 ────────────────────────────────────────────────────────
echo ""
echo "=== 결과 ==="
orig_total=$(du -ck "$BACKUP"/**/*.png "$BACKUP"/*.png 2>/dev/null | grep total | cut -f1)
new_total=$(du -ck products/*.jpg *.jpg 2>/dev/null | grep total | cut -f1)
echo "  원본 합계: ${orig_total}KB"
echo "  변환 합계: ${new_total}KB"
echo "  절감: $(( orig_total - new_total ))KB ($(( (orig_total - new_total) * 100 / orig_total ))%)"
echo ""
echo "원본은 .assets-backup/ 에 보관됩니다. 확인 후 삭제하세요."
