import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Globe,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  XCircle,
} from "lucide-react";
import api from "../lib/api";
import type { Agent } from "./AgentsPage";

interface Submission {
  id: number;
  full_name: string;
  bulgarian_id: string;
  status: string;
  course: {
    name_en: string;
    name_bg: string;
  };
  created_at: string;
}

interface AgentDetails extends Agent {
  submissions: Submission[];
}

export default function AgentDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isBG = i18n.language === "bg";

  const {
    data: agent,
    isLoading,
    error,
  } = useQuery<AgentDetails>({
    queryKey: ["agent", id],
    queryFn: async () => {
      const response = await api.get(`/agents/${id}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
        <p className="mt-4 text-sm opacity-50 font-medium animate-pulse">
          {t("loading", "Loading...")}
        </p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle size={48} />
        <p className="mt-4 font-bold">Error loading agent details</p>
        <Link
          to="/agents"
          className="mt-4 text-[#d32f2f] flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Agents
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
      processed:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
      rejected:
        "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
      correction_required:
        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={12} />,
      processed: <CheckCircle2 size={12} />,
      rejected: <XCircle size={12} />,
      correction_required: <AlertCircle size={12} />,
    };

    const statusObj = styles[status] || styles.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${statusObj}`}
      >
        {icons[status] || icons.pending}
        {t(`status_${status}`)}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <Link
          to="/agents"
          className="inline-flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:text-[#d32f2f] transition-all mb-8 group"
        >
          <div className="p-1.5 rounded-lg bg-(--input) group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
            <ArrowLeft size={16} />
          </div>
          {t("back_to_agents")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-[#d32f2f] shadow-lg shadow-red-500/5">
              <UserIcon size={48} />
            </div>
            <div className="pt-2">
              <h1 className="text-4xl font-black text-(--foreground) tracking-tight leading-none mb-2">
                {agent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-60">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {agent.email}
                </span>
                <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                <span className="flex items-center gap-1.5">
                  <Globe size={14} /> {agent.preferred_language?.toUpperCase()}{" "}
                  {t("field_agent")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                agent.is_active
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800"
              }`}
            >
              {agent.is_active ? t("active") : t("inactive")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Widgets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-(--card) rounded-3xl border border-(--border) p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
              {t("agent_overview")}
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-(--foreground)">
                      {agent.submissions_count}
                    </p>
                    <p className="text-[10px] font-bold opacity-50 uppercase">
                      {t("total_submissions")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-(--foreground)">
                      {new Date(agent.created_at).toLocaleDateString(
                        i18n.language
                      )}
                    </p>
                    <p className="text-[10px] font-bold opacity-50 uppercase">
                      {t("onboarded_on")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-(--border)">
                <div
                  className="flex items-center justify-between group cursor-help"
                  title="Combined activity metrics"
                >
                  <p className="text-xs font-bold opacity-60">
                    {t("status_history")}
                  </p>
                  <Activity size={14} className="opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-2">
          <div className="bg-(--card) rounded-3xl border border-(--border) overflow-hidden shadow-sm">
            <div className="p-6 border-b border-(--border) flex items-center justify-between">
              <h3 className="font-black text-(--foreground) tracking-tight">
                {t("recent_submissions")}
              </h3>
              <FileText size={18} className="opacity-30" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-(--input) text-(--foreground) whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 font-bold">{t("bulgarian_id")}</th>
                    <th className="px-6 py-4 font-bold">{t("full_name")}</th>
                    <th className="px-6 py-4 font-bold">{t("course")}</th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t("status")}
                    </th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {agent.submissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center opacity-50 italic"
                      >
                        {t("no_submissions_found")}
                      </td>
                    </tr>
                  ) : (
                    agent.submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="hover:bg-(--input)/30 transition-colors group"
                      >
                        <td className="px-6 py-4 font-bold text-xs tracking-wider">
                          {submission.bulgarian_id}
                        </td>
                        <td className="px-6 py-4 font-bold text-(--foreground) tracking-tight">
                          {submission.full_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium opacity-70">
                            {isBG
                              ? submission.course.name_bg
                              : submission.course.name_en}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/submissions`}
                            className="p-2 text-slate-400 hover:text-[#d32f2f] transition-all inline-block"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
