export function SalarySlip({ annual = false }: { annual?: boolean }) {
  return (
    <details className="salary-slip-help">
      <summary>ดูยอดนี้จากเอกสารตรงไหน?</summary>
      <figure className="salary-slip-example">
        <figcaption>
          {annual
            ? "ตัวอย่างตำแหน่งในหนังสือรับรอง 50 ทวิ"
            : "ตัวอย่างตำแหน่งในสลิปเงินเดือน"}
        </figcaption>
        <div className="slip-row highlighted">
          <span>
            {annual ? "เงินเดือน/ค่าจ้างรวมทั้งปี" : "เงินเดือนก่อนหัก"}
          </span>
          <strong>{annual ? "600,000.00" : "50,000.00"} บาท</strong>
        </div>
        <p className="slip-pointer">
          ↑ ใช้ยอดก่อนหัก ไม่ใช้เงินสุทธิที่เข้าบัญชี
        </p>
        <div className="slip-row">
          <span>
            {annual ? "ภาษีที่หักและนำส่งไว้" : "หักภาษี / ประกันสังคม"}
          </span>
          <span>คนละช่องกับรายได้</span>
        </div>
        {!annual && (
          <div className="slip-row">
            <span>เงินสุทธิเข้าบัญชี</span>
            <span>ไม่ใช้ยอดนี้</span>
          </div>
        )}
      </figure>
      <p>
        ภาพจำลอง ตำแหน่งจริงต่างกันตามบริษัท
        {annual
          ? " หากช่องเงินได้รวมโบนัสแล้ว ให้แยกโบนัสออกก่อน หรือใส่โบนัส 0 เพื่อไม่บวกซ้ำ"
          : " · หากเงินเดือนเปลี่ยนระหว่างปี ให้ใช้ยอดรวมทั้งปีแทน"}
      </p>
    </details>
  );
}
