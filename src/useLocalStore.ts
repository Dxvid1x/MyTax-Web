import { emptyLedgerSettings, type LedgerSettings } from "./ledgerExtras.ts";
import { useEffect, useRef, useState } from "react";
import { emptyPlan, CURRENT_YEAR, rulesFor, type TaxPlan } from "./tax.ts";
import type { Transaction } from "./ledger.ts";
import {
  applyStatementImport,
  emptyStatementImports,
} from "./statementIdentity.ts";
import type {
  StatementImportState,
  StatementImportIntent,
} from "./statementTypes.ts";
import {
  STORAGE_KEY,
  LEGACY_KEYS,
  readLocal,
  makeSaved,
  writeSaved,
  preserveRecovery,
  dataSignature,
  StorageConflict,
  serializeSaved,
  withLocalSavedWriteLock,
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
  const [statementImports, setStatementImports] =
    useState<StatementImportState>(
      initial.data?.statementImports || emptyStatementImports(),
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
  const saveGeneration = useRef(0);
  const flags = useRef({ conflict, needsReview });
  flags.current = { conflict, needsReview };
  const latest = useRef({
    plan,
    transactions,
    persist,
    ledgerSettings,
    statementImports,
  });
  latest.current = {
    plan,
    transactions,
    persist,
    ledgerSettings,
    statementImports,
  };
  const baseline = useRef(
      dataSignature(plan, transactions, ledgerSettings, statementImports),
    ),
    dirty = useRef(false);
  dirty.current =
    dataSignature(plan, transactions, ledgerSettings, statementImports) !==
    baseline.current;
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
  const saveNow = async (autoSave: boolean, review = false) => {
    const generation = saveGeneration.current;
    if (conflict) {
      setStorageError("สำรองข้อมูลหน้านี้ แล้วโหลดข้อมูลล่าสุดจากอีกแท็บก่อน");
      return false;
    }
    if (needsReview && !review) return false;
    try {
      return await withLocalSavedWriteLock(() => {
        if (
          generation !== saveGeneration.current ||
          flags.current.conflict ||
          (flags.current.needsReview && !review) ||
          (autoSave && !review && !latest.current.persist)
        )
          return false;
        const { plan, transactions, ledgerSettings, statementImports } =
          latest.current;
        expected.current = writeSaved(
          localStorage,
          makeSaved(
            plan,
            transactions,
            autoSave,
            ledgerSettings,
            statementImports,
          ),
          expected.current,
          review ? original.current || undefined : undefined,
        );
        original.current = null;
        setNeedsReview(false);
        baseline.current = dataSignature(
          plan,
          transactions,
          ledgerSettings,
          statementImports,
        );
        dirty.current = false;
        setStorageOk(true);
        setStorageError("");
        return true;
      });
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
  }, [
    persist,
    plan,
    transactions,
    ledgerSettings,
    statementImports,
    conflict,
    needsReview,
  ]);
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
      saveGeneration.current++;
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
                latest.current.statementImports,
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
      // An async lock cannot be relied on during page unload.
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
  const enableSaving = async () => {
    saveGeneration.current++;
    if (await saveNow(true, true)) {
      saveGeneration.current++;
      latest.current = { ...latest.current, persist: true };
      setPersist(true);
      return true;
    }
    return false;
  };
  const pauseSaving = async () => {
    saveGeneration.current++;
    if (await saveNow(false)) {
      saveGeneration.current++;
      latest.current = { ...latest.current, persist: false };
      setPersist(false);
      return true;
    }
    return false;
  };
  const reloadLatest = async () => {
    saveGeneration.current++;
    try {
      return await withLocalSavedWriteLock(() => {
        saveGeneration.current++;
        const current = latest.current;
        const state = readLocal(localStorage);
        if (dirty.current)
          preserveRecovery(
            localStorage,
            serializeSaved(
              makeSaved(
                current.plan,
                current.transactions,
                false,
                current.ledgerSettings,
                current.statementImports,
              ),
            ),
          );
        expected.current = state.primary;
        original.current = state.warnings.length ? state.raw : null;
        const nextPlan = state.data?.taxPlan || emptyPlan(CURRENT_YEAR),
          nextRows = state.data?.transactions || [];
        setUiRevision((value) => value + 1);
        const nextSettings =
          state.data?.ledgerSettings || emptyLedgerSettings();
        latest.current = {
          plan: nextPlan,
          transactions: nextRows,
          ledgerSettings: nextSettings,
          statementImports:
            state.data?.statementImports || emptyStatementImports(),
          persist: !!state.data?.autoSave && !state.warnings.length,
        };
        setLedgerSettings(nextSettings);
        setPlan(nextPlan);
        setTransactions(nextRows);
        setStatementImports(
          state.data?.statementImports || emptyStatementImports(),
        );
        baseline.current = dataSignature(
          nextPlan,
          nextRows,
          nextSettings,
          state.data?.statementImports,
        );
        dirty.current = false;
        setNeedsReview(!!state.warnings.length);
        setConflict(false);
        setPersist(!!state.data?.autoSave && !state.warnings.length);
        setStorageOk(!!state.data && !state.warnings.length);
        setStorageError(state.warnings.join(" "));
        return true;
      });
    } catch (error) {
      fail(error);
      return false;
    }
  };
  const importBackup = async (data: Saved) => {
    saveGeneration.current++;
    try {
      return await withLocalSavedWriteLock(() => {
        saveGeneration.current++;
        const current = latest.current;
        if (
          flags.current.conflict ||
          localStorage.getItem(STORAGE_KEY) !== expected.current
        )
          throw new StorageConflict();
        preserveRecovery(
          localStorage,
          serializeSaved(
            makeSaved(
              current.plan,
              current.transactions,
              false,
              current.ledgerSettings,
              current.statementImports,
            ),
          ),
        );
        if (original.current) preserveRecovery(localStorage, original.current);
        if (current.persist)
          expected.current = writeSaved(
            localStorage,
            makeSaved(
              data.taxPlan,
              data.transactions,
              true,
              data.ledgerSettings,
              data.statementImports,
            ),
            expected.current,
          );
        latest.current = {
          ...current,
          plan: data.taxPlan,
          transactions: data.transactions,
          ledgerSettings: data.ledgerSettings,
          statementImports: data.statementImports,
        };
        if (current.persist) {
          baseline.current = dataSignature(
            data.taxPlan,
            data.transactions,
            data.ledgerSettings,
            data.statementImports,
          );
          dirty.current = false;
        }
        setUiRevision((value) => value + 1);
        setLedgerSettings(data.ledgerSettings);
        setPlan(data.taxPlan);
        setTransactions(data.transactions);
        setStatementImports(data.statementImports);
        original.current = null;
        setNeedsReview(false);
        setStorageError(
          data.ruleVersion !== rulesFor(data.taxPlan).version
            ? "นำเข้าแล้ว แผนจากกฎคนละรุ่นต้องตรวจและยืนยันสิทธิ์ใหม่"
            : "",
        );
        return true;
      });
    } catch (error) {
      fail(error);
      return false;
    }
  };
  const clearAll = async () => {
    saveGeneration.current++;
    try {
      return await withLocalSavedWriteLock(() => {
        saveGeneration.current++;
        if (localStorage.getItem(STORAGE_KEY) !== expected.current)
          throw new StorageConflict();
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
        setStatementImports(emptyStatementImports());
        setLedgerSettings(emptyLedgerSettings());
        latest.current = {
          plan: emptyPlan(CURRENT_YEAR),
          transactions: [],
          persist: false,
          ledgerSettings: emptyLedgerSettings(),
          statementImports: emptyStatementImports(),
        };
        baseline.current = dataSignature(emptyPlan(CURRENT_YEAR), []);
        dirty.current = false;
        setStorageError("");
        setStorageOk(false);
        return true;
      });
    } catch (error) {
      fail(error);
      return false;
    }
  };
  const commitStatementImport = async (
    intent: StatementImportIntent,
    options?: { signal?: AbortSignal },
  ) => {
    saveGeneration.current++;
    try {
      if (conflict || needsReview) throw new StorageConflict();
      return await withLocalSavedWriteLock(() => {
        saveGeneration.current++;
        if (options?.signal?.aborted) throw new Error("ยกเลิกการนำเข้าแล้ว");
        if (flags.current.conflict || flags.current.needsReview)
          throw new StorageConflict();
        if (localStorage.getItem(STORAGE_KEY) !== expected.current)
          throw new StorageConflict();
        const current = latest.current;
        const result = applyStatementImport(
          intent,
          current.transactions,
          current.statementImports,
        );
        if (!result.added) return { ok: true as const, added: 0 };
        const saved = makeSaved(
          current.plan,
          result.transactions,
          current.persist,
          current.ledgerSettings,
          result.statementImports,
        );
        serializeSaved(saved);
        if (current.persist)
          expected.current = writeSaved(localStorage, saved, expected.current);
        latest.current = {
          ...current,
          transactions: result.transactions,
          statementImports: result.statementImports,
        };
        setTransactions(result.transactions);
        setStatementImports(result.statementImports);
        if (current.persist) {
          baseline.current = dataSignature(
            current.plan,
            result.transactions,
            current.ledgerSettings,
            result.statementImports,
          );
          dirty.current = false;
          setStorageOk(true);
        }
        return { ok: true as const, added: result.added };
      }, latest.current.persist);
    } catch (error) {
      if (error instanceof StorageConflict) fail(error);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "นำเข้าไม่ได้",
      };
    }
  };
  return {
    statementImports,
    commitStatementImport,
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
