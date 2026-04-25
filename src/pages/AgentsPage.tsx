import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Pencil,
  Trash2,
  XCircle,
  Mail,
  Globe,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import api from "../lib/api";

export interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  preferred_language: string;
  submissions_count?: number;
  created_at: string;
}

interface AgentFormData {
  name: string;
  email: string;
  preferred_language: string;
  is_active?: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function AgentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    email: "",
    preferred_language: "bg",
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      preferred_language: "bg",
      is_active: true,
    });
  };

  const startAdd = () => {
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      preferred_language: "bg",
      is_active: true,
    });
    setShowModal(true);
  };

  const startEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      preferred_language: agent.preferred_language,
      is_active: agent.is_active,
    });
    setShowModal(true);
  };

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await api.get("/agents");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      if (editingAgent) {
        await api.put(`/agents/${editingAgent.id}`, data);
      } else {
        await api.post("/agents", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      closeModal();
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || "Failed to save agent");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setDeleteConfirmId(null);
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || "Failed to delete agent");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center p-12 animate-in fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-200 dark:border-red-800 shadow-sm max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="opacity-80">
            This page is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#d32f2f]">
            {t("agents_management_title")}
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {t("agents_management_subtitle")}
          </p>{" "}
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-[#d32f2f] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b71c1c] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={18} /> {t("add_agent")}
        </button>
      </div>

      <div className="bg-(--card) rounded-3xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
              <p className="text-sm opacity-50 font-medium animate-pulse">
                {t("loading_agents")}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) whitespace-nowrap">
                <tr>
                  <th className="px-6 py-5 font-bold w-16 text-center">#</th>
                  <th className="px-6 py-5 font-bold">{t("agent")}</th>
                  <th className="px-6 py-5 font-bold">{t("email_address")}</th>
                  <th className="px-6 py-5 font-bold text-center">
                    {t("language")}
                  </th>
                  <th className="px-6 py-5 font-bold text-center">
                    {t("submissions")}
                  </th>
                  <th className="px-6 py-5 font-bold text-center">
                    {t("status")}
                  </th>
                  <th className="px-6 py-5 font-bold text-right">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {!Array.isArray(agents) || agents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center opacity-60 italic"
                    >
                      {t("no_agents_found")}
                    </td>
                  </tr>
                ) : (
                  agents.map((agent, index) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-(--input)/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-center text-xs opacity-50">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <UserIcon size={18} />
                          </div>
                          <span className="font-bold text-(--foreground) tracking-tight">
                            {agent.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 opacity-70 font-medium">
                        {agent.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-(--input) text-slate-600 dark:text-slate-400 font-mono font-bold text-[10px] border border-(--border) uppercase">
                          <Globe size={12} className="opacity-60" />
                          {agent.preferred_language}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-lg text-(--foreground)">
                        {agent.submissions_count || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {agent.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-all">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">
                              {t("active")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50 opacity-60">
                            <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">
                              {t("inactive", "Inactive")}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link
                            to={`/agents/${agent.id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-900/50 cursor-pointer"
                            title={t("view", "View")}
                          >
                            <ExternalLink size={18} />
                          </Link>
                          <button
                            onClick={() => startEdit(agent)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50 cursor-pointer"
                            title={t("edit", "Edit")}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(agent.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer"
                            title={t("delete", "Delete")}
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* AGENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) w-full max-w-2xl rounded-3xl shadow-2xl border border-(--border) overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-(--foreground) tracking-tight">
                    {editingAgent ? t("edit_agent") : t("add_agent")}
                  </h2>
                  <p className="text-sm opacity-60 mt-1">
                    {editingAgent
                      ? t("edit_agent_desc")
                      : t("invite_agent_desc")}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-(--input) rounded-full text-gray-400 hover:text-(--foreground) transition-all"
                >
                  <XCircle size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">
                      {t("full_name")}
                    </label>
                    <div className="relative">
                      <UserIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">
                      {t("email_address")}
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">
                      {t("preferred_language", "Preferred Language")}
                    </label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferred_language: e.target.value,
                        })
                      }
                      className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="bg">Bulgarian (Български)</option>
                      <option value="en">English (English)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 py-2 pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          is_active: !formData.is_active,
                        })
                      }
                      className="transition-transform active:scale-90 outline-none"
                    >
                      {formData.is_active ? (
                        <ToggleRight className="text-emerald-500" size={44} />
                      ) : (
                        <ToggleLeft className="text-gray-300" size={44} />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-black uppercase tracking-tight">
                        {formData.is_active
                          ? t("active")
                          : t("inactive", "Inactive")}
                      </div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-wider">
                        System Access Status
                      </div>
                    </div>
                  </div>

                  {!editingAgent && (
                    <div className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        {t("agent_activation_tip")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-(--border)">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-(--input) hover:bg-(--border) transition-all text-(--foreground) active:scale-95"
                  >
                    {t("cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-[#d32f2f] text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#b71c1c] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 active:scale-95 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      t("save", "Save")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) w-full max-w-md rounded-3xl shadow-2xl border border-(--border) overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">
                {t("confirm_delete_title")}
              </h3>
              <p className="text-sm opacity-60 mb-8 leading-relaxed italic">
                {t("delete_agent_description")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold border border-(--border) hover:bg-(--input) transition-all active:scale-95"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-6 py-3 rounded-2xl font-black bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-95 flex items-center justify-center"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    t("delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
