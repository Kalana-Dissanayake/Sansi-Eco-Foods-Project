import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sansi Eco Foods Sri Lanka',
  description:
    'Learn how Sansi Eco Foods collects, uses, and safeguards your personal information when you browse or place orders for our natural dehydrated fruit snacks.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid px-lg-5 position-relative">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Privacy Policy
              </li>
            </ol>
          </nav>
          <h1
            className="display-6 fw-bold"
            style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}
          >
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div
                className="bg-white p-4 p-md-5 rounded shadow-sm border"
                style={{ borderColor: 'var(--gray-200)' }}
              >
                <div className="mb-4">
                  <span
                    className="d-inline-block mb-2 px-3 py-1 rounded-pill"
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    🔒 Your Privacy Matters
                  </span>
                  <h2 className="mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    How We Protect Your Information
                  </h2>
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    Last Updated: June 18, 2026
                  </p>
                  <hr style={{ borderColor: 'var(--gray-200)', margin: '24px 0' }} />
                </div>

                <div className="privacy-content" style={{ lineHeight: 1.8, color: '#444' }}>
                  <p className="mb-4">
                    At Sansi Eco Foods, we are committed to protecting the privacy of our customers and visitors.
                    This Privacy Policy describes how we collect, use, and protect your personal information when
                    you visit our website, place an order for our 100% natural dehydrated fruit snacks, or communicate with us.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    1. Information We Collect
                  </h4>
                  <p className="mb-3">
                    We collect information from you when you interact with our website. This includes:
                  </p>
                  <ul className="mb-4">
                    <li>
                      <strong>Order Details:</strong> When you place an order, we collect your name, delivery address,
                      contact phone number (necessary for delivery coordinates and WhatsApp updates), and email address.
                    </li>
                    <li>
                      <strong>Inquiries:</strong> When you contact us using our contact forms, we collect your name,
                      email address, and the content of your message.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> We collect aggregate information about how visitors navigate and interact
                      with our website (such as pages visited, load times, etc.) using tracking pixels and analytics tools to
                      help improve your experience.
                    </li>
                  </ul>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    2. How We Use Your Information
                  </h4>
                  <p className="mb-3">
                    We process your information to provide our services, which includes:
                  </p>
                  <ul className="mb-4">
                    <li>Fulfilling and processing orders, including organizing island-wide Cash on Delivery shipping.</li>
                    <li>Providing order status updates (via SMS, WhatsApp, or email).</li>
                    <li>Responding to your questions, comments, or customer support requests.</li>
                    <li>Improving our website performance, layout, and product offerings.</li>
                    <li>Sending occasional promotional updates if you have opted in to receive them.</li>
                  </ul>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    3. Data Retention and Security
                  </h4>
                  <p className="mb-4">
                    We store customer order information securely. Since we specialize in Cash on Delivery (COD) and do not
                    directly process online credit card details on our site, we do not store sensitive payment card information.
                    We take reasonable organizational and technical measures to protect your contact and delivery data
                    against unauthorized access, alteration, or disclosure.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    4. Third-Party Sharing
                  </h4>
                  <p className="mb-4">
                    We do not sell, trade, or transfer your personal information to outside parties. This does not include
                    trusted third-party delivery services (courier partners in Sri Lanka) who assist us in operating our
                    delivery network and bringing our products to your doorstep. These partners are obligated to keep your
                    information confidential and use it solely for executing delivery.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    5. Cookies and Analytics
                  </h4>
                  <p className="mb-4">
                    We use cookies to remember items in your shopping cart and understand site preferences. You can choose
                    to disable cookies through your browser settings, though doing so might prevent certain features like
                    the shopping cart from functioning properly. We also integrate standard social media pixels (such as Meta
                    Pixel) to measure marketing effectiveness and optimize advertising.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    6. Contact Us
                  </h4>
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy or how we handle your data, please feel free to reach
                    out to us through our contact page or email us at{' '}
                    <a href="mailto:info@sansiecofoods.com" className="text-primary font-weight-bold">
                      info@sansiecofoods.com
                    </a>.
                  </p>
                </div>

                <div className="mt-5 text-center">
                  <Link href="/products" className="btn btn-primary px-4 py-2" style={{ borderRadius: '30px', fontWeight: 600 }}>
                    Shop Dehydrated Fruits <i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
