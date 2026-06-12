import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sansi Eco Foods Admin',
  description: 'Admin dashboard for Sansi Eco Foods',
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
