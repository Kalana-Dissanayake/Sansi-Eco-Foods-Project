import Spinner from '../components/ui/Spinner';

export default function Loading() {
  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center w-100" 
      style={{ minHeight: '60vh' }}
    >
      <div className="text-center animate__animated animate__fadeIn">
        <div className="mb-4 animate__animated animate__pulse animate__infinite animate__slow">
          <img
            src="/images/sansi-logo.png"
            alt="Sansi Eco Foods Logo"
            style={{ height: '65px', width: 'auto' }}
          />
        </div>
        <Spinner size="lg" color="var(--primary)" />
        <p className="text-muted mt-3" style={{ fontSize: '14px', fontWeight: 500 }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
