"""为身份板生成「脖子以下」蒙版，供 ComfyUI 局部重绘换装使用。

用法：
    python make_costume_mask.py <源图> <输出蒙版> [起始比例]

白色 = 需要重绘的区域（衣服），黑色 = 保留（脸、头发、背景）。
"""
import sys
from PIL import Image

SRC = sys.argv[1]
DST = sys.argv[2]
RATIO = float(sys.argv[3]) if len(sys.argv) > 3 else 0.42

img = Image.open(SRC).convert("RGB")
w, h = img.size
cut = int(h * RATIO)

mask = Image.new("L", (w, h), 0)
mask.paste(255, (0, cut, w, h))
mask.save(DST)
print(f"{DST} {w}x{h} cut={cut}")
