import { useEffect, useState } from 'react';
import {
  Users, ClipboardList, HelpCircle, CheckCircle,
  BookOpen, Calendar, Loader2,
} from 'lucide-react';
import api from '../services/api';

const statCards = [
  { key: 'totalStudents', label: 'My Students', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
  { key: 'pendingDoubts', label: 'Open Doubts', icon: HelpCircle, color: 'bg-red-50 text-red-600' },
  { key: 'completedTasks', label: 'Completed Tasks', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { key: 'resolvedDoubts', label: 'Resolved Doubts', icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
  { key: 'ledCohorts', label: 'My Cohorts', icon: BookOpen, color: 'bg-pink-50 text-pink-600' },
];

export default function MentorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/v1/mentor/stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your students and activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.[card.key] ?? 0}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Recent Students</p>
          <p className="mt-1 text-xs text-gray-400">Students recently assigned to you will appear here</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Recent Activity</p>
          <p className="mt-1 text-xs text-gray-400">Recent checkins and task completions</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recently Raised Doubts</h2>
            <p className="text-sm text-gray-500">Newest doubts from your assigned students</p>
          </div>
        </div>
        <div className="space-y-3">
          {stats?.recentDoubts?.length > 0 ? stats.recentDoubts.map((doubt) => (
            <div key={doubt.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doubt.student?.name || 'Unknown Student'}</p>
                  <p className="text-xs text-gray-500">{doubt.student?.email}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{doubt.status}</span>
              </div>
              <p className="mt-3 text-sm text-gray-700">{doubt.questionText}</p>
              {doubt.topicTag && <p className="mt-2 text-xs text-gray-500">Topic: {doubt.topicTag}</p>}
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No recent doubts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
