import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sansi Eco Foods Sri Lanka',
  description:
    'Read our terms and conditions before ordering our natural dehydrated fruit snacks. Learn about delivery, cash-on-delivery payments, and order cancellations.',
};

export default function TermsAndConditionsPage() {
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
                Terms & Conditions
              </li>
            </ol>
          </nav>
          <h1
            className="display-6 fw-bold"
            style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}
          >
            Terms & Conditions
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
                    📝 Terms of Service
                  </span>
                  <h2 className="mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Standard Purchasing Terms
                  </h2>
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    Last Updated: June 18, 2026
                  </p>
                  <hr style={{ borderColor: 'var(--gray-200)', margin: '24px 0' }} />
                </div>

                <div className="terms-content" style={{ lineHeight: 1.8, color: '#444' }}>
                  <p className="mb-4">
                    Welcome to the Sansi Eco Foods website. By placing an order, browsing our products, or using our
                    services, you agree to comply with and be bound by the following Terms & Conditions. Please read them
                    carefully.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    1. General Terms
                  </h4>
                  <p className="mb-4">
                    This website is operated by Sansi Eco Foods, based in Anamaduwa, Sri Lanka. Our products consist of
                    100% natural dehydrated fruit snacks with no added chemicals or artificial preservatives. All transactions
                    and deliveries are governed under the laws of the Democratic Socialist Republic of Sri Lanka.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    2. Product Details and Availability
                  </h4>
                  <p className="mb-4">
                    Since our dehydrated snacks are handcrafted from natural seasonal fruits (including mango, papaya,
                    and banana), product availability is subject to seasonal changes. We make every effort to display accurate
                    stock levels and descriptions. If a product becomes unavailable after you place an order, we will contact
                    you via phone or WhatsApp to offer an alternative or update your delivery timeline.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    3. Orders and Pricing
                  </h4>
                  <p className="mb-4">
                    All prices displayed on the website are in Sri Lankan Rupees (Rs. / LKR) and are subject to change.
                    While we make every effort to avoid pricing errors, in the event that an item is listed incorrectly,
                    we reserve the right to cancel or adjust the order and will notify you immediately.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    4. Shipping, Delivery and Cash on Delivery (COD)
                  </h4>
                  <ul className="mb-4">
                    <li>
                      We provide delivery across Sri Lanka. Delivery is typically executed within 2–5 business days depending
                      on the shipping location (Colombo, Western Province, or Outstation).
                    </li>
                    <li>
                      <strong>Cash on Delivery:</strong> For security and convenience, we primarily use Cash on Delivery.
                      You are required to pay the full order invoice amount (including delivery charges) to the courier personnel
                      upon receiving the package.
                    </li>
                    <li>
                      Please ensure the delivery coordinates (address and phone number) provided are correct. If the courier
                      is unable to reach you after multiple attempts, the order may be cancelled and returned to our workshop.
                    </li>
                  </ul>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    5. Cancellation and Refund Policy
                  </h4>
                  <ul className="mb-4">
                    <li>
                      <strong>Cancellations:</strong> If you wish to cancel an order, please contact us via phone or WhatsApp
                      within 12 hours of placing the order. Once the order has been dispatched with our courier partner,
                      cancellations cannot be processed.
                    </li>
                    <li>
                      <strong>Returns/Refunds:</strong> Due to the perishable nature of dehydrated food products, we do not
                      accept returns. However, customer satisfaction is our top priority. If you receive a damaged package,
                      incorrect item, or have quality concerns, please contact us with proof within 24 hours of delivery. We
                      will assess the concern and send a replacement where appropriate.
                    </li>
                  </ul>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    6. Limitation of Liability
                  </h4>
                  <p className="mb-4">
                    Sansi Eco Foods shall not be liable for any direct or indirect delays or failures in delivery resulting
                    from circumstances beyond our control, including courier service delays, severe weather conditions,
                    or natural disasters.
                  </p>

                  <h4 className="mt-4 mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    7. Modifications to Terms
                  </h4>
                  <p className="mb-4">
                    We reserve the right to update or modify these Terms & Conditions at any time without prior notice.
                    Your continued use of the website following any changes constitutes acceptance of the new terms.
                  </p>
                </div>

                <div className="mt-5 text-center">
                  <Link href="/products" className="btn btn-primary px-4 py-2" style={{ borderRadius: '30px', fontWeight: 600 }}>
                    Browse Our Menu <i className="fas fa-arrow-right ms-2"></i>
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
