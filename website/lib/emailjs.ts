import emailjs from '@emailjs/browser';

interface EmailJSOrderItem {
  name: string;
  units: number;
  price: string;
  image_url: string;
}

interface OrderConfirmationData {
  customerEmail: string;
  orderNumber: string;
  orders: EmailJSOrderItem[];
  shippingCost: string;
  taxCost: string;
  totalCost: string;
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured. Skipping email send.');
    return;
  }

  const templateParams = {
    to_email: data.customerEmail, // Standard recipient email parameter
    email: data.customerEmail,    // matches {{email}} in footer
    order_id: data.orderNumber,   // matches {{order_id}} in template header
    orders: data.orders,          // matches {{#orders}} ... {{/orders}}
    cost: {                       // matches {{cost.shipping}}, {{cost.tax}}, {{cost.total}}
      shipping: data.shippingCost,
      tax: data.taxCost,
      total: data.totalCost,
    },
  };

  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}

export async function sendOTP(email: string, passcode: string): Promise<void> {
  // Use a server-side API route to avoid CORS/domain-allowlist restrictions on Vercel.
  // The browser @emailjs/browser SDK is blocked by EmailJS when the domain isn't on 
  // the allowlist - calling our own API route bypasses that entirely.
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), passcode }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send OTP email');
  }
}
