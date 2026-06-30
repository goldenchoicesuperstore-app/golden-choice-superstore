import urllib.request
from PIL import Image, ImageChops
import io
import os

url = "https://i.postimg.cc/3NVsDwdS/Chat-GPT-Image-Jun-20-2026-04-14-07-PM.png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    img_data = response.read()

img = Image.open(io.BytesIO(img_data)).convert("RGBA")

# We want to crop out whitespace. 
# Let's find the bounding box of non-white pixels.
# Convert to RGB to ignore alpha for white comparison if alpha is 255
bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
diff = ImageChops.difference(img, bg)
diff = diff.convert("L")
# Bounding box of non-zero in diff (which means non-white in original)
bbox = diff.getbbox()

if bbox:
    # We only want to crop top and bottom, but let's crop all sides to be safe.
    # Actually, if the strip has space on left/right we should crop it too, 
    # so the 10 icons divide evenly.
    img = img.crop(bbox)

num_icons = 10
w, h = img.size
icon_w = w / num_icons

out_dir = "public/nav-icons"
os.makedirs(out_dir, exist_ok=True)

filenames = [
    "home.png",
    "hair-products.png",
    "electronics.png",
    "baby-products.png",
    "insecticides.png",
    "perfumes-sprays.png",
    "phones.png",
    "laptops-accessories.png",
    "beddings.png",
    "drinks.png"
]

for i in range(num_icons):
    left = int(i * icon_w)
    right = int((i + 1) * icon_w)
    box = (left, 0, right, h)
    icon = img.crop(box)
    icon.save(os.path.join(out_dir, filenames[i]))

print("Done slicing!")
