import { useEffect, useState } from 'react';
import {
  Users, BookOpen, Layers, ClipboardCheck,
  GraduationCap, TrendingUp, Loader2,
} from 'lucide-react';
import api from '../services/api';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { key: 'totalStudents', label: 'Total Students', icon: GraduationCap, color: 'bg-green-50 text-green-600' },
  { key: 'totalMentors', label: 'Total Mentors', icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
  { key: 'studentsWithoutMentor', label: 'Students Without Mentor', icon: Users, color: 'bg-orange-50 text-orange-600' },
  { key: 'totalCohorts', label: 'Total Cohorts', icon: Layers, color: 'bg-purple-50 text-purple-600' },
  { key: 'totalTests', label: 'Total Tests', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
  { key: 'totalAttempts', label: 'Total Attempts', icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-600' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/v1/admin/stats');
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
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.[card.key] ?? 0}
                </p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Recent Users</p>
          <p className="mt-1 text-xs text-gray-400">Will display latest signups</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Recent Tests</p>
          <p className="mt-1 text-xs text-gray-400">Will display latest test activity</p>
        </div>
      </div>
    </div>
  );
}
