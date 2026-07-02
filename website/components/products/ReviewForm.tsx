'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { submitReview, getCustomerReviewForProduct } from '../../lib/firestore';
import type { Review } from '../../../shared/types';

interface ReviewFormProps {
  productId: string;
  productName: string;
  productSlug: string;
}

export default function ReviewForm({ productId, productName, productSlug }: ReviewFormProps) {
  const { user, customer, loading } = useAuth();

  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if this customer already reviewed this product
  useEffect(() => {
    if (!user) return;
    setCheckingExisting(true);
    getCustomerReviewForProduct(user.uid, productId)
      .then((review) => setExistingReview(review))
      .finally(() => setCheckingExisting(false));
  }, [user, productId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || checkingExisting) {
    return (
      <div style={{ padding: '24px 0' }}>
        <div className="skeleton" style={{ height: '20px', width: '220px', borderRadius: '6px' }} />
      </div>
    );
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user || !customer) {
    return (
      <div
        style={{
          marginTop: '8px',
          padding: '24px',
          background: 'var(--primary-light)',
          borderRadius: '12px',
          border: '1px solid rgba(74,124,89,0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</div>
        <p style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '8px' }}>
          Want to share your experience?
        </p>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '16px' }}>
          Please log in to write a review for {productName}.
        </p>
        <Link
          href={`/login?redirect=/products/${productSlug}`}
          className="btn btn-primary px-4 py-2"
          style={{ borderRadius: '30px', fontWeight: 600, fontSize: '14px' }}
        >
          Log In to Write a Review
        </Link>
      </div>
    );
  }

  // ── Already reviewed ───────────────────────────────────────────────────────
  if (existingReview) {
    const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: 'rgba(212,168,83,0.12)',  color: '#b8903e', label: 'Pending Approval' },
      approved: { bg: 'rgba(40,167,69,0.12)',   color: '#28a745', label: 'Published'        },
      rejected: { bg: 'rgba(220,53,69,0.12)',   color: '#dc3545', label: 'Not Approved'     },
    };
    const s = statusStyles[existingReview.status] ?? statusStyles.pending;

    return (
      <div
        style={{
          marginTop: '8px',
          padding: '24px',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '15px' }}>
            Your Review
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '20px',
              background: s.bg,
              color: s.color,
            }}
          >
            {s.label}
          </span>
        </div>
        <StarDisplay rating={existingReview.rating} />
        <p style={{ color: '#555', fontStyle: 'italic', marginTop: '10px', lineHeight: 1.7, fontSize: '14px' }}>
          &ldquo;{existingReview.text}&rdquo;
        </p>
        {existingReview.status === 'pending' && (
          <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
            Your review is awaiting moderation and will be visible once approved.
          </p>
        )}
      </div>
    );
  }

  // ── Submitted successfully ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          marginTop: '8px',
          padding: '32px 24px',
          background: 'var(--primary-light)',
          borderRadius: '12px',
          border: '1px solid rgba(74,124,89,0.3)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
        <p style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '16px', marginBottom: '6px' }}>
          Thank you for your review!
        </p>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          Your review is pending approval and will be published on the website shortly.
        </p>
      </div>
    );
  }

  // ── Review form ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }
    if (!text.trim()) {
      toast.error('Please write your review before submitting.');
      return;
    }
    setSubmitting(true);
    const result = await submitReview({
      customerId: user.uid,
      productId,
      productName,
      productSlug,
      reviewerName: customer.name,
      location: location.trim(),
      rating,
      text: text.trim(),
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      toast.error(result.error || 'Failed to submit review.');
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: '8px',
        padding: '28px',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'var(--dark)',
          marginBottom: '20px',
        }}
      >
        Write a Review
      </h3>

      {/* Reviewer name — pre-filled, read-only */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label">Reviewing as</label>
        <input
          type="text"
          className="form-control"
          value={customer.name}
          disabled
          style={{ background: 'var(--light)', color: 'var(--gray-600)', cursor: 'not-allowed' }}
        />
      </div>

      {/* Star rating — required */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label">
          Rating <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} out of 5 stars`}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                fontSize: '32px',
                color: star <= (hoverRating || rating) ? 'var(--secondary)' : '#ddd',
                transition: 'color 0.12s, transform 0.1s',
                transform: star <= (hoverRating || rating) ? 'scale(1.18)' : 'scale(1)',
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ))}
          {(hoverRating || rating) > 0 && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '13px',
                color: 'var(--secondary)',
                fontWeight: 700,
              }}
            >
              {ratingLabels[hoverRating || rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review text — required */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label" htmlFor="review-text">
          Your Review <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <textarea
          id="review-text"
          className="form-control"
          rows={4}
          placeholder="Share your honest experience with this product..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={1000}
          style={{ resize: 'vertical' }}
        />
        <div
          style={{
            textAlign: 'right',
            fontSize: '12px',
            color: text.length > 900 ? 'var(--secondary)' : 'var(--gray-600)',
            marginTop: '4px',
          }}
        >
          {text.length}/1000
        </div>
      </div>

      {/* Location — optional */}
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label" htmlFor="review-location">
          Location{' '}
          <span style={{ color: 'var(--gray-600)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="review-location"
          type="text"
          className="form-control"
          placeholder="e.g. Colombo"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={60}
        />
      </div>

      <button
        type="submit"
        id="submit-review-btn"
        className="btn btn-primary px-4 py-2"
        disabled={submitting}
        style={{ borderRadius: '30px', fontWeight: 700, fontSize: '14px', minWidth: '160px' }}
      >
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane me-2" />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ fontSize: '20px', color: s <= rating ? 'var(--secondary)' : '#ddd' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
