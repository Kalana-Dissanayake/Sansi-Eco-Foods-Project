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
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured. Skipping OTP email send. Passcode is:', passcode);
    return;
  }

  const templateParams = {
    email: email.trim(),
    passcode: passcode,
    time: '15 minutes',
    logo_url: 'https://res.cloudinary.com/df1601dip/image/upload/q_auto/f_auto/v1781681836/bqeawlmwhhd8eimjwsqn.png',
  };

  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}
