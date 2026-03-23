import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, CheckCircle2, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import api from '../lib/api';

export default function SubmissionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await api.get('/submissions');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await api.patch(`/submissions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions', 'dashboard'] });
    }
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string, id: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); handleCopy(text, id); }}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-(--input) hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition-colors ml-2 text-xs font-medium"
      title="Copy"
    >
      {copiedId === id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {copiedId === id && <span className="text-green-600 dark:text-green-400">{t('copied')}</span>}
    </button>
  );

  const filteredData = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub: any) => {
      const matchSearch = searchTerm
        ? sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.bulgarian_id?.includes(searchTerm)
        : true;
      const matchStatus = statusFilter ? sub.status === statusFilter : true;
      const matchCourse = courseFilter ? sub.course_id?.toString() === courseFilter : true;
      
      return matchSearch && matchStatus && matchCourse;
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [submissions, searchTerm, statusFilter, courseFilter]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          {t('submissions')}
        </h1>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-(--card) p-4 rounded-xl shadow-sm border border-(--border) flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-(--input) border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-(--input) border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
        >
          <option value="">{t('all_statuses')}</option>
          <option value="pending">{t('pending_badge')}</option>
          <option value="processed">{t('processed_badge')}</option>
        </select>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2 bg-(--input) border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
        >
          <option value="">{t('all_courses')}</option>
          {courses?.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) opacity-80 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4 font-semibold w-16 text-center">#</th>
                  <th className="px-4 py-4 font-semibold">{t('bulgarian_id')}</th>
                  <th className="px-4 py-4 font-semibold">{t('full_name')}</th>
                  <th className="px-4 py-4 font-semibold hidden lg:table-cell">{t('place_of_birth')}</th>
                  <th className="px-4 py-4 font-semibold hidden xl:table-cell">{t('address')}</th>
                  <th className="px-4 py-4 font-semibold">{t('course')}</th>
                  <th className="px-4 py-4 font-semibold hidden md:table-cell">{t('agent')}</th>
                  <th className="px-4 py-4 font-semibold">{t('date')}</th>
                  <th className="px-4 py-4 font-semibold text-center">{t('status')}</th>
                  <th className="px-4 py-4 font-semibold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center opacity-70">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((sub: any) => (
                    <React.Fragment key={sub.id}>
                      <tr 
                        className={`hover:bg-(--input)/50 transition-colors cursor-pointer ${expandedRow === sub.id ? 'bg-(--input)/30' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                      >
                        <td className="px-4 py-4 font-medium text-center">#{sub.id}</td>
                        <td className="px-4 py-4 font-mono">
                          <div className="flex items-center">
                            {sub.bulgarian_id}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold">{sub.full_name}</td>
                        <td className="px-4 py-4 hidden lg:table-cell">{sub.place_of_birth}</td>
                        <td className="px-4 py-4 hidden xl:table-cell truncate max-w-[150px]">{sub.residential_address}</td>
                        <td className="px-4 py-4">
                          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded-lg text-xs font-semibold">
                            {courses?.find((c:any) => c.id === Number(sub.course_id))?.name || `Course ${sub.course_id}`}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">{sub.agent?.name || sub.agent_id}</td>
                        <td className="px-4 py-4 opacity-70 whitespace-nowrap">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            sub.status === 'processed' 
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {sub.status === 'processed' ? t('processed_badge') : t('pending_badge')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            className="p-1.5 hover:bg-(--border) rounded-full transition-colors"
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === sub.id ? null : sub.id); }}
                          >
                            {expandedRow === sub.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </td>
                      </tr>
                      
                      {/* EXPANDED ROW DETAIL */}
                      {expandedRow === sub.id && (
                        <tr className="bg-(--input)/20 shadow-inner">
                          <td colSpan={10} className="px-6 py-6 border-b-2 border-blue-500/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                              
                              <div className="space-y-4 bg-(--card) p-4 rounded-xl border border-(--border)">
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('full_name')}</h4>
                                  <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                    <span className="font-medium mr-2">{sub.full_name}</span>
                                    <CopyButton text={sub.full_name} id={`name-${sub.id}`} />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('bulgarian_id')}</h4>
                                  <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                    <span className="font-medium font-mono mr-2">{sub.bulgarian_id}</span>
                                    <CopyButton text={sub.bulgarian_id} id={`egn-${sub.id}`} />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4 bg-(--card) p-4 rounded-xl border border-(--border)">
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('address')}</h4>
                                  <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                    <span className="font-medium mr-2 text-sm">{sub.residential_address}</span>
                                    <CopyButton text={sub.residential_address} id={`addr-${sub.id}`} />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('place_of_birth')}</h4>
                                  <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                    <span className="font-medium mr-2">{sub.place_of_birth}</span>
                                    <CopyButton text={sub.place_of_birth} id={`pob-${sub.id}`} />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 bg-(--card) p-4 rounded-xl border border-(--border) flex flex-col justify-between">
                                {sub.is_foreign ? (
                                  <div className="space-y-4">
                                    <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-bold mb-2">
                                      {t('foreign_citizen')}
                                    </div>
                                    <div>
                                      <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('country_of_birth')}</h4>
                                      <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                        <span className="font-medium mr-2">{sub.country_of_birth}</span>
                                        <CopyButton text={sub.country_of_birth} id={`cob-${sub.id}`} />
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{t('date_of_birth')}</h4>
                                      <div className="flex items-center justify-between bg-(--input) px-3 py-2 rounded-lg">
                                        <span className="font-medium mr-2">{sub.date_of_birth}</span>
                                        <CopyButton text={sub.date_of_birth} id={`dob-${sub.id}`} />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full opacity-50 italic text-sm">
                                    Standard Registration
                                  </div>
                                )}
                              </div>
                              
                            </div>

                            <div className="mt-6 flex justify-end">
                              {sub.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus.mutate({ id: sub.id, status: 'processed' });
                                  }}
                                  disabled={updateStatus.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
                                >
                                  {updateStatus.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 size={18} />
                                      {t('mark_processed')}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
