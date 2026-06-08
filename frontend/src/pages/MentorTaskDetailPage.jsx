import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

export default function MentorTaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/mentor/tasks/${id}`);
      setTask(res.data.data.task);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const getStatus = () => {
    if (!task) return { label: 'Unknown', color: 'bg-gray-50 text-gray-700', icon: Clock };
    if (task.isCompleted) return { label: 'Completed', color: 'bg-green-50 text-green-700', icon: CheckCircle };
    if (new Date(task.dueDate) < new Date()) return { label: 'Overdue', color: 'bg-red-50 text-red-700', icon: AlertCircle };
    return { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock };
  };

  const handleToggleComplete = async () => {
    setSaving(true);
    try {
      await api.put(`/v1/mentor/tasks/${id}`, { isCompleted: !task.isCompleted });
      fetchTask();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent-600" /></div>;

  if (error) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  const status = getStatus();

  return (
    <div>
      <button onClick={() => navigate('/mentor/dashboard/tasks')} className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </button>

      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
              <p className="mt-2 text-sm text-gray-500">Assigned to <strong>{task.student?.name || 'Unknown student'}</strong></p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
                <status.icon className="h-4 w-4" /> {status.label}
              </span>
              <button onClick={handleToggleComplete} disabled={saving} className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {task.isCompleted ? 'Mark Pending' : 'Mark Complete'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Task Type</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{formatEnum(task.taskType)}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Due Date</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">XP Reward</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{task.xpReward}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Assigned At</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{task.description || 'No description provided.'}</p>
            </div>
            {task.resourceUrl && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Resource</h2>
                <a href={task.resourceUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-700">Open task resource</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
