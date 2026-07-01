import { redirect } from 'next/navigation';

export default function AdminRedirectPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://sansi-eco-foods-admin.vercel.app';
  redirect(adminUrl);
  return null;
}
