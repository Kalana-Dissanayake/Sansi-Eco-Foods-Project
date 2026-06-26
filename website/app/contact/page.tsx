'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import toast from 'react-hot-toast';
import { submitContactMessage } from '../../lib/firestore';

// NOTE: Metadata export must be in a server component; this is client — metadata handled in layout
// const metadata = { title: 'Contact Us | Sansi Eco Foods' };

const CONTACT_INFO = {
  phone: '+94 77 123 4567',
  email: 'info@sansiecofoods.com',
  address: 'Anamaduwa, North Western Province, Sri Lanka',
  whatsapp: '+94 77 123 4567',
  facebook: 'https://web.facebook.com/sansiecofoods',
  instagram: 'https://www.instagram.com/sansiecofoods',
  tiktok: 'https://www.tiktok.com/@sansiecofood',
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const result = await submitContactMessage(form);
    setSubmitting(false);
    if (result.success) {
      toast.success("Message sent! We'll get back to you soon.", { duration: 5000 });
      setForm({ name: '', email: '', subject: '', message: '' });
    } else {
      toast.error(result.error ?? 'Failed to send message. Please try again.');
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid px-lg-5 position-relative">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active">Contact Us</li>
            </ol>
          </nav>
          <h1 className="display-6 fw-bold" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Contact Us
          </h1>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-fluid px-lg-5">
          <div className="row g-4">
            {/* Left: Contact Info */}
            <div className="col-lg-5">
              <div className="contact-info-card">
                <h4 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff' }}>
                  Get in Touch
                </h4>
                <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
                  Have a question, want to place a bulk order, or just want to say hello?
                  We&apos;d love to hear from you!
                </p>

                <ul className="list-unstyled">
                  {[
                    { icon: 'fa-phone-alt', label: 'Call Us', value: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone}` },
                    { icon: 'fa-envelope', label: 'Email Us', value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
                    { icon: 'fa-map-marker-alt', label: 'Find Us', value: CONTACT_INFO.address, href: null },
                  ].map(({ icon, label, value, href }) => (
                    <li key={label} className="mb-4 d-flex align-items-start gap-3">
                      <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fas ${icon}`} style={{ color: 'var(--secondary)' }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', opacity: 0.7, marginBottom: '2px' }}>{label}</div>
                        {href ? (
                          <a href={href} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{value}</a>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '24px 0' }} />

                <div>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Follow Us</p>
                  <div className="d-flex gap-2 mb-4">
                    {[
                      { href: CONTACT_INFO.facebook, icon: 'fa-facebook-f' },
                      { href: CONTACT_INFO.instagram, icon: 'fa-instagram' },
                      { href: CONTACT_INFO.tiktok, icon: 'fa-tiktok' },
                    ].map(({ href, icon }) => (
                      <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
                        style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
                        <i className={`fab ${icon}`}></i>
                      </a>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-100 py-2"
                    style={{ background: '#25D366', color: '#fff', borderRadius: '30px', fontWeight: 600 }}
                  >
                    <i className="fab fa-whatsapp me-2"></i>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="col-lg-7">
              <div className="contact-form-card">
                <h4 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  Send Us a Message
                </h4>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="contact-name" className="form-label">Your Name *</label>
                      <input id="contact-name" type="text" className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Kasun Perera" required />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="contact-email" className="form-label">Email Address *</label>
                      <input id="contact-email" type="email" className="form-control" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required />
                    </div>
                    <div className="col-12">
                      <label htmlFor="contact-subject" className="form-label">Subject</label>
                      <input id="contact-subject" type="text" className="form-control" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="e.g., Bulk Order Inquiry" />
                    </div>
                    <div className="col-12">
                      <label htmlFor="contact-message" className="form-label">Message *</label>
                      <textarea id="contact-message" className="form-control" rows={6} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Tell us how we can help..." required />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary px-5 py-2 w-100" style={{ borderRadius: '30px', fontWeight: 700, fontSize: '16px' }} disabled={submitting}>
                        {submitting ? 'Sending...' : <><i className="fas fa-paper-plane me-2"></i>Send Message</>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-5 rounded-3 overflow-hidden" style={{ height: '400px', boxShadow: 'var(--shadow-md)' }}>
            <iframe
              title="Sansi Eco Foods location in Anamaduwa, Sri Lanka"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63309.87!2d79.9!3d8.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afc9c000000000%3A0x0!2sAnamaduwa%2C+Sri+Lanka!5e0!3m2!1sen!2slk!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
