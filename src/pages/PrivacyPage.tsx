import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();

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
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t("privacy_title")}</h1>
        
        <div className="space-y-6 opacity-90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec1_title")}</h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy_sec1_desc") }} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec2_title")}</h2>
            <p>{t("privacy_sec2_desc")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("privacy_sec2_item1")}</li>
              <li>{t("privacy_sec2_item2")}</li>
              <li>{t("privacy_sec2_item3")}</li>
              <li>{t("privacy_sec2_item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec3_title")}</h2>
            <p>{t("privacy_sec3_desc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec4_title")}</h2>
            <p>{t("privacy_sec4_desc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec5_title")}</h2>
            <p>{t("privacy_sec5_desc")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("privacy_sec6_title")}</h2>
            <p>{t("privacy_sec6_desc")}</p>
          </section>
          
          <div className="pt-8 text-sm opacity-60">
            {t("privacy_last_updated")} {new Date().toLocaleDateString()}
          </div>
        </div>
      </main>
    </div>
  );
}
