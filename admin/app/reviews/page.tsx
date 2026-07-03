'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReviews, updateReviewStatus, deleteReview } from '../../lib/firestore';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import type { Review, ReviewStatus } from '../../../shared/types';
import toast from 'react-hot-toast';

type FilterTab = 'all' | ReviewStatus;

const STATUS_STYLES: Record<ReviewStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg: 'rgba(234,179,8,0.12)',   color: '#a16207', label: 'Pending'  },
  approved: { bg: 'rgba(34,197,94,0.12)',   color: '#15803d', label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c', label: 'Rejected' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ letterSpacing: '1px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#d4a853' : '#d1d5db', fontSize: '14px' }}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { hasPermission } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === 'all'
        ? await getReviews()
        : await getReviews(activeTab);
      setReviews(data);
    } catch {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await updateReviewStatus(id, 'approved');
      toast.success('Review approved and published.');
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
    } catch {
      toast.error('Failed to approve review.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await updateReviewStatus(id, 'rejected');
      toast.success('Review rejected.');
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch {
      toast.error('Failed to reject review.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review? This cannot be undone.')) return;
    setProcessing(id);
    try {
      await deleteReview(id);
      toast.success('Review deleted.');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to delete review.');
    } finally {
      setProcessing(null);
    }
  };

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  const tabs: { key: FilterTab; label: string; badge?: number }[] = [
    { key: 'all',      label: 'All Reviews' },
    { key: 'pending',  label: 'Pending',     badge: activeTab === 'all' ? counts.pending : undefined },
    { key: 'approved', label: 'Approved'  },
    { key: 'rejected', label: 'Rejected'  },
  ];

  return (
    <AdminLayout
      title="Customer Reviews"
      description="Moderate submitted reviews. Only approved reviews are shown on the website."
      requiredPermission="reviews_manage"
    >
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && counts.pending > 0 && (
              <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-gray-500 font-medium">No reviews found</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'pending'
              ? 'No reviews are pending moderation.'
              : activeTab === 'approved'
              ? 'No approved reviews yet.'
              : activeTab === 'rejected'
              ? 'No rejected reviews.'
              : 'No reviews have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const s = STATUS_STYLES[review.status];
            const isProcessing = processing === review.id;
            return (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                    {review.reviewerName?.[0] ?? '?'}
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
                      {review.location && (
                        <span className="text-xs text-gray-400">📍 {review.location}</span>
                      )}
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {review.createdAt?.toDate
                          ? review.createdAt.toDate().toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? '…' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? '…' : '✕ Reject'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      title="Delete permanently"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Product link */}
                <div className="text-xs text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">Product:</span>{' '}
                  <a
                    href={`${process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000'}/products/${review.productSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {review.productName}
                  </a>
                </div>

                {/* Review text */}
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
