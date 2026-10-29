import "./siteBackdrop.css";

export function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <svg
        viewBox="0 0 1160 660"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-40 395 C150 150 325 140 580 260 S1000 510 1200 205" />
        <path d="M-30 510 C190 280 360 460 565 530 S1010 630 1210 375" />
        <circle cx="170" cy="300" r="128" />
        <circle cx="996" cy="302" r="143" />
      </svg>
    </div>
  );
}
