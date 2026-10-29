import {
  Wallet,
  ShieldCheck,
  ReceiptText,
  ArrowRight,
  Coins,
  Check,
} from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n / 100);
export function MoneyTrail() {
  return (
    <div
      className="money-trail"
      role="img"
      aria-label="ขั้นตอน: กรอกรายได้ เลือกค่าลดหย่อน แล้วดูภาษี"
    >
      <svg viewBox="0 0 480 300" className="trail-art" aria-hidden="true">
        <path
          d="M88 87 C220 8 278 120 378 85 M378 95 C480 240 220 291 110 217"
          fill="none"
          stroke="#c6dbc0"
          strokeWidth="2"
          strokeDasharray="5 9"
        />
        <g
          className="trail-coins"
          fill="#edf6ee"
          stroke="#237a4f"
          strokeWidth="2"
        >
          <circle cx="218" cy="59" r="15" />
          <path d="M214 53h8m-8 6h8m-8 6h8" />
          <circle cx="333" cy="227" r="13" />
          <path d="M329 222h8m-8 5h8m-8 5h8" />
        </g>
        <g className="trail-wallet">
          <rect x="36" y="68" width="150" height="98" rx="23" fill="#237a4f" />
          <path
            d="M48 79V61a12 12 0 0 1 12-12h106v23"
            fill="#fff"
            stroke="#237a4f"
            strokeWidth="3"
          />
          <rect x="130" y="98" width="58" height="38" rx="12" fill="#edf6ee" />
          <circle cx="146" cy="117" r="4" fill="#237a4f" />
          <path
            d="M60 132h42"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
        <g className="trail-receipt">
          <path
            d="M292 34h123v176l-12-7-12 7-12-7-13 7-12-7-12 7-13-7-12 7-15-7V34z"
            fill="white"
            stroke="#c9d7c3"
            strokeWidth="2"
          />
          <circle cx="353" cy="72" r="18" fill="#e7f8f0" />
          <path
            d="m345 72 6 6 11-12"
            fill="none"
            stroke="#087f65"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M314 112h78M314 126h57M314 140h78"
            stroke="#dce6d5"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="313" y="159" width="81" height="27" rx="7" fill="#edf6ee" />
          <path
            d="M327 173h52"
            stroke="#237a4f"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
        <g className="trail-shield">
          <path
            d="m174 167 35 11v30c0 20-21 32-35 39-14-7-35-19-35-39v-30z"
            fill="#e7f8f0"
            stroke="#087f65"
            strokeWidth="2"
          />
          <path
            d="m158 205 12 12 21-26"
            fill="none"
            stroke="#087f65"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="trail-labels">
        <span>
          <Wallet size={17} /> รายได้
        </span>
        <ArrowRight size={16} />
        <span>
          <ShieldCheck size={17} /> ลดหย่อน
        </span>
        <ArrowRight size={16} />
        <span>
          <ReceiptText size={17} /> ภาษี
        </span>
      </div>
    </div>
  );
}

export function TaxPicture({
  gross,
  expense,
  deductions,
  taxable,
  tax,
}: {
  gross: number;
  expense: number;
  deductions: number;
  taxable: number;
  tax: number;
}) {
  const rows = [
    {
      name: "รายได้ทั้งปี",
      value: gross,
      tone: "income",
      icon: <Wallet size={17} />,
    },
    {
      name: "หักค่าใช้จ่าย",
      value: expense,
      tone: "expense",
      icon: <Coins size={17} />,
    },
    {
      name: "หักค่าลดหย่อน",
      value: deductions,
      tone: "deduct",
      icon: <ShieldCheck size={17} />,
    },
    {
      name: "เหลือคิดภาษี",
      value: taxable,
      tone: "taxable",
      icon: <ReceiptText size={17} />,
    },
  ];
  return (
    <div className="tax-picture">
      <div className="picture-head">
        <h3>เงินของคุณ ไปคิดภาษีอย่างไร?</h3>
        <small>ความยาวเทียบกับรายได้ทั้งปี</small>
      </div>
      {rows.map((row) => (
        <div className={"picture-row " + row.tone} key={row.name}>
          <div className="picture-label">
            <span>
              {row.icon}
              {row.name}
            </span>
            <b>
              {fmt(row.value)} <small>บาท</small>
            </b>
          </div>
          <div className="picture-track">
            <span
              style={{
                width:
                  (gross > 0 ? Math.min(100, (row.value / gross) * 100) : 0) +
                  "%",
              }}
            />
          </div>
        </div>
      ))}
      <div className="picture-answer">
        <Check size={18} />
        <span>ภาษีจากยอดนี้</span>
        <b>{fmt(tax)} บาท</b>
      </div>
    </div>
  );
}
