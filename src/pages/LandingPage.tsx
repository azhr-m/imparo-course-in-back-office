import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple,
  Smartphone,
  ShieldCheck,
  Download,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../components/ThemeProvider";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "bg" ? "en" : "bg";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col font-sans">
      <header className="h-16 border-b border-(--border) flex items-center justify-between px-6">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[#d32f2f] bg-white px-1.5 py-0.5 rounded font-black leading-none text-xl"
            style={{ fontFamily: "Impact, var(--font-sans)" }}
          >
            Imparo
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={toggleLanguage}
            className="w-9 h-9 flex items-center justify-center rounded border border-(--border) bg-(--card) hover:bg-(--input) transition-colors text-lg"
            title="Toggle Language"
          >
            {i18n.language === "bg" ? "EN" : "BG"}
          </button>

          <button
            onClick={handleThemeToggle}
            className="w-9 h-9 flex items-center justify-center rounded border border-(--border) bg-(--card) hover:bg-(--input) transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Moon size={16} className="text-indigo-400" />
            ) : (
              <Sun size={16} className="text-orange-400" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-(--foreground)">
          {t("landing_title")}
        </h1>

        <p className="text-lg md:text-xl text-(--foreground) opacity-70 max-w-2xl mb-12">
          {t("landing_subtitle")}
        </p>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-(--card) p-8 rounded border border-(--border) flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 text-[#ef5350] mb-6" />
            <h2 className="text-2xl font-bold mb-2">
              {t("admin_portal_title")}
            </h2>
            <p className="opacity-70 mb-8 text-center grow text-sm">
              {t("admin_portal_desc")}
            </p>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-transparent text-(--foreground) border border-[#d32f2f] hover:bg-[#d32f2f] hover:text-white px-6 py-2 rounded font-medium transition-colors"
            >
              {t("go_to_console")} <ChevronRight size={18} />
            </Link>
          </div>

          <div className="bg-(--card) p-8 rounded border border-(--border) flex flex-col items-center">
            <Smartphone className="w-16 h-16 text-[#ef5350] mb-6" />
            <h2 className="text-2xl font-bold mb-2">
              {t("field_agent_app_title")}
            </h2>
            <p className="opacity-70 mb-8 text-center grow text-sm">
              {t("field_agent_app_desc")}
            </p>
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-[#d32f2f] text-white px-5 py-2.5 rounded font-medium hover:bg-[#b71c1c] transition-colors flex-1 justify-center text-sm"
              >
                <Download size={18} /> {t("download_android")}
              </button>
              <button
                className="flex items-center gap-2 bg-transparent border border-(--border) text-(--foreground) px-5 py-2.5 rounded font-medium hover:bg-(--input) transition-colors flex-1 justify-center opacity-50 cursor-not-allowed text-sm"
                title={t("coming_soon_ios")}
              >
                <Apple size={18} /> iOS
              </button>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) rounded p-8 max-w-sm w-full border border-(--border) relative">
            <h3 className="text-xl font-bold mb-4 text-[#ef5350]">
              {t("android_install_title")}
            </h3>
            <ol className="list-decimal pl-5 space-y-3 opacity-80 mb-8 text-sm">
              <li>{t("android_install_step1")}</li>
              <li>{t("android_install_step2")}</li>
              <li>{t("android_install_step3")}</li>
              <li>{t("android_install_step4")}</li>
            </ol>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="w-full bg-[#d32f2f] text-white p-3 rounded font-medium text-center hover:bg-[#b71c1c] transition text-sm"
                onClick={() => alert(t("download_starting"))}
              >
                {t("download_apk")}
              </a>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-transparent border border-(--border) p-3 rounded font-medium text-center hover:bg-(--input) transition text-sm"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
