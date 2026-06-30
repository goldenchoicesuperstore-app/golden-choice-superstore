import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

const NEW_CATEGORIES = [
  { id: "10", name: "Bags", slug: "bags", icon: "👜", description: "Stylish and functional bags for every occasion.", imageUrl: "", isActive: true, orderNumber: 10 },
  { id: "11", name: "Shoes", slug: "shoes", icon: "👞", description: "Comfortable and trendy footwear.", imageUrl: "", isActive: true, orderNumber: 11 },
  { id: "12", name: "Food and Beverages", slug: "food-and-beverages", icon: "🍔", description: "Delicious food and refreshing beverages.", imageUrl: "", isActive: true, orderNumber: 12 },
  { id: "13", name: "Wristwatches", slug: "wristwatches", icon: "⌚", description: "Elegant and durable wristwatches.", imageUrl: "", isActive: true, orderNumber: 13 }
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
  
  console.log("Seeding new categories...");
  for (const cat of NEW_CATEGORIES) {
    await addDocRest('categories', {
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    createdCount++;
  }

  console.log(`Successfully seeded ${createdCount} categories.`);
};

seedData().then(() => process.exit(0)).catch(e => {
  console.error("Error seeding data:", e);
  process.exit(1);
});
