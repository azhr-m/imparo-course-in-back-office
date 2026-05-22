import { Link } from "react-router-dom";
import { ChevronLeft, Mail, Phone, Clock, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SupportPage() {
  const { t } = useTranslation();

  const faqs = [
    { q: t("support_faq1_q"), a: t("support_faq1_a") },
    { q: t("support_faq2_q"), a: t("support_faq2_a") },
  ];

  return (
    <div className="min-h-screen bg-(--background) flex flex-col font-sans text-(--foreground)">
      <header className="h-16 border-b border-(--border) flex items-center px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-(--foreground) opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
          {t("back_to_home") || "Back to Home"}
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {t("support_title")}
        </h1>

        <div className="space-y-12">
          {/* Section 1: Contact Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>{t("support_sec1_title")}</span>
            </h2>
            <p className="opacity-90 leading-relaxed mb-6">
              {t("support_sec1_desc")}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Email Card */}
              <div className="bg-(--card) border border-(--border) rounded-xl p-6 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-semibold mb-1">
                  {t("support_email_label")}
                </h3>
                <a
                  href="mailto:support@imparo.ee"
                  className="text-red-600 dark:text-red-400 hover:underline font-medium text-sm break-all"
                >
                  support@imparo.ee
                </a>
              </div>

              {/* Phone Card */}
              <div className="bg-(--card) border border-(--border) rounded-xl p-6 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="font-semibold mb-1">
                  {t("support_phone_label")}
                </h3>
                <a
                  href="tel:+359889066690"
                  className="text-red-600 dark:text-red-400 hover:underline font-medium text-sm"
                >
                  + (359) 88 90 666 90
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-(--card) border border-(--border) rounded-xl p-6 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="font-semibold mb-1">
                  {t("support_hours_label")}
                </h3>
                <p className="text-sm opacity-80 leading-snug whitespace-pre-line">
                  {t("support_hours_value")}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: FAQ */}
          <section>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <HelpCircle size={22} className="text-red-600" />
              <span>{t("support_sec2_title")}</span>
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-(--card) border border-(--border) rounded-lg p-5"
                >
                  <h3 className="font-semibold text-base mb-2 flex items-start gap-2">
                    <span className="text-red-600 select-none">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <div className="flex items-start gap-2 text-sm opacity-90 leading-relaxed pl-5 relative border-l-2 border-red-500/20">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
