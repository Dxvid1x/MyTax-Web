import { useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
import "./siteIntro.css";

export function SiteIntro() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [show, setShow] = useState(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !["/", "/home"].includes(location.pathname)
    )
      return false;
    try {
      return sessionStorage.getItem("mytax.intro.seen") !== "1";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem("mytax.intro.seen", "1");
    } catch {
      /* Motion remains optional when storage is unavailable. */
    }
    document.documentElement.dataset.introPlaying = "true";
    dialog.current?.showModal();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (media.matches) setShow(false);
    };
    media.addEventListener("change", stop);
    const reveal = setTimeout(() => {
      // Start the hero while the opening fades, rather than after it disappears.
      delete document.documentElement.dataset.introPlaying;
      setLeaving(true);
    }, 1800);
    // A fallback for browsers that suppress animation events in background tabs.
    const finish = setTimeout(() => setShow(false), 3100);
    return () => {
      clearTimeout(reveal);
      clearTimeout(finish);
      media.removeEventListener("change", stop);
      delete document.documentElement.dataset.introPlaying;
      dialog.current?.close();
    };
  }, [show]);
  if (!show) return null;
  return (
    <dialog
      className="site-intro"
      data-phase={leaving ? "leaving" : "opening"}
      ref={dialog}
      tabIndex={-1}
      aria-label="ภาพเปิด MyTax"
      aria-describedby="intro-caption"
      onAnimationEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.animationName === "intro-reveal"
        )
          setShow(false);
      }}
      onCancel={(event) => {
        event.preventDefault();
        setShow(false);
      }}
    >
      <div className="intro-stage">
        <svg
          className="intro-orbits"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="500" cy="350" rx="440" ry="230" />
          <ellipse cx="500" cy="350" rx="310" ry="310" />
          <path d="M0 500C250 700 450-100 1000 270" />
          <path d="M0 180C280-40 680 740 1000 500" />
        </svg>
        <div className="intro-market" aria-hidden="true">
          <svg
            className="intro-chart intro-chart-left"
            viewBox="0 0 600 230"
            fill="none"
          >
            <path
              className="intro-chart-grid"
              d="M0 60H600M0 120H600M0 180H600M100 0V230M250 0V230M400 0V230M550 0V230"
            />
            <path
              className="intro-chart-area"
              d="M0 196L58 181L100 192L154 143L208 155L260 108L310 125L360 74L414 91L470 38L530 58L600 16V230H0Z"
            />
            <path
              className="intro-chart-rise"
              d="M0 196L58 181L100 192L154 143L208 155L260 108L310 125L360 74L414 91L470 38L530 58L600 16"
            />
            <path
              className="intro-chart-fall"
              d="M0 92L58 112L100 99L154 127L208 110L260 146L310 133L360 159L414 146L470 181L530 165L600 202"
            />
          </svg>
          <svg
            className="intro-chart intro-chart-right"
            viewBox="0 0 600 230"
            fill="none"
          >
            <path
              className="intro-chart-grid"
              d="M0 60H600M0 120H600M0 180H600M50 0V230M200 0V230M350 0V230M500 0V230"
            />
            <path
              className="intro-chart-area"
              d="M0 202L55 174L105 185L156 132L208 148L263 98L318 119L371 66L422 83L477 35L533 54L600 12V230H0Z"
            />
            <path
              className="intro-chart-rise"
              d="M0 202L55 174L105 185L156 132L208 148L263 98L318 119L371 66L422 83L477 35L533 54L600 12"
            />
            <path
              className="intro-chart-fall"
              d="M0 42L55 72L105 55L156 101L208 86L263 131L318 114L371 154L422 139L477 180L533 158L600 207"
            />
          </svg>
          {[1, 2, 3].map((coin) => (
            <span
              className={`intro-bouncing-coin intro-bouncing-coin-${coin}`}
              key={coin}
            >
              <span>฿</span>
            </span>
          ))}
        </div>
        <div className="intro-brand-scene" aria-hidden="true">
          <span className="intro-banknote">
            <i>฿</i>
          </span>
          <span className="intro-wallet">
            <Wallet size={52} strokeWidth={1.7} />
          </span>
          <span className="intro-wordmark">
            MyTax<span>.</span>
          </span>
        </div>
        <p className="intro-caption" id="intro-caption">
          ภาษี เรื่องเงิน เข้าใจง่ายขึ้น
        </p>
      </div>
    </dialog>
  );
}
