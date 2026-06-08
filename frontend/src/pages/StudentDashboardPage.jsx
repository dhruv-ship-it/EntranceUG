import { useEffect, useState } from 'react';
import {
  Users, CheckCircle, BookOpen, Clock, Loader2,
} from 'lucide-react';
import api from '../services/api';

const statCards = [
  { key: 'assignedTasksCount', label: 'Assigned Tasks', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { key: 'completedTasksCount', label: 'Completed Tasks', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { key: 'testsAttemptedCount', label: 'Tests Attempted', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
];

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/v1/student/dashboard');
        setDashboard(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;
  }

  const { student, assignedTasksCount, completedTasksCount, testsAttemptedCount, recentTests, recentTasks } = dashboard;

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-primary-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {student?.name}!</h2>
        <p className="mt-2 text-sm text-gray-600">Here's an overview of your exam preparation journey.</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.[card.key] ?? 0}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mentor & Cohort Info */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Users className="h-5 w-5 text-primary-600" />
            Assigned Mentor
          </h3>
          {student?.mentor ? (
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{student.mentor.name}</p>
              <p className="text-sm text-gray-500">{student.mentor.email}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No mentor assigned yet</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <BookOpen className="h-5 w-5 text-primary-600" />
            Cohort Information
          </h3>
          {student?.cohort ? (
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{student.cohort.name}</p>
              <p className="text-sm text-gray-500">Exam: {student.cohort.examType}</p>
              <p className="text-sm text-gray-500">Tier: {student.cohort.performanceTier}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Not assigned to any cohort yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tests */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Tests</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTests && recentTests.length > 0 ? (
              recentTests.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.test?.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{attempt.totalScore?.toFixed(1) || 0}</p>
                    <p className="text-xs text-gray-500">/ {attempt.test?.totalMarks}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No tests attempted yet</div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {task.isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No tasks assigned yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
