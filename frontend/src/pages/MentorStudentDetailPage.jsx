import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';
const TASK_TYPES = ['VIDEO', 'PRACTICE', 'REVISION', 'MOCK', 'DOUBT_CLEAR', 'READING'];

export default function MentorStudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', taskType: 'PRACTICE', dueDate: '', xpReward: 10 });
  const [saving, setSaving] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/mentor/students/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleCreateTask = async () => {
    setSaving(true);
    try {
      await api.post('/v1/mentor/tasks', { ...taskForm, studentId: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', taskType: 'PRACTICE', dueDate: '', xpReward: 10 });
      fetchDetail();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task.'); }
    finally { setSaving(false); }
  };

  const toggleTask = async (taskId, isCompleted) => {
    try {
      await api.put(`/v1/mentor/tasks/${taskId}`, { isCompleted: !isCompleted });
      fetchDetail();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent-600" /></div>;
  if (error && !data) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  const s = data?.student;
  const tabs = ['tasks', 'doubts', 'checkins', 'attempts'];

  return (
    <div>
      <button onClick={() => navigate('/mentor/dashboard/students')} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      {s && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{s.name}</h1>
              <p className="text-sm text-gray-500">{s.email} | {s.phone || 'No phone'}</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{formatEnum(s.examPrimary)}</span>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">{formatEnum(s.classYear)}</span>
            </div>
          </div>
          {s.cohort && (
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Cohort: <b className="text-gray-700">{s.cohort.name}</b></span>
              <span>Tier: {formatEnum(s.cohort.performanceTier)}</span>
              <span>Exam: {s.cohort.examDate ? new Date(s.cohort.examDate).toLocaleDateString() : '-'}</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? 'border-b-2 border-accent-600 text-accent-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t} {t === 'tasks' ? `(${data?.tasks?.length || 0})` : t === 'doubts' ? `(${data?.doubts?.length || 0})` : t === 'checkins' ? `(${data?.checkins?.length || 0})` : `(${data?.attempts?.length || 0})`}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div>
          <div className="mb-3 flex justify-end">
            <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700">
              <Plus className="h-4 w-4" /> Assign Task
            </button>
          </div>
          <div className="space-y-2">
            {data?.tasks?.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No tasks assigned yet.</p>
            ) : data?.tasks?.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(t.id, t.isCompleted)} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${t.isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 hover:border-accent-500'}`}>
                    {t.isCompleted && <CheckCircle className="h-4 w-4" />}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${t.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                    <p className="text-xs text-gray-500">{formatEnum(t.taskType)} | Due: {new Date(t.dueDate).toLocaleDateString()} | XP: {t.xpReward}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.isCompleted ? 'bg-green-50 text-green-700' : new Date(t.dueDate) < new Date() ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {t.isCompleted ? 'Done' : new Date(t.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doubts Tab */}
      {tab === 'doubts' && (
        <div className="space-y-2">
          {data?.doubts?.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No doubts from this student.</p>
          ) : data?.doubts?.map((d) => (
            <div key={d.id} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.status === 'OPEN' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{d.status}</span>
                <span className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{d.topicTag && <span className="text-accent-600">[{d.topicTag}]</span>} {d.questionText}</p>
              {d.mentorResponse && <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Your response: {d.mentorResponse}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Checkins Tab */}
      {tab === 'checkins' && (
        <div className="space-y-2">
          {data?.checkins?.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No checkins recorded.</p>
          ) : data?.checkins?.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{new Date(c.date).toLocaleDateString()}</span>
                <span className="text-2xl">{c.moodEmoji}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Topics: {c.topicsStudied?.join(', ') || '-'} | Questions: {c.questionsPracticed} | Confidence: {c.confidenceScore}/10 | Tasks done: {c.tasksCompletedCount}</p>
              {c.doubtsText && <p className="mt-1 text-xs text-gray-500 italic">Doubts: {c.doubtsText}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Attempts Tab */}
      {tab === 'attempts' && (
        <div className="space-y-2">
          {data?.attempts?.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No test attempts.</p>
          ) : data?.attempts?.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.test?.title || 'Unknown Test'}</p>
                  <p className="text-xs text-gray-500">{formatEnum(a.test?.examType)} | {formatEnum(a.test?.testType)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{a.totalScore}/{a.test?.totalMarks}</p>
                  <p className="text-xs text-gray-500">{a.totalCorrect} correct, {a.totalIncorrect} wrong</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Assign Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Title *</label><input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Description *</label><textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Type *</label><select value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">{TASK_TYPES.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">XP Reward</label><input type="number" value={taskForm.xpReward} onChange={(e) => setTaskForm({ ...taskForm, xpReward: parseInt(e.target.value) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Due Date *</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowTaskModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateTask} disabled={saving} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
