export default function Spinner({ size = 'md', color = 'var(--primary)' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizes = { sm: '20px', md: '36px', lg: '52px' };
  const dim = sizes[size];
  return (
    <div
      style={{
        display: 'inline-block',
        width: dim,
        height: dim,
        border: `3px solid rgba(0,0,0,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
      role="status"
      aria-label="Loading"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
