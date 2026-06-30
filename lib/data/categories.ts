export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Hair Products", slug: "hair-products", icon: "✂️", description: "Premium hair care products and styling tools.", imageUrl: "" },
  { id: "2", name: "Electronics", slug: "electronics", icon: "⚡", description: "Latest gadgets, appliances, and home electronics.", imageUrl: "" },
  { id: "3", name: "Baby Products", slug: "baby-products", icon: "👶", description: "Safe and gentle essentials for your little ones.", imageUrl: "" },
  { id: "4", name: "Insecticides", slug: "insecticides", icon: "🛡️", description: "Effective pest control solutions for your home.", imageUrl: "" },
  { id: "5", name: "Perfumes & Sprays", slug: "perfumes-sprays", icon: "✨", description: "Luxury fragrances, body mists, and deodorants.", imageUrl: "" },
  { id: "6", name: "Phones", slug: "phones", icon: "📱", description: "Smartphones and mobile accessories from top brands.", imageUrl: "" },
  { id: "7", name: "Laptops & Accessories", slug: "laptops-accessories", icon: "💻", description: "Computers, peripherals, and workstation gear.", imageUrl: "" },
  { id: "8", name: "Beddings", slug: "beddings", icon: "🛏️", description: "Comfortable bed sheets, pillows, and cozy duvets.", imageUrl: "" },
  { id: "9", name: "Drinks", slug: "drinks", icon: "☕", description: "Refreshing beverages, juices, and hot drinks.", imageUrl: "" },
  { id: "10", name: "Bags", slug: "bags", icon: "👜", description: "Stylish and functional bags for every occasion.", imageUrl: "" },
  { id: "11", name: "Shoes", slug: "shoes", icon: "👞", description: "Comfortable and trendy footwear.", imageUrl: "" },
  { id: "12", name: "Food and Beverages", slug: "food-and-beverages", icon: "🍔", description: "Delicious food and refreshing beverages.", imageUrl: "" },
  { id: "13", name: "Wristwatches", slug: "wristwatches", icon: "⌚", description: "Elegant and durable wristwatches.", imageUrl: "" }
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find(category => category.slug === slug);
};
