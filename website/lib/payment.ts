import type { CartItem, CustomerFormData } from '../../shared/types';
import { createOrder } from './firestore';
import { sendOrderConfirmation } from './emailjs';
import { SHIPPING_DISTRICT_TIER } from '../../shared/types';
import type { SiteSettings } from '../../shared/types';

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * Modular payment service.
 * Currently only COD is implemented.
 * Future payment gateways (PayHere, Stripe, iPay) should be added here
 * by adding new cases to the paymentMethod switch.
 */
export async function placeOrder(
  cartItems: CartItem[],
  customerData: CustomerFormData,
  coupon: { code: string; discount: number } | null,
  paymentMethod: 'COD',
  settings: SiteSettings,
  customerId?: string | null
): Promise<PlaceOrderResult> {
  if (paymentMethod !== 'COD') {
    return { success: false, error: 'Selected payment method is not yet supported.' };
  }

  // Calculate shipping based on district
  const shippingLKR = calculateShipping(
    customerData.deliveryAddress.district,
    cartItems,
    coupon,
    settings
  );

  // Run the Firestore transaction (stock decrement + order creation)
  const result = await createOrder(cartItems, customerData, shippingLKR, coupon, customerId);

  if (!result.success) {
    return result;
  }

  // Send email confirmation (non-blocking — don't fail order if email fails)
  if (customerData.email && result.orderId && result.orderNumber) {
    try {
      const subtotalLKR = cartItems.reduce(
        (sum, item) => sum + item.priceLKR * item.quantity,
        0
      );
      const discountLKR = coupon?.discount ?? 0;
      const totalLKR = Math.max(0, subtotalLKR + shippingLKR - discountLKR);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const emailItems = cartItems.map((item) => {
        let imageUrl = item.image || '';
        if (imageUrl && !imageUrl.startsWith('http') && origin) {
          imageUrl = `${origin}${imageUrl}`;
        }
        return {
          name: item.name,
          units: item.quantity,
          price: (item.priceLKR * item.quantity).toLocaleString(),
          item: imageUrl,
        };
      });

      await sendOrderConfirmation({
        customerEmail: customerData.email,
        orderNumber: result.orderNumber,
        orders: emailItems,
        shippingCost: shippingLKR.toLocaleString(),
        taxCost: '0',
        totalCost: totalLKR.toLocaleString(),
      });
    } catch (emailError) {
      console.error('Email confirmation failed (non-critical):', emailError);
    }
  }

  return result;
}

function calculateShipping(
  district: string,
  cartItems: CartItem[],
  coupon: { code: string; discount: number } | null,
  settings: SiteSettings
): number {
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceLKR * item.quantity, 0);
  const discount = coupon?.discount ?? 0;
  const orderValue = subtotal - discount;

  if (orderValue >= settings.minOrderForFreeShipping) {
    return 0;
  }

  const tier = SHIPPING_DISTRICT_TIER[district] ?? 'outstation';
  return settings.shippingRates[tier];
}

export { calculateShipping };
