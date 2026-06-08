import { useEffect, useState, useCallback } from 'react';
import {
  Loader2, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      const res = await api.get('/v1/student/tasks', { params });
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await api.put(`/v1/student/tasks/${taskId}`, { isCompleted: !isCompleted });
      fetchTasks(pagination.page);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const getTaskStatus = (task) => {
    if (task.isCompleted) {
      return { label: 'Completed', color: 'bg-green-50 text-green-700', icon: CheckCircle };
    }
    if (new Date(task.dueDate) < new Date()) {
      return { label: 'Overdue', color: 'bg-red-50 text-red-700', icon: AlertCircle };
    }
    return { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">View and complete assigned tasks</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Task Title', 'Type', 'Due Date', 'XP', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" />
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No tasks assigned.</td>
              </tr>
            ) : (
              tasks.map((task) => {
                const status = getTaskStatus(task);
                return (
                  <tr key={task.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
                    <td className="px-4 py-3 text-gray-600">{formatEnum(task.taskType)}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{task.xpReward}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          task.isCompleted
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        }`}
                      >
                        {task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTasks(pagination.page - 1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTasks(pagination.page + 1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
