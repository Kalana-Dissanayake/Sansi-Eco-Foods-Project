'use client';

import { useState, useEffect } from 'react';
import { DISTRICT_PROVINCE_MAP } from '../../../shared/types';
import type { CustomerFormData } from '../../../shared/types';

interface CheckoutFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isSubmitting: boolean;
  initialValues?: CustomerFormData | null;
}

type FormErrors = Partial<Record<keyof CustomerFormData | 'line1' | 'city' | 'district', string>>;

const DISTRICTS = Object.keys(DISTRICT_PROVINCE_MAP).sort();

const SRI_LANKA_PHONE_REGEX = /^0[1-9][0-9]{8}$/;

export default function CheckoutForm({ onSubmit, isSubmitting, initialValues = null }: CheckoutFormProps) {
  const [form, setForm] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    deliveryAddress: { line1: '', city: '', district: '', province: '' },
    orderNotes: '',
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        phone: initialValues.phone || '',
        email: initialValues.email || '',
        deliveryAddress: {
          line1: initialValues.deliveryAddress?.line1 || '',
          city: initialValues.deliveryAddress?.city || '',
          district: initialValues.deliveryAddress?.district || '',
          province: initialValues.deliveryAddress?.province || '',
        },
        orderNotes: initialValues.orderNotes || '',
      });
    }
  }, [initialValues]);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof CustomerFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateAddress = (field: keyof typeof form.deliveryAddress, value: string) => {
    const newAddr = { ...form.deliveryAddress, [field]: value };
    if (field === 'district') {
      newAddr.province = DISTRICT_PROVINCE_MAP[value] ?? '';
    }
    setForm((prev) => ({ ...prev, deliveryAddress: newAddr }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!SRI_LANKA_PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Sri Lankan mobile number (e.g., 077XXXXXXX)';
    }
    if (!form.deliveryAddress.line1.trim()) newErrors.line1 = 'Delivery address is required';
    if (!form.deliveryAddress.city.trim()) newErrors.city = 'City is required';
    if (!form.deliveryAddress.district) newErrors.district = 'Please select a district';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const InputError = ({ field }: { field: keyof FormErrors }) =>
    errors[field] ? (
      <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>
        {errors[field]}
      </div>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="p-4 rounded-3 mb-4" style={{ background: '#fff', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <h5 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)' }}>
          <i className="fas fa-user me-2" style={{ color: 'var(--primary)' }}></i>
          Customer Details
        </h5>

        <div className="row g-3">
          {/* Name */}
          <div className="col-12">
            <label htmlFor="checkout-name" className="form-label">Full Name *</label>
            <input
              id="checkout-name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Kasun Perera"
              autoComplete="name"
            />
            <InputError field="name" />
          </div>

          {/* Phone */}
          <div className="col-md-6">
            <label htmlFor="checkout-phone" className="form-label">Phone Number *</label>
            <input
              id="checkout-phone"
              type="tel"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="077 XXX XXXX"
              autoComplete="tel"
            />
            <InputError field="phone" />
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label htmlFor="checkout-email" className="form-label">
              Email Address <span style={{ color: '#888', fontWeight: 400, fontSize: '12px' }}>(optional, for confirmation)</span>
            </label>
            <input
              id="checkout-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-3 mb-4" style={{ background: '#fff', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <h5 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)' }}>
          <i className="fas fa-map-marker-alt me-2" style={{ color: 'var(--primary)' }}></i>
          Delivery Address
        </h5>

        <div className="row g-3">
          {/* Address Line 1 */}
          <div className="col-12">
            <label htmlFor="checkout-address" className="form-label">Address Line 1 *</label>
            <input
              id="checkout-address"
              type="text"
              className={`form-control ${errors.line1 ? 'is-invalid' : ''}`}
              value={form.deliveryAddress.line1}
              onChange={(e) => updateAddress('line1', e.target.value)}
              placeholder="No. 12, Main Street"
              autoComplete="street-address"
            />
            <InputError field="line1" />
          </div>

          {/* City */}
          <div className="col-md-6">
            <label htmlFor="checkout-city" className="form-label">City / Town *</label>
            <input
              id="checkout-city"
              type="text"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
              value={form.deliveryAddress.city}
              onChange={(e) => updateAddress('city', e.target.value)}
              placeholder="e.g., Colombo 03"
              autoComplete="address-level2"
            />
            <InputError field="city" />
          </div>

          {/* District */}
          <div className="col-md-6">
            <label htmlFor="checkout-district" className="form-label">District *</label>
            <select
              id="checkout-district"
              className={`form-select ${errors.district ? 'is-invalid' : ''}`}
              value={form.deliveryAddress.district}
              onChange={(e) => updateAddress('district', e.target.value)}
            >
              <option value="">Select District</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <InputError field="district" />
          </div>

          {/* Province (auto-filled) */}
          {form.deliveryAddress.province && (
            <div className="col-12">
              <div style={{ padding: '10px 14px', background: 'var(--primary-light)', borderRadius: '8px', fontSize: '14px' }}>
                <i className="fas fa-info-circle me-2" style={{ color: 'var(--primary)' }}></i>
                Province: <strong>{form.deliveryAddress.province}</strong>
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="col-12">
            <label htmlFor="checkout-notes" className="form-label">
              Order Notes <span style={{ color: '#888', fontWeight: 400, fontSize: '12px' }}>(optional)</span>
            </label>
            <textarea
              id="checkout-notes"
              className="form-control"
              rows={3}
              value={form.orderNotes}
              onChange={(e) => updateField('orderNotes', e.target.value)}
              placeholder="e.g., Leave at the gate, call before delivery..."
            />
          </div>
        </div>
      </div>

      {/* Submit is handled by the parent via PaymentMethodSelector */}
      <input type="submit" id="checkout-submit-btn" className="d-none" />
    </form>
  );
}
