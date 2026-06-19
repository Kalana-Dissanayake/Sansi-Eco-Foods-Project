import type { Metadata } from 'next';
import { Lora, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getSettings } from '../lib/firestore';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sansi Eco Foods – Natural Dehydrated Fruit Snacks | Sri Lanka',
  description:
    'Premium 100% natural dehydrated fruit snacks handcrafted in Anamaduwa, Sri Lanka. No chemicals, no preservatives. Mango, Papaya, Banana jujubes & more. Island-wide Cash on Delivery.',
  keywords:
    'dehydrated fruits Sri Lanka, natural fruit snacks, mango jujubes, papaya snacks, Anamaduwa, Sansi Eco Foods, healthy snacks Sri Lanka',
  openGraph: {
    title: 'Sansi Eco Foods – Natural Dehydrated Fruit Snacks',
    description: 'Premium 100% natural dehydrated fruit snacks from Sri Lanka.',
    type: 'website',
    locale: 'en_LK',
  },
};

// Default settings fallback
const DEFAULT_SETTINGS = {
  announcementBarEnabled: true,
  announcementBarText: '🌿 Free delivery on orders over Rs. 2,500 island-wide!',
  whatsappNumber: '94771234567',
  contactEmail: 'info@sansiecofoods.com',
  businessAddress: 'Anamaduwa, North Western Province, Sri Lanka',
  facebookUrl: 'https://web.facebook.com/sansiecofoods',
  instagramUrl: 'https://www.instagram.com/sansiecofoods',
  tiktokUrl: 'https://www.tiktok.com/@sansiecofood',
  metaPixelId: '',
  tiktokPixelId: '',
  heroSlides: [],
  featuredProductIds: [],
  shippingRates: { colombo: 250, westernProvince: 300, outstation: 400 },
  minOrderForFreeShipping: 2500,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = (await getSettings()) ?? DEFAULT_SETTINGS;

  return (
    <html lang="en" className={`${lora.variable} ${openSans.variable}`}>
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
        />
        {/* Bootstrap 5 CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css"
        />
        {/* Animate.css for WOW.js */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        {/* Owl Carousel */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-open-sans), sans-serif' }}>
        {/* Meta Pixel */}
        {settings.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.metaPixelId}');
            fbq('track', 'PageView');
          `}</Script>
        )}

        {/* TikTok Pixel */}
        {settings.tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">{`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${settings.tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}</Script>
        )}

        <AuthProvider>
          <CartProvider>
            <AnnouncementBar
              enabled={settings.announcementBarEnabled}
              text={settings.announcementBarText}
            />
            <Navbar />
            <main className="page-fade-in">{children}</main>
            <Footer
              phone={settings.whatsappNumber}
              email={settings.contactEmail}
              address={settings.businessAddress}
              whatsappNumber={settings.whatsappNumber}
              facebookUrl={settings.facebookUrl}
              instagramUrl={settings.instagramUrl}
              tiktokUrl={settings.tiktokUrl}
            />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#4a7c59', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </AuthProvider>

        {/* Bootstrap 5 JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
        />
        {/* jQuery (required for Owl Carousel & WOW) */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
          strategy="beforeInteractive"
        />
        {/* Owl Carousel */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"
          strategy="beforeInteractive"
        />
        {/* WOW.js */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js"
          strategy="beforeInteractive"
        />
        <Script id="init-wow" strategy="lazyOnload">
          {`
            if (typeof window !== 'undefined' && window.WOW) {
              new WOW().init();
            }
          `}
        </Script>
      </body>
    </html>
  );
}
