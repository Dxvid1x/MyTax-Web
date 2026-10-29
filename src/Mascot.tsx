import "./mascot.css";

export function Mascot({
  className = "",
  pointing = false,
}: {
  className?: string;
  pointing?: boolean;
}) {
  return (
    <img
      className={`mytax-mascot ${className}`}
      src={
        pointing
          ? "/images/mytax-mascot-pointing.webp"
          : "/images/mytax-mascot-green.webp"
      }
      width={pointing ? 480 : 640}
      height={pointing ? 576 : 767}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
    />
  );
}
