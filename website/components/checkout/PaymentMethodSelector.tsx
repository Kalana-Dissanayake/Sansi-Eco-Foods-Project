interface PaymentMethodSelectorProps {
  selected: 'COD';
  // Future: onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selected }: PaymentMethodSelectorProps) {
  return (
    <div className="mb-4">
      <h6 className="mb-3" style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '15px' }}>
        <i className="fas fa-credit-card me-2" style={{ color: 'var(--primary)' }}></i>
        Payment Method
      </h6>

      <div className="d-flex flex-column gap-3">
        {/* Cash on Delivery — ACTIVE */}
        <div
          className="payment-method-card active"
          role="radio"
          aria-checked="true"
          tabIndex={0}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid var(--primary)',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-money-bill-wave" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <strong style={{ color: 'var(--dark)' }}>Cash on Delivery (COD)</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                Pay when your order arrives at your doorstep. No advance payment required.
              </p>
            </div>
          </div>
        </div>

        {/* PayHere — DISABLED */}
        <div
          className="payment-method-card disabled"
          role="radio"
          aria-checked="false"
          aria-disabled="true"
          tabIndex={-1}
          style={{ pointerEvents: 'none' }}
        >
          <span className="coming-soon-badge">Coming Soon</span>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-university" style={{ color: '#999', fontSize: '18px' }}></i>
                <strong style={{ color: '#999' }}>PayHere</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#bbb', margin: '4px 0 0' }}>
                Online payment via PayHere — cards, internet banking & more
              </p>
            </div>
          </div>
        </div>

        {/* Stripe / Card — DISABLED */}
        <div
          className="payment-method-card disabled"
          role="radio"
          aria-checked="false"
          aria-disabled="true"
          tabIndex={-1}
          style={{ pointerEvents: 'none' }}
        >
          <span className="coming-soon-badge">Coming Soon</span>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-credit-card" style={{ color: '#999', fontSize: '18px' }}></i>
                <strong style={{ color: '#999' }}>Stripe / Debit or Credit Card</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#bbb', margin: '4px 0 0' }}>
                Pay securely by Visa, Mastercard, or other cards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
