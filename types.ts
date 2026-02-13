
export type Language = 'uz' | 'ru' | 'en';

export interface Review {
  id: number;
  productId: number;
  userId: string; // phone number as ID
  userName: string;
  rating: number;
  pros: string;
  cons: string;
  comment: string;
  imageUrl?: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string; // Main image
  gallery?: string[]; // Additional images
  category: string;
  rating: number;
  specs: string;
  sku: string;
  reviews?: Review[];
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  name: string;
  phone: string;
  passport: string; // Changed from email to passport
  address: string;
  password?: string;
  regTime: string;
  lastLocation?: string;
  lastSeen?: string;
  avatar?: string;
}

export interface Order {
  id: number;
  userName: string;
  userPhone: string;
  address: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Yangi' | 'Qadoqlanmoqda' | 'Yetkazilmoqda' | 'Yetkazildi' | 'Bekor qilindi' | 'Qaytarildi';
  date: string;
  deliveryDate: string; // Display string
  deliveryTimestamp: number; // For logic comparison
  paymentMethod: 'cash' | 'card';
  cardInfo?: { number: string; expiry: string };
  isReviewed?: boolean; // Flag if user reviewed this order
  fundsTransferred?: boolean; // Only for card payments: true if money moved to admin
  cancelReason?: string; // Reason for cancellation
}

export interface Question {
  id: number;
  productId: number;
  userName: string;
  text: string;
  answer?: string;
  date: string;
  isReadByUser?: boolean;
}

export interface ChatMessage {
  id: number;
  orderId: number;
  sender: 'admin' | 'user';
  text: string;
  timestamp: string;
}

export const CATEGORIES = [
  "Noutbuklar",
  "Telefonlar",
  "Monobloklar",
  "Sport mahsulotlari",
  "Planshetlar",
  "Kompyuterlar"
];

export const CATEGORY_BRANDS: Record<string, string[]> = {
  "Noutbuklar": ["HP", "LENOVO", "ACER", "ASUS", "SAMSUNG", "MSI", "APPLE", "DELL"],
  "Telefonlar": ["APPLE", "SAMSUNG", "XIAOMI", "HUAWEI", "HONOR", "VIVO"],
  "Monobloklar": ["HP", "LENOVO", "APPLE", "DELL", "ASUS"],
  "Sport mahsulotlari": ["TECHNOGYM", "ADIDAS", "NIKE", "7SABER", "PUMA"],
  "Planshetlar": ["APPLE", "SAMSUNG", "LENOVO", "XIAOMI", "HUAWEI"],
  "Kompyuterlar": ["ASUS", "MSI", "HP", "DELL", "GIGABYTE", "NZXT"]
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Lenovo Legion 7', brand: 'LENOVO', price: 46560000, oldPrice: 52000000, stock: 12, image: 'https://picsum.photos/seed/laptop1/400/400', gallery: ['https://picsum.photos/seed/laptop1/400/400', 'https://picsum.photos/seed/laptop1-2/400/400'], category: "Noutbuklar", rating: 5, specs: 'Intel Core Ultra 9, RTX 5080, 64GB RAM', sku: 'LEG-7', reviews: [] },
  { id: 2, name: 'iPhone 17 Pro Max', brand: 'APPLE', price: 21000000, oldPrice: 25000000, stock: 5, image: 'https://picsum.photos/seed/phone1/400/400', gallery: ['https://picsum.photos/seed/phone1/400/400'], category: "Telefonlar", rating: 5, specs: 'A19 Pro Chip, Titanium', sku: 'IP-17', reviews: [] },
  { id: 3, name: 'Treadmill Pro', brand: 'TECHNOGYM', price: 8500000, oldPrice: 10000000, stock: 3, image: 'https://picsum.photos/seed/sport1/400/400', gallery: [], category: "Sport mahsulotlari", rating: 4.5, specs: 'Professional yugurish yo\'lagi', sku: 'TRD-PRO', reviews: [] },
  { id: 4, name: 'iPad Pro 13', brand: 'APPLE', price: 14000000, oldPrice: 16000000, stock: 8, image: 'https://picsum.photos/seed/tablet1/400/400', gallery: [], category: "Planshetlar", rating: 5, specs: 'M4 Chip, 13 inch', sku: 'IPAD-13', reviews: [] },
  { id: 5, name: 'Gaming PC Ultra', brand: 'ASUS', price: 25000000, oldPrice: 28000000, stock: 2, image: 'https://picsum.photos/seed/pc1/400/400', gallery: [], category: "Kompyuterlar", rating: 5, specs: 'RTX 4090, i9', sku: 'PC-ULTRA', reviews: [] },
  { id: 6, name: 'MacBook Air M3', brand: 'APPLE', price: 15000000, stock: 10, image: 'https://picsum.photos/seed/laptop2/400/400', gallery: [], category: "Noutbuklar", rating: 4.8, specs: 'M3 Chip, 8GB, 256GB', sku: 'MAC-M3', reviews: [] },
];
