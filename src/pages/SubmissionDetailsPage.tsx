import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  User as UserIcon,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  MapPin,
  ClipboardList,
  UserCheck,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Globe,
} from "lucide-react";
import api from "../lib/api";

interface Course {
  id: number;
  name: string;
  name_en?: string;
  name_bg?: string;
}

interface Document {
  id: number;
  document_type: string;
  view_url: string;
  file_name: string;
}

interface Submission {
  id: number;
  full_name: string;
  phone?: string;
  bulgarian_id: string;
  place_of_birth: string;
  residential_address: string;
  country_of_birth?: string;
  date_of_birth?: string;
  is_foreign: boolean;
  status: string;
  status_notes?: string;
  course_end_date?: string;
  submitted_at: string;
  created_at: string;
  course: Course;
  agent: { id: number; name: string };
  documents: Document[];
}

interface CopyButtonProps {
  text: string;
  fieldId: string;
  copiedId: string | null;
  onCopy: (text: string, fieldId: string) => void;
  tooltip: string;
}

const CopyButton = ({
  text,
  fieldId,
  copiedId,
  onCopy,
  tooltip,
}: CopyButtonProps) => (
  <button
    onClick={() => onCopy(text, fieldId)}
    className="p-1.5 rounded-lg bg-(--input) hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-all ml-2"
    title={tooltip}
  >
    {copiedId === fieldId ? (
      <Check size={14} className="text-emerald-500" />
    ) : (
      <Copy size={14} />
    )}
  </button>
);

export default function SubmissionDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [decisionModal, setDecisionModal] = useState<{
    show: boolean;
    selectedStatus: string | null;
    notes: string;
    courseEndDate: string;
  }>({
    show: false,
    selectedStatus: null,
    notes: "",
    courseEndDate: "",
  });

  const {
    data: submission,
    isLoading,
    error,
  } = useQuery<Submission>({
    queryKey: ["submission", id],
    queryFn: async () => {
      const response = await api.get(`/submissions/${id}`);
      return response.data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      status,
      notes,
      courseEndDate,
    }: {
      status: string;
      notes?: string;
      courseEndDate?: string;
    }) => {
      await api.patch(`/submissions/${id}/status`, {
        status,
        status_notes: notes,
        course_end_date: courseEndDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setDecisionModal({ show: false, selectedStatus: null, notes: "", courseEndDate: "" });
    },
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(fieldId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
        <p className="mt-4 text-sm opacity-50 font-medium animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle size={48} />
        <p className="mt-4 font-bold">Error loading submission details</p>
        <Link
          to="/submissions"
          className="mt-4 text-[#d32f2f] flex items-center gap-2 hover:underline font-bold"
        >
          <ArrowLeft size={16} /> {t("back_to_submissions")}
        </Link>
      </div>
    );
  }

  const STATUS_STYLES: Record<string, string> = {
    processed:
      "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    rejected:
      "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
    correction_required:
      "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30",
    pending:
      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle2 size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      case "correction_required":
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Navigation & Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:text-[#d32f2f] transition-all mb-8 group"
        >
          <div className="p-1.5 rounded-lg bg-(--input) group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
            <ArrowLeft size={16} />
          </div>
          {t("back_to_submissions")}
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-[#d32f2f] shadow-lg shadow-red-500/5">
              <UserIcon size={40} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
                  {submission.full_name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${STATUS_STYLES[submission.status]}`}
                >
                  {getStatusIcon(submission.status)}
                  {t(`status_${submission.status}`)}
                </span>
              </div>
              <p className="text-sm font-bold opacity-50 flex items-center gap-2 italic">
                <ClipboardList size={14} />
                {submission.course.name} • ID: {submission.course.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(submission.status === "pending" ||
              submission.status === "correction_required") && (
              <button
                onClick={() =>
                  setDecisionModal({
                    show: true,
                    selectedStatus:
                      submission.status === "correction_required"
                        ? "correction_required"
                        : null,
                    notes: submission.status_notes || "",
                    courseEndDate: submission.course_end_date || "",
                  })
                }
                className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-8 py-3.5 rounded-xl font-black shadow-xl shadow-red-500/20 transition-all flex items-center gap-2 group active:scale-95"
              >
                <CheckCircle2 size={20} />
                {submission.status === "correction_required"
                  ? t("update_decision")
                  : t("make_decision")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Applicant Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-(--card) rounded-3xl border border-(--border) p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-8">
              {t("applicant_info")}
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("full_name")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="truncate">{submission.full_name}</span>
                  <CopyButton
                    text={submission.full_name}
                    fieldId="name"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    tooltip={t("copy")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("bulgarian_id")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-mono font-bold text-sm">
                  <span>{submission.bulgarian_id}</span>
                  <CopyButton
                    text={submission.bulgarian_id}
                    fieldId="id"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    tooltip={t("copy")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("phone")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <Phone size={14} className="opacity-50" />{" "}
                    {submission.phone || "N/A"}
                  </span>
                  {submission.phone && (
                    <CopyButton
                      text={submission.phone}
                      fieldId="phone"
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      tooltip={t("copy")}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("date_of_birth")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="opacity-50" />{" "}
                    {submission.date_of_birth || "N/A"}
                  </span>
                  {submission.date_of_birth && (
                    <CopyButton
                      text={submission.date_of_birth}
                      fieldId="dob"
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      tooltip={t("copy")}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("place_of_birth")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="opacity-50" />{" "}
                    {submission.place_of_birth}
                  </span>
                  <CopyButton
                    text={submission.place_of_birth}
                    fieldId="pob"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    tooltip={t("copy")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("country_of_birth")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <Globe size={14} className="opacity-50" />{" "}
                    {submission.country_of_birth || "N/A"}
                  </span>
                  {submission.country_of_birth && (
                    <CopyButton
                      text={submission.country_of_birth}
                      fieldId="cob"
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      tooltip={t("copy")}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {t("residential_address")}
                </p>
                <div className="flex items-center justify-between p-3.5 bg-(--input) rounded-xl font-bold text-sm">
                  <span className="truncate text-xs">
                    {submission.residential_address}
                  </span>
                  <CopyButton
                    text={submission.residential_address}
                    fieldId="address"
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    tooltip={t("copy")}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-(--border)">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      {t("submitted_by")}
                    </p>
                    <p className="text-sm font-black text-(--foreground)">
                      {submission.agent.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-(--card) rounded-3xl border border-(--border) p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
              {t("admin_notes")}
            </h3>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <p className="text-sm italic opacity-80 min-h-[60px]">
                {submission.status_notes || t("no_notes_provided")}
              </p>
            </div>
          </div>

          <div className="bg-(--card) rounded-3xl border border-(--border) p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
              {t("course_end_date")}
            </h3>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-3 font-bold text-(--foreground)">
              <Calendar size={18} className="text-blue-500" />
              <span>{submission.course_end_date || t("not_available")}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Document Viewer */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-(--card) rounded-3xl border border-(--border) p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                {t("review_documents")}
              </h3>
              <FileText size={18} className="opacity-30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {submission.documents.map((doc) => (
                <div key={doc.id} className="space-y-3 group text-left">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-black uppercase tracking-tight opacity-70">
                      {t(
                        `document_type_${doc.document_type}`,
                        doc.document_type.replace(/_/g, " ")
                      )}
                    </p>
                    <a
                      href={doc.view_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#d32f2f] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase"
                    >
                      <ExternalLink size={12} /> {t("view")}
                    </a>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-(--border) shadow-inner bg-slate-100 dark:bg-slate-900">
                    <img
                      src={doc.view_url}
                      alt={doc.document_type}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 cursor-pointer"
                      onClick={() => window.open(doc.view_url, "_blank")}
                    />
                  </div>
                </div>
              ))}
            </div>

            {submission.documents.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center opacity-30 italic">
                <FileText size={48} className="mb-4" />
                <p>{t("no_documents_uploaded")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DECISION MODAL */}
      {decisionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) w-full max-w-lg rounded-2xl shadow-2xl border border-(--border) overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">
                  {t("make_decision")}
                </h3>
                <button
                  onClick={() =>
                    setDecisionModal((prev) => ({ ...prev, show: false }))
                  }
                  className="p-2 hover:bg-(--input) rounded-full text-gray-400 hover:text-(--foreground) transition-all"
                >
                  <XCircle size={28} />
                </button>
              </div>

              {!decisionModal.selectedStatus ? (
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-sm opacity-70 mb-2">
                    {t("select_decision_action")}
                  </p>

                  {[
                    {
                      id: "processed",
                      icon: CheckCircle2,
                      color: "emerald",
                      label: t("status_processed"),
                      desc: t("mark_as_successfully_verified"),
                    },
                    {
                      id: "correction_required",
                      icon: AlertTriangle,
                      color: "purple",
                      label: t("status_correction_required"),
                      desc: t("request_agent_to_fix_errors"),
                    },
                    {
                      id: "rejected",
                      icon: XCircle,
                      color: "red",
                      label: t("status_rejected"),
                      desc: t("reject_due_to_major_issues"),
                    },
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() =>
                        setDecisionModal((prev) => ({
                          ...prev,
                          selectedStatus: act.id,
                        }))
                      }
                      className={`flex items-center gap-5 p-5 rounded-xl transition-all group hover:scale-[1.02] active:scale-[0.98] cursor-pointer border
                        ${act.id === "processed" ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/60 text-emerald-700" : ""}
                        ${act.id === "correction_required" ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/60 text-purple-700" : ""}
                        ${act.id === "rejected" ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/60 text-red-700" : ""}
                      `}
                    >
                      <div
                        className={`p-2.5 rounded-lg text-white shadow-lg transition-transform
                        ${act.id === "processed" ? "bg-emerald-500 shadow-emerald-500/20" : ""}
                        ${act.id === "correction_required" ? "bg-purple-500 shadow-purple-500/20" : ""}
                        ${act.id === "rejected" ? "bg-red-500 shadow-red-500/20" : ""}
                      `}
                      >
                        <act.icon size={20} />
                      </div>
                      <div className="text-left text-(--foreground)">
                        <div className="font-black text-lg leading-none mb-1">
                          {act.label}
                        </div>
                        <div className="text-xs opacity-60 font-medium">
                          {act.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-(--input)/50 border border-(--border)">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm
                      ${decisionModal.selectedStatus === "processed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""}
                      ${decisionModal.selectedStatus === "rejected" ? "bg-red-50 text-red-700 border-red-100" : ""}
                      ${decisionModal.selectedStatus === "correction_required" ? "bg-purple-50 text-purple-700 border-purple-100" : ""}
                    `}
                    >
                      {t(`status_${decisionModal.selectedStatus}`)}
                    </span>
                    <button
                      onClick={() =>
                        setDecisionModal((p) => ({
                          ...p,
                          selectedStatus: null,
                        }))
                      }
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {t("change")}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest opacity-40 ml-1">
                      {t("admin_notes")}
                    </label>
                    <textarea
                      autoFocus
                      value={decisionModal.notes}
                      onChange={(e) =>
                        setDecisionModal((p) => ({
                          ...p,
                          notes: e.target.value,
                        }))
                      }
                      placeholder={t("enter_status_notes_placeholder")}
                      className="w-full h-32 p-4 bg-(--input) border border-(--border) rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest opacity-40 ml-1">
                      {t("course_end_date")}
                    </label>
                    <input
                      type="date"
                      value={decisionModal.courseEndDate}
                      onChange={(e) =>
                        setDecisionModal((p) => ({
                          ...p,
                          courseEndDate: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-(--input) border border-(--border) rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={() =>
                        setDecisionModal((p) => ({
                          ...p,
                          selectedStatus: null,
                        }))
                      }
                      className="flex-1 px-6 py-4 rounded-xl font-bold border border-(--border) hover:bg-(--input) transition-all active:scale-95"
                    >
                      {t("back")}
                    </button>
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          status: decisionModal.selectedStatus!,
                          notes: decisionModal.notes,
                          courseEndDate: decisionModal.courseEndDate,
                        })
                      }
                      disabled={updateStatus.isPending}
                      className={`flex-2 px-8 py-4 rounded-xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95
                        ${
                          decisionModal.selectedStatus === "processed"
                            ? "bg-emerald-600 shadow-emerald-500/20"
                            : decisionModal.selectedStatus === "rejected"
                              ? "bg-red-600 shadow-red-500/20"
                              : "bg-purple-600 shadow-purple-500/20"
                        }
                      `}
                    >
                      {updateStatus.isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        t("confirm_decision")
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
