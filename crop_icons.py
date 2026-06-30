import urllib.request
from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

url = "https://i.postimg.cc/CxHKKS9V/Chat-GPT-Image-Jun-21-2026-04-24-15-PM.png"
urllib.request.urlretrieve(url, "strip.png")

img = Image.open("strip.png").convert("RGBA")
width, height = img.size
segment_width = width // 10

slugs = [
    "home",
    "hair-products",
    "electronics",
    "baby-products",
    "insecticides",
    "perfumes-sprays",
    "phones",
    "laptops-accessories",
    "beddings",
    "drinks"
]

for i, slug in enumerate(slugs):
    if slug == "home":
        continue
    left = i * segment_width
    right = (i + 1) * segment_width
    box = (left, 0, right, height)
    segment = img.crop(box)
    
    # Trim excess whitespace
    trimmed = trim(segment)
    
    # Save the cropped image
    output_path = f"public/nav-icons/{slug}.png"
    trimmed.save(output_path)
    print(f"Saved {output_path}")

print("Done.")
