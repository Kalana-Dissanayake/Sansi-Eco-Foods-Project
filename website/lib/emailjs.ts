import emailjs from '@emailjs/browser';

interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderItems: string[];
  totalLKR: number;
  deliveryAddress: string;
  whatsappNumber: string;
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
    to_email: data.customerEmail,
    customer_name: data.customerName,
    order_number: data.orderNumber,
    order_items: data.orderItems.join('\n'),
    total_lkr: `Rs. ${data.totalLKR.toLocaleString()}`,
    payment_method: 'Cash on Delivery',
    delivery_address: data.deliveryAddress,
    estimated_delivery: '2–5 business days',
    whatsapp_link: `https://wa.me/${data.whatsappNumber}`,
  };

  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}
