interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
}

export default function SectionHeader({ title, subtitle, light = false }: SectionHeaderProps) {
  return (
    <div className="section-header wow animate__fadeInUp" data-wow-delay="0.1s">
      <h2
        className="section-title"
        style={{ color: light ? '#fff' : undefined }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="section-subtitle"
          style={{ color: light ? 'rgba(255,255,255,0.85)' : undefined }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
