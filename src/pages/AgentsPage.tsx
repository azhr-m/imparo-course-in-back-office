import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import api from '../lib/api';

export default function AgentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '', lang: 'bg' });

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/agents');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      // Assuming API endpoint allows updating user status
      await api.patch(`/agents/${id}/status`, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agents', 'dashboard'] });
    }
  });

  const addAgent = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/agents', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', password_confirmation: '', lang: 'bg' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      alert("Passwords do not match");
      return;
    }
    addAgent.mutate(formData);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-12 animate-in fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="opacity-80">This page is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-(--card) p-4 border-b border-(--border)">
        <div>
          <div className="text-sm opacity-60 mb-1">{t('agents', 'Agents')}</div>
          <h1 className="text-2xl font-bold text-[#d32f2f]">
            {t('agents_management', 'Agent Management')}
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-transparent border border-(--border) text-(--foreground) px-4 py-2 rounded text-sm font-medium hover:bg-(--input) transition-colors"
        >
          {showAddForm ? 'Cancel' : <><Plus size={16} /> {t('add_agent')}</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-(--card) p-6 border border-(--border) rounded animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-6 text-(--foreground)">{t('add_agent')}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-70 uppercase tracking-wider">{t('full_name')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#f0f4f8] text-gray-900 border-none px-4 py-2.5 rounded focus:ring-1 focus:ring-[#ef5350] outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-70 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f0f4f8] text-gray-900 border-none px-4 py-2.5 rounded focus:ring-1 focus:ring-[#ef5350] outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-70 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#f0f4f8] text-gray-900 border-none px-4 py-2.5 rounded focus:ring-1 focus:ring-[#ef5350] outline-none text-sm tracking-widest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-70 uppercase tracking-wider">{t('confirm_password')}</label>
              <input
                type="password"
                required
                value={formData.password_confirmation}
                onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full bg-[#f0f4f8] text-gray-900 border-none px-4 py-2.5 rounded focus:ring-1 focus:ring-[#ef5350] outline-none text-sm tracking-widest"
              />
            </div>
            
            <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 rounded border border-(--border) text-sm font-medium hover:bg-(--input) transition-colors text-(--foreground)"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addAgent.isPending}
                className="bg-[#d32f2f] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#b71c1c] transition-colors flex items-center justify-center min-w-[100px]"
              >
                {addAgent.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) opacity-80">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">ID</th>
                  <th className="px-6 py-4 font-semibold">{t('full_name')}</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Language</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('submissions')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('status')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {!agents || agents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center opacity-70">
                      No agents found.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-(--input)/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-center">#{agent.id}</td>
                      <td className="px-6 py-4 font-semibold">{agent.name}</td>
                      <td className="px-6 py-4">{agent.email}</td>
                      <td className="px-6 py-4 uppercase font-mono">{agent.language_preference || 'BG'}</td>
                      <td className="px-6 py-4 text-center font-bold">
                        {agent.submissions_count !== undefined ? agent.submissions_count : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2.5 py-1.5 rounded-full text-xs font-bold border ${
                          agent.is_active !== false 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                        }`}>
                          {agent.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleStatus.mutate({ id: agent.id, isActive: agent.is_active !== false })}
                          disabled={toggleStatus.isPending}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
                            agent.is_active !== false
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/40'
                              : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-900/40'
                          }`}
                        >
                          {agent.is_active !== false ? (
                            <><ToggleRight size={16} /> {t('deactivate')}</>
                          ) : (
                            <><ToggleLeft size={16} /> {t('activate')}</>
                          )}
                        </button>
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
