import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
  increment,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebase';
import type {
  Order,
  OrderStatus,
  Product,
  Category,
  Customer,
  SiteSettings,
  Coupon,
  AdminUser,
  StatusHistoryEntry,
} from '../../shared/types';

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ordersToday, ordersMonth, pendingOrders, allOrders] = await Promise.all([
    getDocs(query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(todayStart))
    )),
    getDocs(query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(monthStart))
    )),
    getDocs(query(
      collection(db, 'orders'),
      where('orderStatus', '==', 'Pending')
    )),
    getDocs(query(
      collection(db, 'orders'),
      where('orderStatus', '==', 'Delivered'),
      where('createdAt', '>=', Timestamp.fromDate(monthStart))
    )),
  ]);

  const revenueThisMonth = allOrders.docs.reduce(
    (sum, d) => sum + ((d.data() as Order).totalLKR ?? 0),
    0
  );

  return {
    ordersToday: ordersToday.size,
    ordersThisMonth: ordersMonth.size,
    revenueThisMonth,
    pendingOrders: pendingOrders.size,
  };
}

export async function getRecentOrders(count = 10): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getLowStockProducts(): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  return products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  let q;
  if (status) {
    q = query(
      collection(db, 'orders'),
      where('orderStatus', '==', status),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  } else {
    q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminUid: string,
  note?: string,
  cancellationReason?: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);

  const historyEntry: StatusHistoryEntry = {
    status: newStatus,
    changedAt: Timestamp.now(),
    changedByUid: adminUid,
    note: note ?? '',
  };

  const updateData: Record<string, unknown> = {
    orderStatus: newStatus,
    updatedAt: serverTimestamp(),
    statusHistory: [...(await (await getDoc(orderRef)).data()?.statusHistory ?? []), historyEntry],
  };

  if (newStatus === 'Cancelled' && cancellationReason) {
    updateData.cancellationReason = cancellationReason;
  }

  await updateDoc(orderRef, updateData);

  // Restore stock if cancelling
  if (newStatus === 'Cancelled') {
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      const order = orderSnap.data() as Order;
      const batch = writeBatch(db);
      for (const item of order.items) {
        const productRef = doc(db, 'products', item.productId);
        batch.update(productRef, {
          stockQuantity: increment(item.quantity),
          inStock: true,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  }
}

export async function updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    trackingNumber,
    updatedAt: serverTimestamp(),
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const q = query(collection(db, 'products'), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

export async function updateProductStock(id: string, stockQuantity: number): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    stockQuantity,
    inStock: stockQuantity > 0,
    updatedAt: serverTimestamp(),
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'categories'), data);
  return ref.id;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const q = query(
    collection(db, 'customers'),
    orderBy('lastOrderAt', 'desc'),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const snap = await getDoc(doc(db, 'customers', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Customer;
}

export async function getCustomerOrders(phone: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('customer.phone', '==', phone),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function updateCustomerNotes(customerId: string, notes: string): Promise<void> {
  await updateDoc(doc(db, 'customers', customerId), { notes });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'global'));
  if (!snap.exists()) return null;
  return snap.data() as SiteSettings;
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usageCount'>): Promise<string> {
  const ref = await addDoc(collection(db, 'coupons'), {
    ...data,
    usageCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<void> {
  await updateDoc(doc(db, 'coupons', id), data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', id));
}

// ─── Users (Admin) ────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as AdminUser);
}

export async function seedInitialData(): Promise<void> {
  // Check if already seeded
  const existingProducts = await getDocs(query(collection(db, 'products'), limit(1)));
  if (!existingProducts.empty) return;

  const batch = writeBatch(db);

  // Seed categories
  const categories = [
    { name: 'Jujubes', parentName: 'Dehydrated Fruits', slug: 'jujubes', sortOrder: 1, isActive: true },
    { name: 'Fruit Chips & Coins', parentName: 'Dehydrated Fruits', slug: 'fruit-chips-coins', sortOrder: 2, isActive: true },
    { name: 'Mixed Assortments', parentName: 'Dehydrated Fruits', slug: 'mixed-assortments', sortOrder: 3, isActive: true },
    { name: 'Seasonal Specials', parentName: 'Dehydrated Fruits', slug: 'seasonal-specials', sortOrder: 4, isActive: false },
    { name: 'Gift Packs', parentName: 'Dehydrated Fruits', slug: 'gift-packs', sortOrder: 5, isActive: false },
  ];

  const categoryRefs: Record<string, string> = {};
  for (const cat of categories) {
    const catRef = doc(collection(db, 'categories'));
    batch.set(catRef, cat);
    categoryRefs[cat.name] = catRef.id;
  }

  // Seed products
  const products = [
    { name: 'Dehydrated Mango Jujubes', skuCode: 'SEF-001', categoryName: 'Jujubes', weightGrams: 60, priceLKR: 490, compareAtPriceLKR: 550, ingredients: 'Mango, Sugar', description: 'Sun-ripened Sri Lankan mangoes, dehydrated to perfection and rolled into delightful jujubes. Naturally sweet, chewy, and bursting with tropical mango flavour — with absolutely no added chemicals or artificial preservatives.', sortOrder: 1, stockQuantity: 100, images: ['/images/products/mango-jujubes.png'] },
    { name: 'Dehydrated Papaya Jujubes', skuCode: 'SEF-002', categoryName: 'Jujubes', weightGrams: 60, priceLKR: 480, compareAtPriceLKR: 530, ingredients: 'Papaya, Sugar', description: 'Fresh Sri Lankan papaya transformed into soft, chewy jujubes. Naturally sweet with a hint of tropical fragrance. Perfect healthy snack for the whole family.', sortOrder: 2, stockQuantity: 100, images: ['/images/products/papaya-jujubes.png'] },
    { name: 'Dehydrated Cashew Jujubes', skuCode: 'SEF-003', categoryName: 'Jujubes', weightGrams: 50, priceLKR: 530, compareAtPriceLKR: 600, ingredients: 'Cashew, Sugar', description: 'Premium Sri Lankan cashews crafted into golden, chewy jujubes. Rich, buttery flavour with natural sweetness — a truly unique and indulgent snack.', sortOrder: 3, stockQuantity: 80, images: ['/images/products/cashew-jujubes.png'] },
    { name: 'Dehydrated Banana Coins', skuCode: 'SEF-004', categoryName: 'Fruit Chips & Coins', weightGrams: 50, priceLKR: 460, compareAtPriceLKR: 520, ingredients: 'Banana, Sugar', description: 'Naturally sweet banana slices dried to golden coin-shaped perfection. Crispy yet chewy, these banana coins are a wholesome snack packed with natural potassium and energy.', sortOrder: 4, stockQuantity: 120, images: ['/images/products/banana-coins.png'] },
    { name: 'Dehydrated Bilinpalam', skuCode: 'SEF-005', categoryName: 'Fruit Chips & Coins', weightGrams: 50, priceLKR: 470, compareAtPriceLKR: 530, ingredients: 'Bilin Fruit, Sugar', description: 'A traditional Sri Lankan favourite — bilin fruit (Averrhoa bilimbi) dehydrated to preserve its unique tangy-sweet character. A rare and authentic Sri Lankan snacking experience.', sortOrder: 5, stockQuantity: 90, images: ['/images/products/bilinpalam.png'] },
    { name: 'Dehydrated Mixed Fruits', skuCode: 'SEF-006', categoryName: 'Mixed Assortments', weightGrams: 60, priceLKR: 510, compareAtPriceLKR: 580, ingredients: 'Mixed Tropical Fruits, Sugar', description: 'A delightful assortment of our finest dehydrated tropical fruits — mango, papaya, and banana — in a single packet. Perfect for sharing or gifting.', sortOrder: 6, stockQuantity: 75, images: ['/images/products/mixed-fruits.png'] },
  ];

  for (const product of products) {
    const { categoryName, ...rest } = product;
    const productRef = doc(collection(db, 'products'));
    batch.set(productRef, {
      ...rest,
      id: productRef.id,
      categoryId: categoryRefs[categoryName] ?? '',
      slug: rest.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      packetDimensions: '10cm x 12cm',
      lowStockThreshold: 10,
      inStock: true,
      shelfLife: '6 months',
      healthTags: ['No Preservatives', '100% Natural', 'No Chemicals'],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Seed settings
  const settingsRef = doc(db, 'settings', 'global');
  batch.set(settingsRef, {
    announcementBarEnabled: true,
    announcementBarText: '🌿 Free delivery on orders over Rs. 2,500 island-wide!',
    heroSlides: [],
    featuredProductIds: [],
    shippingRates: { colombo: 250, westernProvince: 300, outstation: 400 },
    minOrderForFreeShipping: 2500,
    whatsappNumber: '94771234567',
    contactEmail: 'info@sansiecofoods.com',
    businessAddress: 'Anamaduwa, North Western Province, Sri Lanka',
    facebookUrl: 'https://web.facebook.com/sansiecofoods',
    instagramUrl: 'https://www.instagram.com/sansiecofoods',
    tiktokUrl: 'https://www.tiktok.com/@sansiecofood',
    metaPixelId: '',
    tiktokPixelId: '',
  });

  await batch.commit();
}
