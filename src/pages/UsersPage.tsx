import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  User as UserIcon,
  Shield,
  Briefcase,
  Lock,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import api from "../lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "backoffice";
  is_active: boolean;
  created_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "backoffice";
  password?: string;
  is_active?: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "backoffice",
    password: "",
    is_active: true,
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "backoffice",
      password: "",
      is_active: true,
    });
  };

  const startAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "backoffice",
      password: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "backoffice",
      password: "",
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users_list"],
    queryFn: async () => {
      const res = await api.get("/users");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const payload = { ...data };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post("/users", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users_list"] });
      closeModal();
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || "Failed to save user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users_list"] });
      setDeleteConfirmId(null);
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || "Failed to delete user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (currentUser?.role !== "admin") {
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
            {t("users_management_title")}
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {t("users_management_subtitle")}
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-[#d32f2f] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b71c1c] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={18} /> {t("add_user")}
        </button>
      </div>

      <div className="bg-(--card) rounded-3xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
              <p className="text-sm opacity-50 font-medium animate-pulse">
                {t("loading", "Loading...")}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) whitespace-nowrap">
                <tr>
                  <th className="px-6 py-5 font-bold w-16 text-center">#</th>
                  <th className="px-6 py-5 font-bold">{t("full_name")}</th>
                  <th className="px-6 py-5 font-bold">{t("email_address")}</th>
                  <th className="px-6 py-5 font-bold text-center">
                    {t("role")}
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
                {!Array.isArray(users) || users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center opacity-60 italic"
                    >
                      {t("no_users_found", "No users found")}
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <tr
                      key={u.id}
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
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 opacity-70 font-medium">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <Shield size={12} />
                          ) : (
                            <Briefcase size={12} />
                          )}
                          {t(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                              {t("active")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 opacity-60">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                            <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                              {t("inactive")}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50 cursor-pointer"
                            title={t("edit_user")}
                          >
                            <Pencil size={18} />
                          </button>
                          {currentUser?.id !== u.id && (
                            <button
                              onClick={() => setDeleteConfirmId(u.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer"
                              title={t("delete")}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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

      {/* USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) w-full max-w-xl rounded-3xl shadow-2xl border border-(--border) overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-(--foreground) tracking-tight">
                    {editingUser ? t("edit_user") : t("add_user")}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-(--input) rounded-full text-gray-400 hover:text-(--foreground) transition-all"
                >
                  <XCircle size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">
                        {t("role")}
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as "admin" | "backoffice",
                          })
                        }
                        className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                      >
                        <option value="backoffice">{t("backoffice")}</option>
                        <option value="admin">{t("admin")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">
                        {t("password")}
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="password"
                          required={!editingUser}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                          placeholder={
                            editingUser
                              ? "(Leave empty to keep current)"
                              : "••••••••"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
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
                        {formData.is_active ? t("active") : t("inactive")}
                      </div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-wider italic">
                        Account access status
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-(--border)">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-(--input) hover:bg-(--border) transition-all text-(--foreground) active:scale-95"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-[#d32f2f] text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#b71c1c] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 active:scale-95 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      t("save")
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
                {t("confirm_delete_user_title")}
              </h3>
              <p className="text-sm opacity-60 mb-8 leading-relaxed italic">
                {t("delete_user_description")}
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
