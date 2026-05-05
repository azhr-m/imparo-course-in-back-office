import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Key,
  Mail,
  ShieldCheck,
  Download,
  Smartphone,
} from "lucide-react";
import api from "../lib/api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ActivatePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const email = searchParams.get("email");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(!email || !expires || !signature ? "error" : "idle");
  const [errorMessage, setErrorMessage] = useState(
    !email || !expires || !signature ? t("invalid_activation_link") : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setErrorMessage(t("passwords_not_match", "Passwords do not match."));
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const queryParams = new URLSearchParams({
        email: email || "",
        expires: expires || "",
        signature: signature || "",
      }).toString();

      await api.post(`/auth/activate?${queryParams}`, {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setStatus("success");
    } catch (error: unknown) {
      const apiErr = error as ApiError;
      setStatus("error");
      setErrorMessage(
        apiErr.response?.data?.message || t("invalid_activation_link")
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          {/* Logo/Header Area */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-red-50 dark:bg-red-900/10 mb-6 group">
              <ShieldCheck
                className="text-[#d32f2f] group-hover:scale-110 transition-transform"
                size={40}
              />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {status === "success"
                ? t("activation_success_title")
                : t("activation_title")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium px-4">
              {status === "success"
                ? t("activation_success_subtitle")
                : t("activation_subtitle")}
            </p>
          </div>

          {status === "success" ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center gap-4 py-8 px-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle2 className="text-emerald-500" size={64} />
                <p className="text-center font-bold text-emerald-800 dark:text-emerald-400">
                  {t("activation_success_message")}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl text-[#d32f2f]">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                      {t("working_as_agent_question")}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                      {t("download_app_message")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <a
                    href={`${import.meta.env.VITE_APP_URL || ""}`}
                    className="flex items-center justify-center gap-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-lg font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  >
                    <Download size={20} />
                    {t("download_android")}
                  </a>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm font-bold text-[#d32f2f] hover:underline"
                >
                  {t("go_to_portal")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 animate-in shake duration-500">
                  <XCircle size={20} className="shrink-0" />
                  <p className="text-sm font-bold">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  {t("email_address")}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    disabled
                    value={email || ""}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  {t("set_password_label")}
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#d32f2f] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                    placeholder={t("password_hint")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  {t("confirm_password_label")}
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#d32f2f] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                    placeholder={t("confirm_password_placeholder")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "error"}
                className="w-full bg-[#d32f2f] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#b71c1c] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  t("activate_button")
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">
              By activating your account, you agree to our <br />
              <span className="text-[#d32f2f] hover:underline cursor-pointer font-bold">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-[#d32f2f] hover:underline cursor-pointer font-bold">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
