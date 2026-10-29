import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  type ComponentProps,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Wallet,
  BookOpen,
  ShieldCheck,
  ArrowUpRight,
  Check,
  Download,
  LockKeyhole,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";
import { rulesFor, demoPlan } from "./tax.ts";
import { today } from "./ledger.ts";
import {
  parseSaved,
  makeSaved,
  MAX_BACKUP_BYTES,
  type Saved,
} from "./storage.ts";
import { useLocalStore } from "./useLocalStore.ts";
import { parseRoute, routePath, type Route, type View } from "./navigation.ts";

import { validResult } from "./validation.ts";
type GuideComponent = typeof import("./TaxGuide.tsx").TaxGuide;
let loadedTaxGuide: GuideComponent | undefined;
const loadTaxGuide = () =>
  import("./TaxGuide.tsx").then((m) => {
    loadedTaxGuide = m.TaxGuide;
    return { default: m.TaxGuide };
  });
const LazyTaxGuide = lazy(loadTaxGuide);
const loadTaxLaw = () =>
  import("./TaxLaw.tsx").then((m) => ({ default: m.TaxLaw }));
const TaxLaw = lazy(loadTaxLaw);
function TaxGuide(props: ComponentProps<GuideComponent>) {
  // Keep the selected component stable for this visit, including direct links.
  const [Component] = useState(() => loadedTaxGuide ?? LazyTaxGuide);
  return <Component {...props} />;
}
import "./app.css";
import "./usability.css";
import "./colour.css";
import "./motion.css";
import { AppTools } from "./AppTools.tsx";
import { applyTheme, readTheme } from "./theme.ts";
import { Modal } from "./Modal.tsx";
import { TaxWorkspace } from "./TaxWorkspace.tsx";
import { Result } from "./Result.tsx";
import { Ledger } from "./Ledger.tsx";
import { HeroScene } from "./HeroScene.tsx";
import { ScrollStory } from "./ScrollStory.tsx";
import { HomeOpening } from "./HomeOpening.tsx";
import { About } from "./About.tsx";
import { SITE } from "./siteContent.ts";
import "./ux-review.css";
import { changePage } from "./pageMotion.ts";
import "./navigationMotion.css";
import { SiteBackdrop } from "./SiteBackdrop.tsx";
import "./controlMotion.css";
import "./reading.css";
import { SiteIntro } from "./SiteIntro.tsx";
import { decodeCloudDocument, type CloudDocument } from "./ledgerCloudData.ts";

function App() {
  const store = useLocalStore();
  const {
    plan,
    setPlan,
    transactions,
    setTransactions,
    persist,
    storageError,
    storageOk,
    conflict,
    originalRaw,
  } = store;
  const previousYear = useRef(plan.taxYear);
  const [yearReview, setYearReview] = useState<string | null>(null);
  useEffect(() => {
    if (previousYear.current !== plan.taxYear)
      setYearReview(previousYear.current ?? "2568");
    previousYear.current = plan.taxYear;
  }, [plan.taxYear]);
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(location.pathname, location.hash),
  );
  const view = route.view;
  const [pendingLedgerImport, setPendingLedgerImport] = useState<{
    document: CloudDocument;
  } | null>(null);
  const [dialog, setDialog] = useState<
    | "manage"
    | "save"
    | "pause"
    | "clear"
    | "import"
    | "reload"
    | "salary"
    | "ledger-import"
    | null
  >(null);
  const saveStatus = storageError
    ? "บันทึกมีปัญหา · จัดการข้อมูล"
    : persist && storageOk
      ? "บันทึกในเครื่องแล้ว"
      : persist
        ? "กำลังบันทึกในเครื่อง…"
        : "ยังไม่เปิดบันทึก";
  const [incomeRevision, setIncomeRevision] = useState(0);
  const [pendingImport, setPendingImport] = useState<Saved | null>(null);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState("");
  const headingRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const [navOffset, setNavOffset] = useState(0);
  useEffect(() => {
    const header = topbarRef.current;
    if (!header || view !== "home") return;
    const measure = () =>
      setNavOffset(
        Math.ceil(header.getBoundingClientRect().height) +
          (innerWidth <= 760 ? 8 : 12) +
          12,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [view]);
  const fileRef = useRef<HTMLInputElement>(null);
  const showToast = (text: string) => setToast(text);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const applyRoute = (next: Route, replace = false) => {
    if (next.view === "tax" && next.step === 4 && !validResult(plan)) {
      next = { view: "tax", step: 1 };
      showToast("เริ่มกรอกและยืนยันข้อมูลก่อนดูผลภาษี");
    }
    const path = routePath(next) + location.search;
    const target = next;
    changePage(
      () => {
        if (location.pathname + location.search + location.hash !== path)
          history[replace ? "replaceState" : "pushState"](null, "", path);
        setRoute(target);
        window.scrollTo({ top: 0, behavior: "instant" });
        if (target.view !== "tax")
          requestAnimationFrame(() =>
            headingRef.current?.focus({ preventScroll: true }),
          );
      },
      target.view !== route.view,
      target.view === "reduce"
        ? loadTaxGuide()
        : target.view === "tax-law"
          ? loadTaxLaw()
          : undefined,
    );
  };
  const navigate = (next: View) => applyRoute({ view: next, step: 1 });
  const openTax = (step = 1) => applyRoute({ view: "tax", step });
  useEffect(() => {
    const sync = () =>
      applyRoute(parseRoute(location.pathname, location.hash), true);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [plan, route.view]);
  useEffect(() => {
    if (route.view === "tax" && route.step === 4 && !validResult(plan))
      applyRoute({ view: "tax", step: 1 }, true);
    else if (
      location.pathname + location.search + location.hash !==
      routePath(route) + location.search
    )
      applyRoute(route, true);
  }, [route, plan]);
  const download = (raw: string, name: string) => {
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportBackup = () => {
    download(
      JSON.stringify(
        makeSaved(plan, transactions, persist, store.ledgerSettings),
        null,
        2,
      ),
      `MyTax-backup-${today()}.json`,
    );
    showToast("ดาวน์โหลดสำรองแผนภาษีและสมุดเงินแล้ว");
  };
  const recoveryFiles = () => {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith("mytax.recovery."))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  };
  const readBackup = async (file: File) => {
    setFileError("");
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("ไฟล์ต้องไม่เกิน 5 MB");
      const raw = await file.text();
      const candidate = JSON.parse(raw);
      if (candidate.settings && !candidate.taxPlan) {
        setPendingLedgerImport({
          document: decodeCloudDocument(candidate),
        });
        setDialog("ledger-import");
        return;
      }
      const data = parseSaved(raw);
      setPendingImport(data);
      setDialog("import");
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "อ่านไฟล์ไม่ได้");
    }
  };
  const clearAll = () => {
    if (store.clearAll()) {
      setDialog(null);
      navigate("home");
      showToast("ล้างข้อมูลในเว็บแล้ว ไฟล์ที่ดาวน์โหลดต้องลบเอง");
    }
  };
  return (
    <div className={"app-shell" + (view === "tax-law" ? " tax-law-shell" : "")}>
      <SiteBackdrop />
      <SiteIntro />
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          headingRef.current?.focus();
          headingRef.current?.scrollIntoView();
        }}
      >
        ข้ามไปเนื้อหา
      </a>
      <header
        className={"topbar" + (view === "home" ? " home-sticky-nav" : "")}
        ref={topbarRef}
      >
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="MyTax หน้าแรก"
        >
          <span className="brand-mark">
            <Wallet size={21} />
          </span>
          <span className="mytax-wordmark">
            MyTax<span className="brand-dot">.</span>
          </span>
        </button>
        <nav aria-label="เมนูหลัก">
          <button
            className={view === "home" ? "active" : ""}
            aria-current={view === "home" ? "page" : undefined}
            onClick={() => navigate("home")}
          >
            หน้าแรก
          </button>
          <button
            className={view === "tax" || view === "demo" ? "active" : ""}
            aria-current={
              view === "tax" || view === "demo" ? "page" : undefined
            }
            onClick={() => openTax()}
          >
            คำนวณภาษี
          </button>
          <button
            className={view === "ledger" ? "active" : ""}
            aria-current={view === "ledger" ? "page" : undefined}
            onClick={() => navigate("ledger")}
          >
            สมุดเงิน
          </button>
          <button
            className={view === "reduce" || view === "tax-law" ? "active" : ""}
            aria-current={
              view === "reduce" || view === "tax-law" ? "page" : undefined
            }
            onClick={() => navigate("reduce")}
          >
            วางแผนภาษี
          </button>
          <button
            className={view === "about" ? "active" : ""}
            aria-current={view === "about" ? "page" : undefined}
            onClick={() => navigate("about")}
          >
            เกี่ยวกับ
          </button>
        </nav>
        <button
          className={"save-status " + (persist && storageOk ? "saved" : "")}
          onClick={() => setDialog("manage")}
        >
          <LockKeyhole size={15} />
          <span>{saveStatus}</span>
        </button>
        <AppTools onSave={() => setDialog("manage")} saveStatus={saveStatus} />
      </header>
      <main id="main" tabIndex={-1} ref={headingRef}>
        {yearReview && (
          <div className="year-review alert" role="status">
            <span>
              สลับเป็นปี {plan.taxYear} แล้ว จำนวนเงินยังเป็นของปี {yearReview}{" "}
              ตรวจรายได้และยอดจ่ายใหม่ รวมถึงเพดานประกันสังคม
              แล้วจึงยืนยันสิทธิ์อีกครั้ง
            </span>
            <button className="secondary" onClick={() => setYearReview(null)}>
              ทบทวนตัวเลขแล้ว
            </button>
          </div>
        )}
        {storageError && (
          <div className="alert" role="alert">
            <span>{storageError}</span>
            {originalRaw && (
              <button
                className="secondary"
                onClick={() =>
                  download(originalRaw, `MyTax-original-${today()}.json`)
                }
              >
                ดาวน์โหลดต้นฉบับ
              </button>
            )}
            {conflict && (
              <button className="secondary" onClick={() => setDialog("reload")}>
                โหลดข้อมูลล่าสุด
              </button>
            )}
            {store.needsReview && !conflict && (
              <button className="secondary" onClick={() => setDialog("save")}>
                ตรวจแล้ว เปิดบันทึก
              </button>
            )}
          </div>
        )}
        {transactions.length > 0 && !persist && !conflict && (
          <div className="save-prompt" role="status">
            <LockKeyhole size={22} />
            <div>
              <strong>เก็บสมุดเงินไว้ทำต่อ?</strong>
              <p>
                ตอนนี้ยังไม่บันทึกการเปลี่ยนแปลง เมื่อรีโหลดรายการใหม่อาจหาย
              </p>
            </div>
            <button className="primary" onClick={() => setDialog("save")}>
              เปิดบันทึก
            </button>
            <button className="secondary" onClick={exportBackup}>
              สำรองข้อมูล (JSON)
            </button>
          </div>
        )}
        <Suspense
          fallback={
            <p className="loading" role="status">
              กำลังเปิดหน้านี้…
            </p>
          }
        >
          {view === "about" && (
            <About plan={plan} onManage={() => setDialog("manage")} />
          )}
          {view === "home" && (
            <Home
              saveStatus={saveStatus}
              onSave={() =>
                setDialog(persist || storageError ? "manage" : "save")
              }
              navigate={(next) => (next === "tax" ? openTax() : navigate(next))}
              navOffset={navOffset}
            />
          )}
          {view === "tax" && (
            <TaxWorkspace
              key={`${store.uiRevision}-${incomeRevision}`}
              initialStep={route.step}
              onStepChange={(step) => applyRoute({ view: "tax", step })}
              onReduce={() => navigate("reduce")}
              plan={plan}
              setPlan={setPlan}
              saveStatus={saveStatus}
              onSave={() =>
                setDialog(persist || storageError ? "manage" : "save")
              }
              onSalaryImport={() => setDialog("salary")}
              onLedger={() => navigate("ledger")}
            />
          )}
          {view === "demo" && (
            <section className="workspace">
              <div className="demo-notice">
                <Sparkles size={18} /> ตัวอย่างปี 2568 · ไม่บันทึกในแผนของคุณ{" "}
                <button onClick={() => openTax()}>กรอกข้อมูลของฉัน</button>
              </div>
              <Result
                onReduce={() => navigate("reduce")}
                plan={demoPlan()}
                onEdit={() => openTax()}
                demo
              />
            </section>
          )}
          {view === "reduce" && (
            <TaxGuide
              plan={plan}
              setPlan={setPlan}
              onTax={() => openTax()}
              onDeductions={() => openTax(2)}
              onResult={() => openTax(4)}
              onLaw={() => navigate("tax-law")}
              showToast={showToast}
            />
          )}
          {view === "tax-law" && <TaxLaw onReduce={() => navigate("reduce")} />}
          {view === "ledger" && (
            <>
              <Ledger
                key={store.uiRevision}
                settings={store.ledgerSettings}
                setSettings={store.setLedgerSettings}
                transactions={transactions}
                setTransactions={setTransactions}
                showToast={showToast}
                importBlocked={conflict}
              />
              {fileError && (
                <p className="workspace error-text" role="alert">
                  {fileError}
                </p>
              )}
            </>
          )}
        </Suspense>
      </main>
      <footer className="footer">
        <span>
          MyTax<span className="accent">.</span>{" "}
          <span className="footer-caption">{SITE.slogan}</span>
        </span>
        <div>
          <span>
            <ShieldCheck size={15} /> ข้อมูลอยู่ในเครื่อง ไม่ส่งออกอัตโนมัติ
          </span>
          <button onClick={() => setDialog("manage")}>จัดการข้อมูล</button>
          <button onClick={() => navigate("about")}>
            เกี่ยวกับ / คำถามที่พบบ่อย
          </button>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void readBackup(file);
        }}
      />
      {dialog && (
        <Modal
          key={dialog}
          title={
            {
              manage: "ข้อมูลของฉัน",
              save: "เก็บไว้ทำต่อในเครื่องนี้",
              pause: "พักการบันทึกอัตโนมัติ?",
              clear: "ล้างข้อมูลทั้งหมด?",
              import: "นำเข้าข้อมูลสำรอง?",
              reload: "โหลดข้อมูลจากอีกแท็บ?",
              salary: "นำเงินเดือนจากสมุดเงินมาใส่?",
              "ledger-import": "นำเข้าสำรองสมุดเงิน?",
            }[dialog]
          }
          onClose={() => {
            setDialog(null);
            setFileError("");
          }}
        >
          {dialog === "manage" && (
            <div className="data-actions">
              <p>
                {saveStatus} ·{" "}
                {persist
                  ? "เปิดบันทึกอัตโนมัติในเบราว์เซอร์นี้"
                  : "ยังไม่เปิดบันทึกอัตโนมัติ"}{" "}
                · ไม่ซิงก์ข้ามเครื่อง
              </p>
              <button className="primary full" onClick={exportBackup}>
                <Download size={18} />
                สำรองข้อมูลในเครื่อง (JSON)
              </button>
              <button
                className="secondary full"
                disabled={conflict}
                onClick={() => fileRef.current?.click()}
              >
                นำเข้าข้อมูลสำรอง (JSON)
              </button>
              {fileError && (
                <p className="inline-error" role="alert">
                  {fileError}
                </p>
              )}
              <button
                className="secondary full"
                disabled={conflict}
                onClick={() => setDialog(persist ? "pause" : "save")}
              >
                {persist ? "พักการบันทึกอัตโนมัติ" : "เปิดบันทึกในเครื่อง"}
              </button>
              <button
                className="danger full"
                disabled={conflict}
                onClick={() => setDialog("clear")}
              >
                ล้างข้อมูลทั้งหมด…
              </button>
              <small>
                เก็บไฟล์สำรองไว้ในที่ส่วนตัว ไฟล์มีข้อมูลการเงินของคุณ
              </small>
              {!!recoveryFiles().length && (
                <details>
                  <summary>
                    สำเนากู้คืนก่อนเปลี่ยนข้อมูล ({recoveryFiles().length})
                  </summary>
                  <div className="data-actions">
                    {recoveryFiles().map((key, i) => (
                      <button
                        className="secondary"
                        key={key}
                        onClick={() => {
                          try {
                            const raw = localStorage.getItem(key);
                            if (raw)
                              download(raw, `MyTax-recovery-${i + 1}.json`);
                          } catch {
                            showToast("อ่านสำเนานี้ไม่ได้");
                          }
                        }}
                      >
                        ดาวน์โหลดสำเนา {i + 1}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
          {dialog === "salary" &&
            (() => {
              const year = Number(plan.taxYear ?? "2568") - 543;
              const rows = transactions.filter(
                (t) =>
                  t.type === "income" &&
                  t.category === "เงินเดือน" &&
                  t.date.startsWith(String(year)),
              );
              const total = rows.reduce((sum, t) => sum + t.amount, 0);
              return (
                <>
                  <p>
                    พบ {rows.length} รายการหมวดเงินเดือนในปี{" "}
                    {plan.taxYear ?? "2568"} รวม{" "}
                    {(total / 100).toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </p>
                  <p>
                    สมุดเงินมักจดยอดสุทธิที่เข้าบัญชี แต่ภาษีใช้เงินเดือนก่อนหัก
                    ต้องตรวจและแก้เป็นยอดก่อนหักก่อนคำนวณ โบนัสยังใช้ยอดเดิม
                  </p>
                  <button
                    className="primary full"
                    disabled={!rows.length || total > 100000000000}
                    onClick={() => {
                      setPlan({
                        ...plan,
                        salary: (total / 100).toFixed(2),
                        scope: false,
                      });
                      setIncomeRevision((n) => n + 1);
                      setDialog(null);
                      showToast("นำยอดมาแล้ว ตรวจว่าเป็นเงินเดือนก่อนหัก");
                    }}
                  >
                    แทนยอดเงินเดือนทั้งปี
                  </button>
                </>
              );
            })()}
          {dialog === "save" && (
            <>
              <p>
                เก็บแผนภาษีและสมุดเงินในเบราว์เซอร์นี้
                คนที่ใช้โปรไฟล์เดียวกันอาจเปิดเห็นข้อมูลได้
                การล้างข้อมูลเบราว์เซอร์ทำให้สำเนานี้หาย จึงควรสำรองข้อมูล
                (JSON) ด้วย
              </p>
              {store.needsReview && (
                <p>
                  จะเก็บต้นฉบับเป็นสำเนากู้คืนในเครื่องก่อนบันทึกข้อมูลที่อ่านได้
                </p>
              )}
              <button
                className="primary full"
                disabled={conflict}
                onClick={() => {
                  if (store.enableSaving()) {
                    setDialog(null);
                    showToast("เปิดบันทึกในเครื่องแล้ว");
                  }
                }}
              >
                ยืนยันเปิดบันทึก
              </button>
            </>
          )}
          {dialog === "ledger-import" && pendingLedgerImport && (
            <>
              <p>
                พบ {pendingLedgerImport.document.transactions.length} รายการ
                จะแทนเฉพาะสมุดเงินในเครื่องนี้ พร้อมหมวดและรายการประจำ
                แผนภาษียังคงเดิม
              </p>
              <p>
                สำรองสมุดเงินปัจจุบันก่อนยืนยัน
                การนำเข้าไม่ได้รวมรายการเข้าด้วยกัน
              </p>
              <button
                className="primary full"
                disabled={conflict}
                onClick={() => {
                  const next = pendingLedgerImport.document;
                  if (
                    !store.importBackup(
                      makeSaved(
                        plan,
                        next.transactions,
                        persist,
                        next.settings,
                      ),
                    )
                  )
                    return;
                  setPendingLedgerImport(null);
                  setDialog(null);
                  showToast("นำเข้าสมุดเงินแล้ว ตรวจสถานะบันทึกก่อนปิดเว็บ");
                }}
              >
                ยืนยันแทนสมุดเงิน
              </button>
            </>
          )}
          {dialog === "pause" && (
            <>
              <p>
                บันทึกสำเนาล่าสุดไว้ก่อน แล้วหยุดเก็บการเปลี่ยนแปลงใหม่
                สำเนาเดิมยังเปิดได้เมื่อกลับมา
              </p>
              <button
                className="secondary full"
                onClick={() => {
                  if (store.pauseSaving()) {
                    setDialog(null);
                    showToast("พักการบันทึกแล้ว สำเนาล่าสุดยังอยู่");
                  }
                }}
              >
                ยืนยันพักการบันทึก
              </button>
            </>
          )}
          {dialog === "clear" && (
            <>
              <p>
                ลบแผนภาษี รายการเงิน และสำเนากู้คืนทั้งหมดในเบราว์เซอร์นี้
                ไฟล์ที่ดาวน์โหลดแล้วต้องลบเอง
              </p>
              <button className="secondary full" onClick={exportBackup}>
                สำรองข้อมูล (JSON) ก่อนลบ
              </button>
              <button className="danger full" onClick={clearAll}>
                ยืนยันล้างข้อมูล
              </button>
            </>
          )}
          {dialog === "reload" && (
            <>
              <p>
                แทนข้อมูลหน้านี้ด้วยสำเนาล่าสุดจากอีกแท็บ
                จะเก็บข้อมูลที่ยังไม่ได้บันทึกเป็นสำเนากู้คืนก่อน
              </p>
              <button className="secondary full" onClick={exportBackup}>
                ดาวน์โหลดข้อมูลหน้านี้
              </button>
              <button
                className="primary full"
                onClick={() => {
                  if (store.reloadLatest()) {
                    setDialog(null);
                    showToast("โหลดข้อมูลล่าสุดแล้ว");
                  }
                }}
              >
                โหลดข้อมูลล่าสุด
              </button>
            </>
          )}
          {dialog === "import" && pendingImport && (
            <>
              <p>
                ไฟล์มี {pendingImport.transactions.length} รายการเงิน และแผนภาษี
                กฎ {pendingImport.ruleVersion}
              </p>
              <p>
                ข้อมูลหน้านี้จะถูกแทนที่ โดยเก็บสำเนากู้คืนก่อนนำเข้า
                {pendingImport.ruleVersion !==
                rulesFor(pendingImport.taxPlan).version
                  ? " แผนจากกฎคนละรุ่นต้องตรวจและยืนยันสิทธิ์ใหม่"
                  : ""}
              </p>
              <button className="secondary full" onClick={exportBackup}>
                สำรองข้อมูลปัจจุบัน
              </button>
              <button
                className="primary full"
                onClick={() => {
                  if (store.importBackup(pendingImport)) {
                    setDialog(null);
                    setPendingImport(null);
                    navigate("ledger");
                    showToast("นำเข้าข้อมูลแล้ว");
                  }
                }}
              >
                ยืนยันนำเข้า
              </button>
            </>
          )}
          {storageError && (
            <p className="inline-error" role="alert">
              {storageError}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
function Home({
  navigate,
  saveStatus,
  onSave,
  navOffset,
}: {
  navigate: (v: View) => void;
  saveStatus: string;
  onSave: () => void;
  navOffset: number;
}) {
  return (
    <section
      className="home mytax-home"
      style={{ "--home-nav-offset": `${navOffset}px` } as React.CSSProperties}
    >
      <HomeOpening onTax={() => navigate("tax")} />
      <div className="home-content">
        <ScrollStory navOffset={navOffset} />
        <p className="home-closing-line">ง่ายแบบนี้… ต้องเลือก MyTax</p>
        <div className="hero layered-hero home-closing" id="home-start">
          <div className="hero-copy">
            <h2>
              ภาษีของคุณ
              <br />
              เห็นภาพได้
            </h2>
            <p>รู้ภาษีทั้งปี ลองลดหย่อน แล้ววางแผนเงินของคุณ</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => navigate("tax")}>
                คำนวณของฉัน <ArrowUpRight size={19} />
              </button>
              <button className="secondary" onClick={() => navigate("ledger")}>
                สมุดเงิน <BookOpen size={17} />
              </button>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={14} /> ไม่ต้องสมัคร
              </span>
              <span>
                <LockKeyhole size={14} />{" "}
                <button className="text-button" onClick={onSave}>
                  {saveStatus}
                </button>
              </span>
            </div>
          </div>
          <HeroScene />
        </div>
        <div className="scope-strip">
          <BriefcaseBusiness size={18} />
          <span>เงินเดือน + โบนัส · เลือกปี 2568 หรือวางแผนปี 2569</span>
        </div>
      </div>
    </section>
  );
}

// Apply the saved theme before controls mount, avoiding a light-to-dark fade.
applyTheme(readTheme());
createRoot(document.getElementById("root")!).render(<App />);
