import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  User,
  Eye,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import api from "../lib/api";

export interface Submission {
  id: number;
  full_name: string;
  bulgarian_id: string;
  course_id: number;
  course?: { id: number; name: string; name_en?: string; name_bg?: string };
  agent_id: number;
  agent?: { id: number; name: string };
  status: string;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
}

export default function SubmissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const STATUS_STYLES: Record<string, string> = {
    processed: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
    correction_required: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30",
    pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
  };

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await api.get("/submissions");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await api.get("/courses");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const filteredData = useMemo(() => {
    if (!submissions) return [];
    return submissions
      .filter((sub) => {
        const matchSearch = searchTerm
          ? sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.bulgarian_id?.includes(searchTerm)
          : true;
        const matchStatus = statusFilter ? sub.status === statusFilter : true;
        const matchCourse = courseFilter
          ? (sub.course_id?.toString() === courseFilter || sub.course?.id?.toString() === courseFilter)
          : true;

        return matchSearch && matchStatus && matchCourse;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [submissions, searchTerm, statusFilter, courseFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed": return <CheckCircle2 size={12} />;
      case "rejected": return <XCircle size={12} />;
      case "correction_required": return <AlertTriangle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-[#d32f2f] tracking-tight">
          {t("submissions")}
        </h1>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-(--card) p-6 rounded-2xl shadow-sm border border-(--border) flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input
            type="text"
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-(--input) border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-(--input) rounded-lg opacity-40">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('filters')}</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3.5 bg-(--input) border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none min-w-[160px] font-black text-xs uppercase tracking-wider"
          >
            <option value="">{t("all_statuses")}</option>
            <option value="pending">{t("status_pending")}</option>
            <option value="processed">{t("status_processed")}</option>
            <option value="rejected">{t("status_rejected")}</option>
            <option value="correction_required">{t("status_correction_required")}</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-3.5 bg-(--input) border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none min-w-[160px] font-black text-xs uppercase tracking-wider"
          >
            <option value="">{t("all_courses")}</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-(--card) rounded-3xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) whitespace-nowrap">
                <tr>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40 w-16 text-center">#</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40">{t("bulgarian_id")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40">{t("full_name")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40">{t("course")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40 hidden md:table-cell">{t("agent")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40">{t("date")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40 text-center">{t("status")}</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] opacity-40 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center opacity-40 italic font-bold">
                      {t("no_submissions_found")}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((sub, index) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-(--input)/40 transition-all cursor-pointer group"
                      onClick={() => navigate(`/submissions/${sub.id}`)}
                    >
                      <td className="px-6 py-5 font-bold opacity-20 text-center">{index + 1}</td>
                      <td className="px-6 py-5 font-black tracking-wider text-xs">{sub.bulgarian_id}</td>
                      <td className="px-6 py-5 font-black text-(--foreground) tracking-tight">{sub.full_name}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tight border border-indigo-100/50 dark:border-indigo-900/30">
                          {sub.course?.name || courses?.find(c => c.id === Number(sub.course_id))?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight border border-slate-100 dark:border-slate-800">
                          <User size={10} className="opacity-40" />
                          {sub.agent?.name || sub.agent_id}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold opacity-60 whitespace-nowrap text-xs">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${STATUS_STYLES[sub.status] || STATUS_STYLES.pending}`}>
                          {getStatusIcon(sub.status)}
                          {t(`status_${sub.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/submissions/${sub.id}`}
                            className="p-2.5 bg-red-50 dark:bg-red-900/20 text-[#d32f2f] rounded-xl hover:bg-[#d32f2f] hover:text-white transition-all shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
