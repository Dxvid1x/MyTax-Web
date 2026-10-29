import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Download,
  WifiOff,
  RefreshCw,
  Settings,
  HardDrive,
} from "lucide-react";
import "./settings.css";
import { applyTheme, readTheme, type Theme } from "./theme.ts";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function AppTools({
  onSave,
  saveStatus,
}: {
  onSave: () => void;
  saveStatus: string;
}) {
  const settings = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const settingsOpen = hovered || pinned;
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const closeSettings = () => {
    setHovered(false);
    setPinned(false);
    setInstallHelp(false);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!settings.current?.contains(event.target as Node)) {
        setHovered(false);
        setPinned(false);
        setInstallHelp(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyTheme(theme);
    apply();
    try {
      localStorage.setItem("mytax.theme", theme);
    } catch {
      /* Preferences are optional. */
    }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine);
    const installPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const installed = () => {
      setInstall(null);
      setInstallHelp(false);
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    window.addEventListener("beforeinstallprompt", installPrompt);
    window.addEventListener("appinstalled", installed);
    let alive = true;
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (!alive) return;
          if (reg.waiting) setWaiting(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (!alive || worker.state !== "installed") return;
              if (navigator.serviceWorker.controller) setWaiting(worker);
              else setOfflineReady(true);
            });
          });
          navigator.serviceWorker.ready.then(() => {
            if (alive) setOfflineReady(true);
          });
        })
        .catch(() => {
          /* Online mode remains usable if offline caching is unavailable. */
        });
    }
    return () => {
      alive = false;
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
      window.removeEventListener("beforeinstallprompt", installPrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  const update = () => {
    // Do not reload automatically: the user gets a chance to back up unsaved work.
    if (
      !waiting ||
      !window.confirm(
        "สำรองหรือบันทึกข้อมูลแล้วใช่ไหม? เว็บจะรีโหลดเพื่ออัปเดต",
      )
    )
      return;
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => location.reload(),
      { once: true },
    );
    waiting.postMessage({ type: "SKIP_WAITING" });
  };
  return (
    <div className="app-tools">
      <div
        className="app-settings"
        ref={settings}
        data-open={settingsOpen}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setHovered(false);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            closeSettings();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeSettings();
            settingsButton.current?.focus();
            event.stopPropagation();
          }
        }}
      >
        <button
          type="button"
          className="settings-trigger"
          ref={settingsButton}
          aria-expanded={settingsOpen}
          aria-controls="settings-drawer"
          onClick={() => {
            setHovered(false);
            setPinned((value) => !value);
            setInstallHelp(false);
          }}
        >
          <Settings size={17} aria-hidden="true" /> ตั้งค่า
        </button>
        <div
          id="settings-drawer"
          className="settings-drawer"
          inert={!settingsOpen}
          aria-hidden={!settingsOpen}
        >
          <div className="theme-options" role="group" aria-label="ธีมหน้าจอ">
            {(
              [
                { value: "system", label: "ตามเครื่อง", Icon: Monitor },
                { value: "light", label: "สว่าง", Icon: Sun },
                { value: "dark", label: "มืด", Icon: Moon },
              ] as const
            ).map(({ value, label, Icon }) => (
              <button
                type="button"
                key={value}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="settings-install"
            aria-label="ติดตั้งแอป"
            title="ติดตั้งแอป"
            onClick={async () => {
              if (install) {
                await install.prompt();
                const choice = await install.userChoice;
                if (choice.outcome === "accepted") setInstall(null);
              } else {
                setPinned(true);
                setInstallHelp((v) => !v);
              }
            }}
          >
            <Download size={17} aria-hidden="true" />
            ติดตั้งแอป
          </button>
          <button
            className="settings-save"
            onClick={() => {
              closeSettings();
              onSave();
            }}
          >
            <HardDrive size={17} aria-hidden="true" />
            <span>
              บันทึก<small>{saveStatus}</small>
            </span>
          </button>
          {installHelp && (
            <p className="settings-install-help" role="status">
              Chrome/Edge: เมนูเบราว์เซอร์ → ติดตั้งแอป · iPhone: Safari → แชร์
              → เพิ่มไปยังหน้าจอโฮม{" "}
              {offlineReady
                ? "พร้อมใช้งานออฟไลน์ในเบราว์เซอร์นี้"
                : "เปิดเว็บออนไลน์ให้โหลดครบก่อนใช้ออฟไลน์"}
            </p>
          )}
        </div>
      </div>
      {offline && (
        <span className="offline-status" role="status">
          <WifiOff size={15} />
          ออฟไลน์ · ตรวจสถานะบันทึกก่อนปิดเว็บ
        </span>
      )}
      {waiting && (
        <button className="secondary" onClick={update}>
          <RefreshCw size={15} />
          มีอัปเดตใหม่
        </button>
      )}
    </div>
  );
}
