import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Product,
  Category,
  SiteSettings,
  Coupon,
  Order,
  Customer,
  CartItem,
  CustomerFormData,
  ContactMessage,
} from '../../shared/types';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (!snap.exists()) return null;
    return snap.data() as SiteSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(categoryId?: string): Promise<Product[]> {
  try {
    let q;
    if (categoryId) {
      q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        where('categoryId', '==', categoryId),
        orderBy('sortOrder', 'asc')
      );
    } else {
      q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(
      collection(db, 'products'),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

export async function getFeaturedProducts(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const products: Product[] = [];
    for (const id of ids.slice(0, 4)) {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        products.push({ id: snap.id, ...snap.data() } as Product);
      }
    }
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductsByCategory(
  categoryId: string,
  excludeId?: string
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      where('categoryId', '==', categoryId),
      orderBy('sortOrder', 'asc'),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Product))
      .filter((p) => p.id !== excludeId)
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

// ─── Coupon Validation ────────────────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  subtotalLKR: number
): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
  try {
    const q = query(
      collection(db, 'coupons'),
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { valid: false, discount: 0, error: 'Invalid coupon code.' };

    const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;

    if (coupon.expiresAt.toDate() < new Date()) {
      return { valid: false, discount: 0, error: 'This coupon has expired.' };
    }
    if (coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, error: 'This coupon has reached its usage limit.' };
    }
    if (subtotalLKR < coupon.minOrderLKR) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum order of Rs. ${coupon.minOrderLKR} required for this coupon.`,
      };
    }

    const discount =
      coupon.type === 'percentage'
        ? Math.round(subtotalLKR * (coupon.value / 100))
        : coupon.value;

    return { valid: true, discount, coupon };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, discount: 0, error: 'Could not validate coupon. Please try again.' };
  }
}

// ─── Order ────────────────────────────────────────────────────────────────────

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// ─── Contact Message ──────────────────────────────────────────────────────────

export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const msgRef = doc(collection(db, 'contact_messages'));
    await setDoc(msgRef, {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return { success: false, error: 'Failed to send message. Please try again.' };
  }
}

// ─── Generate Order Number ────────────────────────────────────────────────────

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = doc(db, 'counters', `orders_${year}`);

  const newCount = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let count = 1;
    if (counterSnap.exists()) {
      count = (counterSnap.data().count as number) + 1;
      transaction.update(counterRef, { count });
    } else {
      transaction.set(counterRef, { count: 1, year });
    }
    return count;
  });

  return `SEF-${year}-${String(newCount).padStart(4, '0')}`;
}

// ─── Place Order (full transaction) ──────────────────────────────────────────

export async function createOrder(
  cartItems: CartItem[],
  customerData: CustomerFormData,
  shippingLKR: number,
  coupon: { code: string; discount: number } | null
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const orderNumber = await generateOrderNumber();
    const subtotalLKR = cartItems.reduce(
      (sum, item) => sum + item.priceLKR * item.quantity,
      0
    );
    const discountLKR = coupon?.discount ?? 0;
    const totalLKR = Math.max(0, subtotalLKR + shippingLKR - discountLKR);

    const orderId = await runTransaction(db, async (transaction) => {
      // 1. Read and verify stock for all items
      const productRefs = cartItems.map((item) => doc(db, 'products', item.productId));
      const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

      for (let i = 0; i < cartItems.length; i++) {
        const snap = productSnaps[i];
        if (!snap.exists()) {
          throw new Error(`Product "${cartItems[i].name}" no longer exists.`);
        }
        const product = snap.data() as Product;
        if (!product.inStock || product.stockQuantity < cartItems[i].quantity) {
          throw new Error(
            `Sorry, "${cartItems[i].name}" is now out of stock. Please update your cart.`
          );
        }
      }

      // 2. Decrement stock for each item
      for (let i = 0; i < cartItems.length; i++) {
        const newQty =
          (productSnaps[i].data() as Product).stockQuantity - cartItems[i].quantity;
        transaction.update(productRefs[i], {
          stockQuantity: newQty,
          inStock: newQty > 0,
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Create order document
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        orderNumber,
        customer: {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          deliveryAddress: customerData.deliveryAddress,
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          priceLKR: item.priceLKR,
          subtotalLKR: item.priceLKR * item.quantity,
        })),
        subtotalLKR,
        shippingLKR,
        discountLKR,
        couponCode: coupon?.code ?? null,
        totalLKR,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        transactionId: null,
        gatewayResponse: null,
        orderStatus: 'Pending',
        orderNotes: customerData.orderNotes,
        cancellationReason: null,
        trackingNumber: null,
        statusHistory: [
          {
            status: 'Pending',
            changedAt: Timestamp.now(),
            changedByUid: 'system',
            note: 'Order placed by customer',
          },
        ],
        emailSent: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      transaction.set(orderRef, orderData);

      // 4. Upsert customer document
      const customerPhone = customerData.phone.replace(/\D/g, '');
      const customerRef = doc(db, 'customers', customerPhone);
      const customerSnap = await transaction.get(customerRef);

      if (customerSnap.exists()) {
        transaction.update(customerRef, {
          totalOrders: increment(1),
          totalSpentLKR: increment(totalLKR),
          lastOrderAt: serverTimestamp(),
          // Update address if new
        });
      } else {
        transaction.set(customerRef, {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          addresses: [customerData.deliveryAddress],
          totalOrders: 1,
          totalSpentLKR: totalLKR,
          firstOrderAt: serverTimestamp(),
          lastOrderAt: serverTimestamp(),
          notes: '',
          createdAt: serverTimestamp(),
        });
      }

      // 5. Increment coupon usage if applicable
      if (coupon?.code) {
        const couponQuery = query(
          collection(db, 'coupons'),
          where('code', '==', coupon.code.toUpperCase()),
          limit(1)
        );
        // We can't run queries in transactions, so we use a separate update
        // This is handled after the transaction
      }

      return orderRef.id;
    });

    // Update coupon usage count outside transaction
    if (coupon?.code) {
      try {
        const couponQuery = query(
          collection(db, 'coupons'),
          where('code', '==', coupon.code.toUpperCase()),
          limit(1)
        );
        const couponSnap = await getDocs(couponQuery);
        if (!couponSnap.empty) {
          await updateDoc(couponSnap.docs[0].ref, { usageCount: increment(1) });
        }
      } catch {
        // Non-critical, don't fail the order
      }
    }

    return { success: true, orderId, orderNumber };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to place order.';
    console.error('Error creating order:', error);
    return { success: false, error: message };
  }
}
