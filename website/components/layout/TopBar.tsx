interface TopBarProps {
  address: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export default function TopBar({
  address,
  email,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: TopBarProps) {
  return (
    <div className="top-bar d-none d-lg-flex">
      <div className="container-fluid">
        <div className="row align-items-center py-2 px-lg-5">
          <div className="col-lg-6 d-flex align-items-center">
            <small className="me-3 text-white">
              <i className="fa fa-map-marker-alt me-2"></i>
              {address}
            </small>
            <small className="text-white">
              <i className="fa fa-envelope me-2"></i>
              <a href={`mailto:${email}`} className="text-white text-decoration-none">
                {email}
              </a>
            </small>
          </div>
          <div className="col-lg-6 text-end">
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm-square btn-primary rounded-circle me-1"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm-square btn-primary rounded-circle me-1"
              >
                <i className="fab fa-instagram"></i>
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm-square btn-primary rounded-circle"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
