import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit, CheckCircle, Clock, AlertCircle, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';
const TASK_TYPES = ['VIDEO', 'PRACTICE', 'REVISION', 'MOCK', 'DOUBT_CLEAR', 'READING'];

export default function MentorTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [studentFilter, setStudentFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', taskType: 'PRACTICE', resourceUrl: '', dueDate: '', xpReward: 10, studentId: '' });
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (studentFilter) params.studentId = studentFilter;
      const res = await api.get('/v1/mentor/tasks', { params });
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch { /* handled by error state */ }
    finally { setLoading(false); }
  }, [studentFilter]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/v1/mentor/students', { params: { limit: 100 } });
      setStudents(res.data.data.students);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchTasks(); fetchStudents(); }, [fetchTasks, fetchStudents]);

  const handleCreateTask = async () => {
    setSaving(true);
    try {
      await api.post('/v1/mentor/tasks', taskForm);
      setShowCreateModal(false);
      setTaskForm({ title: '', description: '', taskType: 'PRACTICE', resourceUrl: '', dueDate: '', xpReward: 10, studentId: '' });
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create task.'); }
    finally { setSaving(false); }
  };

  const handleUpdateTask = async () => {
    setSaving(true);
    try {
      await api.put(`/v1/mentor/tasks/${editingTask.id}`, taskForm);
      setShowEditModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', taskType: 'PRACTICE', resourceUrl: '', dueDate: '', xpReward: 10, studentId: '' });
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update task.'); }
    finally { setSaving(false); }
  };

  const toggleTaskStatus = async (taskId, isCompleted) => {
    try {
      await api.put(`/v1/mentor/tasks/${taskId}`, { isCompleted: !isCompleted });
      fetchTasks();
    } catch { /* ignore */ }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      resourceUrl: task.resourceUrl || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      xpReward: task.xpReward,
      studentId: task.studentId,
    });
    setShowEditModal(true);
  };

  const getTaskStatus = (task) => {
    if (task.isCompleted) return { label: 'Completed', color: 'bg-green-50 text-green-700', icon: CheckCircle };
    if (new Date(task.dueDate) < new Date()) return { label: 'Overdue', color: 'bg-red-50 text-red-700', icon: AlertCircle };
    return { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks Management</h1>
          <p className="text-sm text-gray-500">View and manage tasks assigned to your students</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700">
          <Plus className="h-4 w-4" /> Assign Task
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1 max-w-xs">
          <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none bg-white">
            <option value="">All Students</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Student', 'Title', 'Type', 'Due Date', 'XP', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-600" /></td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No tasks found.</td></tr>
            ) : tasks.map((t) => {
              const status = getTaskStatus(t);
              return (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.student?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{formatEnum(t.taskType)}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.xpReward}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                      <status.icon className="h-3 w-3" /> {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleTaskStatus(t.id, t.isCompleted)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-accent-600" title="Toggle completion">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(t)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-accent-600" title="Edit task">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchTasks(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTasks(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Assign New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Student *</label>
              <select value={taskForm.studentId} onChange={(e) => setTaskForm({ ...taskForm, studentId: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Title *</label><input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Description *</label><textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Type *</label><select value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">{TASK_TYPES.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">XP Reward</label><input type="number" value={taskForm.xpReward} onChange={(e) => setTaskForm({ ...taskForm, xpReward: parseInt(e.target.value) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Resource URL</label><input value={taskForm.resourceUrl} onChange={(e) => setTaskForm({ ...taskForm, resourceUrl: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Due Date *</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateTask} disabled={saving} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Task</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Title *</label><input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Description *</label><textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Type *</label><select value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">{TASK_TYPES.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">XP Reward</label><input type="number" value={taskForm.xpReward} onChange={(e) => setTaskForm({ ...taskForm, xpReward: parseInt(e.target.value) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Resource URL</label><input value={taskForm.resourceUrl} onChange={(e) => setTaskForm({ ...taskForm, resourceUrl: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Due Date *</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdateTask} disabled={saving} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
