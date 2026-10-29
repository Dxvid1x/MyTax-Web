import { SCOPE, EXTENDED_SOURCES } from "./scope.ts";
import { rulesFor, money, type TaxPlan } from "./tax.ts";

import { BookOpen, ArrowUpRight } from "lucide-react";

export const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n / 100);
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
export const safeMoney = (v: string) => {
  try {
    return money(v);
  } catch {
    return 0;
  }
};
export function SourceDetails({ plan }: { plan: TaxPlan }) {
  const rules = rulesFor(plan);
  return (
    <details className="sources">
      <summary>
        <BookOpen size={16} /> แหล่งข้อมูลและขอบเขตการคำนวณ
      </summary>
      <div>
        <p>
          ปีภาษี {rules.year} คือรายได้ระหว่าง 1 ม.ค.–31 ธ.ค. {rules.year - 543}
          {SCOPE.supported} ยังไม่รวม: {SCOPE.excluded}
        </p>
        {[...rules.sources, ...EXTENDED_SOURCES]
          .filter(
            (item, index, all) =>
              all.findIndex((x) => x.url === item.url) === index,
          )
          .map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.title} <ArrowUpRight size={14} />
            </a>
          ))}
        <small>
          ตรวจข้อมูล {dateLabel(rules.checked)} · กฎ {rules.version} ·
          {SCOPE.limitation}
        </small>
      </div>
    </details>
  );
}
