import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

export const CATEGORIES = [
  { id: "1", name: "Hair Products", slug: "hair-products", icon: "✂️", description: "Premium hair care products and styling tools.", imageUrl: "" },
  { id: "2", name: "Electronics", slug: "electronics", icon: "⚡", description: "Latest gadgets, appliances, and home electronics.", imageUrl: "" },
  { id: "3", name: "Baby Products", slug: "baby-products", icon: "👶", description: "Safe and gentle essentials for your little ones.", imageUrl: "" },
  { id: "4", name: "Insecticides", slug: "insecticides", icon: "🛡️", description: "Effective pest control solutions for your home.", imageUrl: "" },
  { id: "5", name: "Perfumes & Sprays", slug: "perfumes-sprays", icon: "✨", description: "Luxury fragrances, body mists, and deodorants.", imageUrl: "" },
  { id: "6", name: "Phones", slug: "phones", icon: "📱", description: "Smartphones and mobile accessories from top brands.", imageUrl: "" },
  { id: "7", name: "Laptops & Accessories", slug: "laptops-accessories", icon: "💻", description: "Computers, peripherals, and workstation gear.", imageUrl: "" },
  { id: "8", name: "Beddings", slug: "beddings", icon: "🛏️", description: "Comfortable bed sheets, pillows, and cozy duvets.", imageUrl: "" },
  { id: "9", name: "Drinks", slug: "drinks", icon: "☕", description: "Refreshing beverages, juices, and hot drinks.", imageUrl: "" }
];

dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "golden-choice-d971f";

console.log("Getting gcloud access token...");
const accessToken = execSync('gcloud auth print-access-token').toString().trim();

function toFirestoreValue(val: any): any {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (val === null) return { nullValue: null };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields: any = {};
    for (const key in val) fields[key] = toFirestoreValue(val[key]);
    return { mapValue: { fields } };
  }
}

async function setDocRest(collectionName: string, id: string, data: any) {
  const fields: any = {};
  for (const key in data) fields[key] = toFirestoreValue(data[key]);
  
  const patchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${id}`;
  const response = await fetch(patchUrl, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error(`Failed to write to ${collectionName}/${id}: ` + await response.text());
}

async function addDocRest(collectionName: string, data: any) {
  const fields: any = {};
  for (const key in data) fields[key] = toFirestoreValue(data[key]);
  
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error(`Failed to add to ${collectionName}: ` + await response.text());
}

const seedData = async () => {
  let createdCount = 0;
  
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await setDocRest('categories', cat.id, {
      ...cat,
      createdAt: new Date()
    });
    createdCount++;
  }

  const productTemplates: Record<string, any[]> = {
    "hair-products": [
      { name: "MegaGrowth Anti-Breakage Relaxer", desc: "Premium hair relaxer for strong and healthy hair.", price: 2500, compareAtPrice: 3000, brand: "MegaGrowth" },
      { name: "Darling Hair Extensions", desc: "Long lasting synthetic hair extensions for beautiful styles.", price: 4500, compareAtPrice: 5000, brand: "Darling" },
      { name: "Cantu Shea Butter Leave-In Conditioner", desc: "Intensive repair conditioning treatment.", price: 6500, compareAtPrice: 7500, brand: "Cantu" },
    ],
    "electronics": [
      { name: "Binatone Standing Fan 16\"", desc: "Cooling fan with adjustable height and 3-speed settings.", price: 35000, compareAtPrice: 40000, brand: "Binatone" },
      { name: "LG 32-inch LED TV", desc: "Crystal clear display with rich colors and sound.", price: 120000, compareAtPrice: 135000, brand: "LG" },
      { name: "Hisense 100L Chest Freezer", desc: "Fast freezing and energy efficient deep freezer.", price: 210000, compareAtPrice: 230000, brand: "Hisense" },
    ],
    "baby-products": [
      { name: "Pampers Baby-Dry Diapers Size 4", desc: "Up to 12 hours of dryness for your baby.", price: 8500, compareAtPrice: 9500, brand: "Pampers" },
      { name: "Pears Baby Lotion", desc: "Gentle baby lotion enriched with olive oil.", price: 1500, compareAtPrice: 1800, brand: "Pears" },
      { name: "SMA Gold Infant Formula", desc: "Nutritional milk for babies 0-6 months.", price: 12000, compareAtPrice: 13500, brand: "SMA" },
    ],
    "insecticides": [
      { name: "Mortein PowerGard Insecticide", desc: "Kills mosquitoes and cockroaches fast.", price: 2800, compareAtPrice: 3200, brand: "Mortein" },
      { name: "Baygon Multi Insect Killer", desc: "Effective protection against flying and crawling insects.", price: 2500, compareAtPrice: 2800, brand: "Baygon" },
      { name: "Sniper Insecticide 1000ml", desc: "Heavy duty pest control solution.", price: 1500, compareAtPrice: 1800, brand: "Sniper" },
    ],
    "perfumes-sprays": [
      { name: "Smart Collection Perfume", desc: "Long lasting fragrance for men and women.", price: 4000, compareAtPrice: 5000, brand: "Smart Collection" },
      { name: "Nivea Pearl & Beauty Roll-On", desc: "48h antiperspirant protection with smooth underarms.", price: 2500, compareAtPrice: 3000, brand: "Nivea" },
      { name: "Oud Touch Franck Olivier", desc: "Premium woody and spicy fragrance.", price: 22000, compareAtPrice: 25000, brand: "Franck Olivier" },
    ],
    "phones": [
      { name: "Tecno Spark 10 Pro", desc: "Affordable smartphone with great camera and battery.", price: 115000, compareAtPrice: 125000, brand: "Tecno" },
      { name: "Infinix Hot 30", desc: "Fast gaming phone with large display.", price: 105000, compareAtPrice: 110000, brand: "Infinix" },
      { name: "Samsung Galaxy A14", desc: "Reliable Samsung device with excellent battery life.", price: 145000, compareAtPrice: 155000, brand: "Samsung" },
    ],
    "laptops-accessories": [
      { name: "HP 15 Intel Core i3", desc: "Everyday laptop for work and study.", price: 350000, compareAtPrice: 380000, brand: "HP" },
      { name: "Lenovo IdeaPad 3", desc: "Lightweight and powerful laptop for professionals.", price: 340000, compareAtPrice: 360000, brand: "Lenovo" },
      { name: "Logitech Wireless Mouse", desc: "Smooth and precise wireless optical mouse.", price: 8500, compareAtPrice: 10000, brand: "Logitech" },
    ],
    "beddings": [
      { name: "Cotton Bed Sheet & 4 Pillowcases (6x6)", desc: "Soft and comfortable pure cotton bed sheets.", price: 12000, compareAtPrice: 15000, brand: "HomeCare" },
      { name: "Fiber Filled Pillows (Set of 2)", desc: "Fluffy and supportive sleeping pillows.", price: 6000, compareAtPrice: 7500, brand: "Vitafoam" },
      { name: "Thick Duvet Blanket", desc: "Warm and cozy duvet for all seasons.", price: 18000, compareAtPrice: 22000, brand: "ComfortBed" },
    ],
    "drinks": [
      { name: "Coca-Cola 50cl PET (Pack of 12)", desc: "Refreshing carbonated soft drink.", price: 4200, compareAtPrice: 4500, brand: "Coca-Cola" },
      { name: "Chivita 100% Orange Juice 1L", desc: "Pure fruit juice with no added sugar.", price: 1800, compareAtPrice: 2000, brand: "Chivita" },
      { name: "Nestle Milo Refill 500g", desc: "Energy food drink for champions.", price: 3500, compareAtPrice: 3800, brand: "Nestle" },
    ]
  };

  let featuredCount = 0;

  console.log("Seeding products...");
  for (const cat of CATEGORIES) {
    const products = productTemplates[cat.slug] || [];
    for (const p of products) {
      const isFeatured = featuredCount < 3;
      if (isFeatured) featuredCount++;

      const stockQuantity = Math.floor(Math.random() * 91) + 10;
      const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
      const reviewCount = Math.floor(Math.random() * 196) + 5;
      const soldCount = Math.floor(Math.random() * 501);

      const urlName = encodeURIComponent(p.name);
      
      const newProduct = {
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: p.desc,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: `https://picsum.photos/seed/${urlName}/400/400`,
        category: cat.slug,
        brand: p.brand,
        inStock: true,
        stockQuantity: stockQuantity,
        isPublished: true,
        isFeatured: isFeatured,
        rating: rating,
        reviewCount: reviewCount,
        soldCount: soldCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDocRest('products', newProduct);
      createdCount++;
    }
  }

  console.log("Seeding admin user...");
  await setDocRest('users', 'admin_seed_user', {
    email: "goldenchoicesuperstore@gmail.com",
    displayName: "Golden Choice Admin",
    role: "admin",
    createdAt: new Date()
  });
  createdCount++;

  console.log(`Successfully seeded ${createdCount} documents.`);
};

seedData().then(() => process.exit(0)).catch(e => {
  console.error("Error seeding data:", e);
  process.exit(1);
});
