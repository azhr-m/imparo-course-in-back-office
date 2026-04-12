import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ToggleLeft, ToggleRight, Loader2, Pencil, Trash2, XCircle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import api from '../lib/api';

interface Course {
  id: number;
  name_en: string;
  name_bg: string;
  name: string;
  code: string;
  is_active: boolean;
}

interface CourseFormData {
  name_en: string;
  name_bg: string;
  code: string;
  is_active: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function CoursesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({ name_en: '', name_bg: '', code: '', is_active: true });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['courses', 'admin'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, data);
      } else {
        await api.post('/courses', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      closeModal();
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || 'Failed to save course');
    }
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteConfirmId(null);
    },
    onError: (error: unknown) => {
      const apiErr = error as ApiError;
      alert(apiErr.response?.data?.message || 'Failed to delete course');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name_en: course.name_en,
      name_bg: course.name_bg,
      code: course.code,
      is_active: course.is_active
    });
    setShowModal(true);
  };

  const startAdd = () => {
    setEditingCourse(null);
    setFormData({ name_en: '', name_bg: '', code: '', is_active: true });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData({ name_en: '', name_bg: '', code: '', is_active: true });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-12 animate-in fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-200 dark:border-red-800 shadow-sm max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="opacity-80">This page is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#d32f2f]">
            {t('courses_title')}
          </h1>
          <p className="text-sm opacity-60 mt-1">{t('course_management_subtitle')}</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-[#d32f2f] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b71c1c] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={18} /> {t('add_course')}
        </button>
      </div>

      <div className="bg-(--card) rounded-3xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-100 border-t-[#d32f2f] rounded-full animate-spin" />
              <p className="text-sm opacity-50 font-medium animate-pulse">{t('loading_courses')}</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) whitespace-nowrap">
                <tr>
                  <th className="px-6 py-5 font-bold w-16 text-center">#</th>
                  <th className="px-6 py-5 font-bold">{t('course_name_bg')}</th>
                  <th className="px-6 py-5 font-bold">{t('course_name_en')}</th>
                  <th className="px-6 py-5 font-bold">{t('course_code')}</th>
                  <th className="px-6 py-5 font-bold text-center">{t('status')}</th>
                  <th className="px-6 py-5 font-bold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {!courses || courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center opacity-60 italic">
                      {t('no_courses_found')}
                    </td>
                  </tr>
                ) : (
                  courses.map((course, index) => (
                    <tr key={course.id} className="hover:bg-(--input)/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-center text-xs opacity-50">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-(--foreground) uppercase tracking-tight">{course.name_bg}</td>
                      <td className="px-6 py-4 text-(--foreground) opacity-90 font-medium">{course.name_en}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-(--input) text-[#d32f2f] font-mono font-bold text-xs border border-(--border)">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {course.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-all hover:scale-105">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">{t('active')}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50 opacity-60 transition-all hover:opacity-100">
                            <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">{t('inactive')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => startEdit(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50 shadow-sm cursor-pointer"
                            title={t('edit', 'Edit')}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/50 shadow-sm cursor-pointer"
                            title={t('delete', 'Delete')}
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

      {/* COURSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--card) w-full max-w-2xl rounded-3xl shadow-2xl border border-(--border) overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-(--foreground) tracking-tight">
                    {editingCourse ? t('edit_course') : t('add_course')}
                  </h2>
                  <p className="text-sm opacity-60 mt-1">
                    {editingCourse ? t('edit_course_desc') : t('add_course_desc')}
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
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">{t('course_name_bg')}</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={formData.name_bg}
                      onChange={e => setFormData({ ...formData, name_bg: e.target.value })}
                      className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Курс по Български"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">{t('course_name_en')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name_en}
                      onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Bulgarian Course"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black opacity-40 uppercase tracking-widest ml-1">{t('course_code')}</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-(--input) text-(--foreground) border border-(--border) focus:border-[#d32f2f] px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-[#d32f2f]/10 outline-none text-sm font-mono font-bold uppercase transition-all"
                      placeholder="e.g. BG-LANG-101"
                    />
                  </div>
                  <div className="flex items-center gap-4 py-2 pt-6">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className="transition-transform active:scale-90 outline-none"
                    >
                      {formData.is_active ? (
                        <ToggleRight className="text-green-500" size={44} />
                      ) : (
                        <ToggleLeft className="text-gray-300" size={44} />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-black uppercase tracking-tight">
                        {formData.is_active ? t('active') : t('inactive')}
                      </div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-wider">{t('course_status_desc')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-(--border)">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-(--input) hover:bg-(--border) transition-all text-(--foreground) active:scale-95"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-[#d32f2f] text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#b71c1c] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 active:scale-95 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : t('save', 'Save')}
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
              <h3 className="text-xl font-black mb-2">{t('confirm_delete_title')}</h3>
              <p className="text-sm opacity-60 mb-8 leading-relaxed">
                {t('delete_description')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold border border-(--border) hover:bg-(--input) transition-all active:scale-95"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => deleteCourse.mutate(deleteConfirmId)}
                  disabled={deleteCourse.isPending}
                  className="flex-1 px-6 py-3 rounded-2xl font-black bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-95 flex items-center justify-center"
                >
                  {deleteCourse.isPending ? <Loader2 className="animate-spin" size={20} /> : t('delete', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
