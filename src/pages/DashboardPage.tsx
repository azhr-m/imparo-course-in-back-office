import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileUp, Clock, CheckCircle2, Users } from 'lucide-react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { t } = useTranslation();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/submissions');
      // For dashboard, maybe we get all or an endpoint /dashboard-stats.
      // If we only have /submissions, we compute locally or rely on pagination.
      return res.data;
    }
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/agents').catch(() => ({ data: [] })); // gracefully handle if not admin
      return res.data;
    }
  });

  // Calculate stats from submissions data
  const safeSubmissions = Array.isArray(submissions) ? submissions : (submissions?.data || []);
  const safeAgents = Array.isArray(agents) ? agents : (agents?.data || []);
  
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    today: safeSubmissions.filter((s: any) => s.created_at?.startsWith(today)).length,
    pending: safeSubmissions.filter((s: any) => s.status === 'pending').length,
    processed: safeSubmissions.filter((s: any) => s.status === 'processed').length,
    activeAgents: safeAgents.filter((a: any) => a.is_active !== false).length || 0,
  };

  const recentSubmissions = safeSubmissions.slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          {t('dashboard')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileUp />} title={t('total_today')} value={stats.today} color="blue" loading={isLoading} />
        <StatCard icon={<Clock />} title={t('total_pending')} value={stats.pending} color="amber" loading={isLoading} />
        <StatCard icon={<CheckCircle2 />} title={t('total_processed')} value={stats.processed} color="green" loading={isLoading} />
        <StatCard icon={<Users />} title={t('total_agents')} value={stats.activeAgents} color="indigo" />
      </div>

      <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden">
        <div className="p-6 border-b border-(--border) flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent Submissions</h2>
          <Link to="/submissions" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            View all
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-(--input) text-(--foreground) opacity-80">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">{t('full_name')}</th>
                  <th className="px-6 py-4 font-semibold">{t('bulgarian_id')}</th>
                  <th className="px-6 py-4 font-semibold">{t('status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center opacity-70">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-(--border)/30 transition-colors">
                      <td className="px-6 py-4 font-medium">#{sub.id}</td>
                      <td className="px-6 py-4">{sub.full_name}</td>
                      <td className="px-6 py-4 font-mono">{sub.bulgarian_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.status === 'processed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {sub.status === 'processed' ? t('processed_badge') : t('pending_badge')}
                        </span>
                      </td>
                      <td className="px-6 py-4 opacity-70">
                        {new Date(sub.created_at).toLocaleDateString()}
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

function StatCard({ title, value, icon, color, loading }: { title: string, value: number, icon: any, color: string, loading?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -z-10 translate-x-10 -translate-y-10 transition-transform group-hover:scale-150 ${colorMap[color].split(' ')[0]}`} />
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="font-semibold opacity-80">{title}</h3>
      </div>
      <div>
        {loading ? (
          <div className="h-10 bg-(--input) rounded animate-pulse w-1/3" />
        ) : (
          <p className="text-4xl font-extrabold">{value}</p>
        )}
      </div>
    </div>
  );
}
