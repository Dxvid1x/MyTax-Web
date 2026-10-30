import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
export function BanditEscape({ onPlan }: { onPlan: () => void }) {
  const [state, setState] = useState<"idle" | "running" | "gone">("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state === "gone") heading.current?.focus({ preventScroll: true });
  }, [state]);
  return (
    <div className="bandit-interaction" data-state={state}>
      {state !== "gone" ? (
        <>
          <button
            className="bandit-escape-button"
            aria-label="แตะหนูให้วิ่งหนี"
            aria-disabled={state === "running"}
            onClick={() => {
              if (state !== "idle") return;
              setState(
                matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "gone"
                  : "running",
              );
            }}
            onAnimationEnd={(e) => {
              if (e.animationName === "bandit-dash") setState("gone");
            }}
          >
            <img
              src="/images/mytax-mascot-bandit-v1.png"
              width={1254}
              height={1280}
              alt="หนูมาสคอตสวมหน้ากากโจร วิ่งหอบถุงเงิน"
              loading="lazy"
            />
            {state === "running" && (
              <span className="bandit-foot-smoke" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} style={{ animationDelay: i * 85 + "ms" }} />
                ))}
              </span>
            )}
          </button>
          <span className="bandit-touch-hint">แตะหนู ลองจับให้ทัน ↗</span>
        </>
      ) : (
        <div className="bandit-reveal">
          <span className="law-kicker">หนูหนีไปแล้ว…</span>
          <h3 ref={heading} tabIndex={-1}>
            แต่ภาระภาษีไม่ได้หายไป
          </h3>
          <p>
            เงินที่หายไปอาจไม่ใช่แค่ยอดภาษี กลับมาดูเงินเข้า–ออก
            และกันเงินสำหรับภาระที่ยังเหลือ
          </p>
          <button className="primary" onClick={onPlan}>
            ลองติดตามแผนเงิน <ArrowRight size={16} />
          </button>
          <button className="text-button" onClick={() => setState("idle")}>
            <RotateCcw size={15} /> เรียกหนูกลับมา
          </button>
        </div>
      )}
      <span className="bandit-status" role="status">
        {state === "running"
          ? "หนูกำลังวิ่งหนี"
          : state === "gone"
            ? "หนูวิ่งออกไปแล้ว พบข้อคิดและทางไปติดตามแผนเงิน"
            : ""}
      </span>
    </div>
  );
}
