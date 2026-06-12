import Link from 'next/link';

interface FooterProps {
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export default function Footer({
  phone,
  email,
  address,
  whatsappNumber,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: FooterProps) {
  return (
    <footer className="footer mt-auto" style={{ background: 'var(--dark)', color: '#adb5bd' }}>
      {/* Footer Top */}
      <div className="container-fluid px-lg-5 pt-5 pb-4">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img
                src="/images/sansi-logo.png"
                alt="Sansi Eco Foods Logo"
                style={{ height: '35px', marginRight: '10px' }}
              />
              <h4 className="m-0" style={{
                fontFamily: 'var(--font-open-sans), sans-serif',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ color: '#ff6a00' }}>SANSI</span>
                <span style={{ color: '#00d26a' }}>ECO</span>
                <span style={{
                  background: 'linear-gradient(to right, #ff6a00, #00d26a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>FOODS</span>
              </h4>
            </div>
            <p className="mb-3" style={{ lineHeight: 1.8, fontSize: '14px' }}>
              Sri Lanka&apos;s premium dehydrated natural fruit snacks — handcrafted in Anamaduwa
              with 100% natural ingredients, zero chemicals, and zero preservatives.
            </p>
            <div className="d-flex gap-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm-square btn-outline-secondary rounded-circle"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm-square btn-outline-secondary rounded-circle"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm-square btn-outline-secondary rounded-circle"
                  aria-label="TikTok"
                >
                  <i className="fab fa-tiktok"></i>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white mb-3" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled" style={{ fontSize: '14px' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/products', label: 'Products' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <li key={href} className="mb-2">
                  <Link
                    href={href}
                    style={{ color: '#adb5bd', textDecoration: 'none', transition: 'color 0.2s' }}
                    className="footer-link"
                  >
                    <i className="fas fa-angle-right me-1" style={{ color: 'var(--secondary)', fontSize: '12px' }}></i>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white mb-3" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              Legal
            </h6>
            <ul className="list-unstyled" style={{ fontSize: '14px' }}>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
              ].map(({ href, label }) => (
                <li key={href} className="mb-2">
                  <Link
                    href={href}
                    style={{ color: '#adb5bd', textDecoration: 'none' }}
                  >
                    <i className="fas fa-angle-right me-1" style={{ color: 'var(--secondary)', fontSize: '12px' }}></i>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-white mb-3" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              Contact Us
            </h6>
            <ul className="list-unstyled" style={{ fontSize: '14px' }}>
              <li className="mb-2 d-flex align-items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1" style={{ color: 'var(--secondary)', minWidth: '16px' }}></i>
                <span>{address}</span>
              </li>
              {phone && (
                <li className="mb-2 d-flex align-items-center gap-2">
                  <i className="fas fa-phone-alt" style={{ color: 'var(--secondary)', minWidth: '16px' }}></i>
                  <a href={`tel:${phone}`} style={{ color: '#adb5bd', textDecoration: 'none' }}>
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="mb-2 d-flex align-items-center gap-2">
                  <i className="fas fa-envelope" style={{ color: 'var(--secondary)', minWidth: '16px' }}></i>
                  <a href={`mailto:${email}`} style={{ color: '#adb5bd', textDecoration: 'none' }}>
                    {email}
                  </a>
                </li>
              )}
              {whatsappNumber && (
                <li className="mt-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '13px',
                      padding: '6px 16px',
                    }}
                  >
                    <i className="fab fa-whatsapp me-1"></i> Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 0',
          textAlign: 'center',
          fontSize: '13px',
        }}
      >
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Sansi Eco Foods. All rights reserved. |
          Crafted with ❤️ in Anamaduwa, Sri Lanka
        </p>
      </div>
    </footer>
  );
}
