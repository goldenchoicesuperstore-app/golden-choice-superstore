const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const url = 'https://i.postimg.cc/3NVsDwdS/Chat-GPT-Image-Jun-20-2026-04-14-07-PM.png';

async function main() {
    console.log('Fetching image...');
    const image = await Jimp.read(url);
    
    // Autocrop removes borders of the same color
    image.autocrop();
    console.log(`Cropped size: ${image.bitmap.width}x${image.bitmap.height}`);

    const numIcons = 10;
    const iconW = image.bitmap.width / numIcons;
    const h = image.bitmap.height;

    const outDir = path.join(__dirname, 'public', 'nav-icons');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const filenames = [
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
    ];

    for (let i = 0; i < numIcons; i++) {
        const left = Math.round(i * iconW);
        const width = Math.min(Math.round(iconW), image.bitmap.width - left);
        
        const clone = image.clone();
        clone.crop({ x: left, y: 0, w: width, h });
        
        const file = path.join(outDir, filenames[i]);
        await clone.write(file);
        console.log(`Saved ${file}`);
    }
}

main().catch(console.error);
