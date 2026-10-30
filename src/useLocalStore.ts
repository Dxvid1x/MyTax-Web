import { FOLLOWUP_KEY } from "./followupStorage.ts";
import { emptyLedgerSettings, type LedgerSettings } from "./ledgerExtras.ts";
import { useEffect, useRef, useState } from "react";
import { emptyPlan, CURRENT_YEAR, rulesFor, type TaxPlan } from "./tax.ts";
import type { Transaction } from "./ledger.ts";
import {
  STORAGE_KEY,
  LEGACY_KEYS,
  readLocal,
  makeSaved,
  writeSaved,
  preserveRecovery,
  dataSignature,
  StorageConflict,
  type Saved,
} from "./storage.ts";

export function useLocalStore() {
  const [initial] = useState(() => {
    try {
      return { ...readLocal(localStorage), error: "" };
    } catch {
      return {
        key: undefined,
        raw: null,
        primary: null,
        data: null,
        warnings: [],
        rejected: 0,
        error: "เบราว์เซอร์ไม่อนุญาตให้อ่านข้อมูลในเครื่อง ยังไม่เปิดการบันทึก",
      };
    }
  });
  const [plan, setPlan] = useState<TaxPlan>(
    initial.data?.taxPlan || emptyPlan(CURRENT_YEAR),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    initial.data?.transactions || [],
  );
  const [ledgerSettings, setLedgerSettings] = useState<LedgerSettings>(
    initial.data?.ledgerSettings || emptyLedgerSettings(),
  );
  const [persist, setPersist] = useState(
    !!initial.data?.autoSave && !initial.warnings.length,
  );
  const [storageError, setStorageError] = useState(
    initial.error || initial.warnings.join(" "),
  );
  const [storageOk, setStorageOk] = useState(
    !!initial.data && !initial.warnings.length,
  );
  const [conflict, setConflict] = useState(false);
  const [uiRevision, setUiRevision] = useState(0);
  const expected = useRef(initial.primary);
  const original = useRef(initial.warnings.length ? initial.raw : null);
  const [needsReview, setNeedsReview] = useState(!!initial.warnings.length);
  const latest = useRef({ plan, transactions, persist, ledgerSettings });
  latest.current = { plan, transactions, persist, ledgerSettings };
  const baseline = useRef(dataSignature(plan, transactions, ledgerSettings)),
    dirty = useRef(false);
  dirty.current =
    dataSignature(plan, transactions, ledgerSettings) !== baseline.current;
  const fail = (error: unknown) => {
    setStorageOk(false);
    if (error instanceof StorageConflict) {
      setConflict(true);
      setPersist(false);
      setStorageError(error.message);
    } else
      setStorageError(
        "บันทึกไม่สำเร็จ ข้อมูลยังอยู่ในหน้านี้ โปรดสำรองข้อมูล (JSON) ก่อนปิด",
      );
  };
  const saveNow = (autoSave: boolean, review = false) => {
    if (conflict) {
      setStorageError("สำรองข้อมูลหน้านี้ แล้วโหลดข้อมูลล่าสุดจากอีกแท็บก่อน");
      return false;
    }
    if (needsReview && !review) return false;
    try {
      const { plan, transactions, ledgerSettings } = latest.current;
      expected.current = writeSaved(
        localStorage,
        makeSaved(plan, transactions, autoSave, ledgerSettings),
        expected.current,
        review ? original.current || undefined : undefined,
      );
      original.current = null;
      setNeedsReview(false);
      baseline.current = dataSignature(plan, transactions, ledgerSettings);
      dirty.current = false;
      setStorageOk(true);
      setStorageError("");
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };
  useEffect(() => {
    if (
      !persist ||
      conflict ||
      needsReview ||
      (!dirty.current && expected.current !== null)
    )
      return;
    setStorageOk(false);
    const timer = setTimeout(() => saveNow(true), 350);
    return () => clearTimeout(timer);
  }, [persist, plan, transactions, ledgerSettings, conflict, needsReview]);
  useEffect(() => {
    const storage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (
        event.key !== STORAGE_KEY &&
        event.key !== null &&
        !(
          initial.key &&
          LEGACY_KEYS.includes(initial.key) &&
          event.key === initial.key
        )
      )
        return;
      if (event.key === STORAGE_KEY && event.newValue === expected.current)
        return;
      // Preserve this tab's copy even when it had already saved before the other tab changed it.
      if (!conflict) {
        try {
          preserveRecovery(
            localStorage,
            JSON.stringify(
              makeSaved(
                latest.current.plan,
                latest.current.transactions,
                false,
                latest.current.ledgerSettings,
              ),
            ),
          );
        } catch {
          /* Keep the in-memory copy available for JSON export. */
        }
      }
      setConflict(true);
      setPersist(false);
      setStorageOk(false);
      setStorageError(
        "ข้อมูลเปลี่ยนจากอีกแท็บแล้ว พักการบันทึก หน้านี้ยังมีข้อมูลเดิมให้สำรองก่อนโหลดข้อมูลล่าสุด",
      );
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current && latest.current.persist) saveNow(true);
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const hidden = () => {
      if (document.hidden && dirty.current && latest.current.persist)
        saveNow(true);
    };
    window.addEventListener("storage", storage);
    window.addEventListener("beforeunload", unload);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [conflict, needsReview]);
  const enableSaving = () => {
    if (saveNow(true, true)) {
      setPersist(true);
      return true;
    }
    return false;
  };
  const pauseSaving = () => {
    if (saveNow(false)) {
      setPersist(false);
      return true;
    }
    return false;
  };
  const reloadLatest = () => {
    try {
      const state = readLocal(localStorage);
      if (dirty.current)
        preserveRecovery(
          localStorage,
          JSON.stringify(makeSaved(plan, transactions, false, ledgerSettings)),
        );
      expected.current = state.primary;
      original.current = state.warnings.length ? state.raw : null;
      const nextPlan = state.data?.taxPlan || emptyPlan(CURRENT_YEAR),
        nextRows = state.data?.transactions || [];
      setUiRevision((value) => value + 1);
      const nextSettings = state.data?.ledgerSettings || emptyLedgerSettings();
      setLedgerSettings(nextSettings);
      setPlan(nextPlan);
      setTransactions(nextRows);
      baseline.current = dataSignature(nextPlan, nextRows, nextSettings);
      dirty.current = false;
      setNeedsReview(!!state.warnings.length);
      setConflict(false);
      setPersist(!!state.data?.autoSave && !state.warnings.length);
      setStorageOk(!!state.data && !state.warnings.length);
      setStorageError(state.warnings.join(" "));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };
  const importBackup = (data: Saved) => {
    try {
      if (conflict || localStorage.getItem(STORAGE_KEY) !== expected.current)
        throw new StorageConflict();
      preserveRecovery(
        localStorage,
        JSON.stringify(makeSaved(plan, transactions, false, ledgerSettings)),
      );
      if (original.current) preserveRecovery(localStorage, original.current);
      setUiRevision((value) => value + 1);
      setLedgerSettings(data.ledgerSettings);
      setPlan(data.taxPlan);
      setTransactions(data.transactions);
      original.current = null;
      setNeedsReview(false);
      setStorageError(
        data.ruleVersion !== rulesFor(data.taxPlan).version
          ? "นำเข้าแล้ว แผนจากกฎคนละรุ่นต้องตรวจและยืนยันสิทธิ์ใหม่"
          : "",
      );
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };
  const clearAll = () => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== expected.current)
        throw new StorageConflict();
      localStorage.removeItem(FOLLOWUP_KEY);
      localStorage.removeItem(STORAGE_KEY);
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
      for (const key of Object.keys(localStorage).filter((key) =>
        key.startsWith("mytax.recovery."),
      ))
        localStorage.removeItem(key);
      expected.current = null;
      original.current = null;
      setNeedsReview(false);
      setConflict(false);
      setPersist(false);
      setUiRevision((value) => value + 1);
      setPlan(emptyPlan(CURRENT_YEAR));
      setTransactions([]);
      setLedgerSettings(emptyLedgerSettings());
      baseline.current = dataSignature(emptyPlan(CURRENT_YEAR), []);
      dirty.current = false;
      setStorageError("");
      setStorageOk(false);
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };
  return {
    ledgerSettings,
    setLedgerSettings,
    uiRevision,
    plan,
    setPlan,
    transactions,
    setTransactions,
    persist,
    storageOk,
    storageError,
    conflict,
    needsReview,
    originalRaw: original.current,
    enableSaving,
    pauseSaving,
    reloadLatest,
    importBackup,
    clearAll,
  };
}
