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
  addDoc,
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
  DeliveryAddress,
  NotificationType,
  Review,
} from '../../shared/types';

// ─── Notification Helper (fire-and-forget) ──────────────────────────────────

async function createNotification(data: {
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  customerId?: string;
  customerName?: string;
  messageId?: string;
  linkTo?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Non-critical — don't block primary operations
    console.error('Failed to write notification:', err);
  }
}

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

    // Fire message notification (non-blocking)
    createNotification({
      type: 'message',
      title: 'New Customer Message',
      body: `${data.name} sent a message: "${data.subject || data.message.slice(0, 60)}"`,
      messageId: msgRef.id,
      customerName: data.name,
      linkTo: '/notifications',
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
  coupon: { code: string; discount: number } | null,
  customerId?: string | null
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const orderNumber = await generateOrderNumber();
    const subtotalLKR = cartItems.reduce(
      (sum, item) => sum + item.priceLKR * item.quantity,
      0
    );
    const discountLKR = coupon?.discount ?? 0;
    const totalLKR = Math.max(0, subtotalLKR + shippingLKR - discountLKR);

    // Collect stock info to check thresholds AFTER the transaction
    const stockInfo: { id: string; name: string; newQty: number; threshold: number }[] = [];

    const orderId = await runTransaction(db, async (transaction) => {
      // 1. Read all required data first (all reads must precede all writes)
      const productRefs = cartItems.map((item) => doc(db, 'products', item.productId));
      const customerDocId = customerId || customerData.phone.replace(/\D/g, '');
      const customerRef = doc(db, 'customers', customerDocId);

      const [productSnaps, customerSnap] = await Promise.all([
        Promise.all(productRefs.map((ref) => transaction.get(ref))),
        transaction.get(customerRef),
      ]);

      // 2. Verify stock
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

      // 3. Decrement stock for each item (Write)
      for (let i = 0; i < cartItems.length; i++) {
        const product = productSnaps[i].data() as Product;
        const newQty = product.stockQuantity - cartItems[i].quantity;
        transaction.update(productRefs[i], {
          stockQuantity: newQty,
          inStock: newQty > 0,
          updatedAt: serverTimestamp(),
        });
        // Capture for post-transaction stock alert check
        stockInfo.push({
          id: cartItems[i].productId,
          name: product.name,
          newQty,
          threshold: product.lowStockThreshold,
        });
      }

      // 4. Create order document (Write)
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        orderNumber,
        customerId: customerId || null,
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

      // 5. Upsert customer document (Write)
      if (customerSnap.exists()) {
        transaction.update(customerRef, {
          totalOrders: increment(1),
          totalSpentLKR: increment(totalLKR),
          lastOrderAt: serverTimestamp(),
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

      return orderRef.id;
    });

    // Check for stock alerts on each purchased product (non-blocking, after transaction)
    for (const item of stockInfo) {
      if (item.newQty <= item.threshold) {
        createNotification({
          type: 'stock_alert',
          title: 'Low Stock Alert',
          body: `"${item.name}" is running low after an order. Only ${item.newQty} unit${item.newQty === 1 ? '' : 's'} remaining (threshold: ${item.threshold}).`,
          productId: item.id,
          productName: item.name,
          linkTo: `/products`,
        });
      }
    }

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

    // Fire order_placed notification (non-blocking)
    const notifSubtotal = cartItems.reduce((sum, item) => sum + item.priceLKR * item.quantity, 0);
    const notifDiscount = coupon?.discount ?? 0;
    const notifTotal = Math.max(0, notifSubtotal + shippingLKR - notifDiscount);
    createNotification({
      type: 'order_placed',
      title: 'New Order Placed',
      body: `${customerData.name} placed order ${orderNumber} for Rs. ${notifTotal.toLocaleString()}.`,
      orderId,
      orderNumber,
      customerName: customerData.name,
      linkTo: `/orders/${orderId}`,
    });

    return { success: true, orderId, orderNumber };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to place order.';
    console.error('Error creating order:', error);
    return { success: false, error: message };
  }
}

// ─── Customer Helpers ────────────────────────────────────────────────────────

export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'customers'),
      where('email', '==', email.toLowerCase().trim()),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error('Error checking if email exists:', error);
    return false;
  }
}

export async function getCustomerProfile(uid: string): Promise<Customer | null> {
  try {
    const snap = await getDoc(doc(db, 'customers', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Customer;
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }
}

export async function createCustomerProfile(
  uid: string,
  data: { name: string; phone: string; email: string; address: DeliveryAddress }
): Promise<void> {
  try {
    await setDoc(doc(db, 'customers', uid), {
      name: data.name,
      phone: data.phone,
      email: data.email,
      addresses: [data.address],
      totalOrders: 0,
      totalSpentLKR: 0,
      firstOrderAt: null,
      lastOrderAt: null,
      lastDeliveryAddress: data.address,
      notes: '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating customer profile:', error);
    throw error;
  }
}

export async function updateCustomerProfile(
  uid: string,
  data: { name: string; phone: string; email: string; address: DeliveryAddress }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'customers', uid), {
      name: data.name,
      phone: data.phone,
      email: data.email,
      addresses: [data.address],
      lastDeliveryAddress: data.address,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
}

export async function getCustomerOrdersByUid(uid: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
}

export async function cancelOrder(
  orderId: string,
  cancellationReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, 'orders', orderId);

    await runTransaction(db, async (transaction) => {
      // 1. All reads first: Read order document
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Order does not exist.');
      }

      const order = orderSnap.data() as Order;
      if (order.orderStatus !== 'Pending') {
        throw new Error('Only pending orders can be cancelled.');
      }

      // Read all product documents to be updated before any write operations
      const productRefs = order.items.map((item) => doc(db, 'products', item.productId));
      const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

      // 2. All writes: Update order document status and statusHistory
      const newHistoryEntry = {
        status: 'Cancelled',
        changedAt: Timestamp.now(),
        changedByUid: order.customerId || 'customer',
        note: cancellationReason || 'Order cancelled by customer',
      };

      transaction.update(orderRef, {
        orderStatus: 'Cancelled',
        cancellationReason: cancellationReason || 'Cancelled by customer',
        statusHistory: [...(order.statusHistory || []), newHistoryEntry],
        updatedAt: serverTimestamp(),
      });

      // Restore stock for all items (Writes)
      for (let i = 0; i < order.items.length; i++) {
        const productSnap = productSnaps[i];
        if (productSnap.exists()) {
          const product = productSnap.data() as Product;
          const newQty = product.stockQuantity + order.items[i].quantity;
          transaction.update(productRefs[i], {
            stockQuantity: newQty,
            inStock: true,
            updatedAt: serverTimestamp(),
          });
        }
      }
    });

    // Fire order_cancelled notification (non-blocking)
    createNotification({
      type: 'order_cancelled',
      title: 'Order Cancelled by Customer',
      body: `A customer cancelled their order. Reason: ${cancellationReason || 'No reason provided'}.`,
      orderId,
      linkTo: `/orders/${orderId}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel order.',
    };
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function submitReview(data: {
  customerId: string;
  productId: string;
  productName: string;
  productSlug: string;
  reviewerName: string;
  location: string;
  rating: number;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if this customer already submitted a review for this product
    const existing = query(
      collection(db, 'reviews'),
      where('customerId', '==', data.customerId),
      where('productId', '==', data.productId),
      limit(1)
    );
    const existingSnap = await getDocs(existing);
    if (!existingSnap.empty) {
      return { success: false, error: 'You have already submitted a review for this product.' };
    }

    await addDoc(collection(db, 'reviews'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create a review notification for the admin panel
    await createNotification({
      type: 'review',
      title: 'New Review Submitted',
      body: `${data.reviewerName} submitted a ${data.rating}-star review for "${data.productName}".`,
      productId: data.productId,
      productName: data.productName,
      customerId: data.customerId,
      customerName: data.reviewerName,
      linkTo: '/reviews',
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'Failed to submit review. Please try again.' };
  }
}

export async function getApprovedReviews(maxCount = 12): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return [];
  }
}

export async function getCustomerReviewForProduct(
  customerId: string,
  productId: string
): Promise<Review | null> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('customerId', '==', customerId),
      where('productId', '==', productId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Review;
  } catch (error) {
    console.error('Error fetching customer review:', error);
    return null;
  }
}
