import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, Plus, HelpCircle, CheckCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';

const getStatusInfo = (status) => {
  switch (status) {
    case 'OPEN': return { label: 'Open', color: 'bg-red-50 text-red-700', icon: AlertCircle };
    case 'RESOLVED': return { label: 'Resolved', color: 'bg-green-50 text-green-700', icon: CheckCircle };
    default: return { label: status, color: 'bg-gray-50 text-gray-700', icon: HelpCircle };
  }
};

export default function StudentDoubtsPage() {
  const [doubts, setDoubts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [raiseForm, setRaiseForm] = useState({ topicTag: '', questionText: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchDoubts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/v1/student/doubts', { params });
      setDoubts(res.data.data.doubts);
      setPagination(res.data.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const openDetail = (doubt) => {
    setSelectedDoubt(doubt);
    setShowDetailModal(true);
  };

  const handleRaiseDoubt = async () => {
    if (!raiseForm.questionText.trim()) {
      setError('Please enter your doubt question or description.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/v1/student/doubts', raiseForm);
      setSuccessMessage('Doubt raised successfully.');
      setError('');
      setShowRaiseModal(false);
      setRaiseForm({ topicTag: '', questionText: '', imageUrl: '' });
      fetchDoubts(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise doubt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Doubts</h1>
          <p className="text-sm text-gray-500">Raise doubts and track responses from your mentor.</p>
        </div>
        <button onClick={() => setShowRaiseModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700">
          <Plus className="h-4 w-4" /> Raise Doubt
        </button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Filter by status</p>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); fetchDoubts(1); }} className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none bg-white">
            <option value="">All Doubts</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {successMessage && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>}

      <div className="space-y-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No doubts found</p>
            <p className="mt-1 text-xs text-gray-400">Raise a new doubt to get help from your mentor.</p>
          </div>
        ) : doubts.map((doubt) => {
          const status = getStatusInfo(doubt.status);
          return (
            <div key={doubt.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                      <status.icon className="h-3 w-3" /> {status.label}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(doubt.createdAt).toLocaleDateString()}</span>
                  </div>
                  {doubt.topicTag && <div className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{doubt.topicTag}</div>}
                  <p className="text-sm font-medium text-gray-900">{doubt.questionText}</p>
                  {doubt.mentorResponse && (
                    <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-700">
                      <span className="font-semibold">Response:</span> {doubt.mentorResponse}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openDetail(doubt)} className="rounded-lg bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-700 hover:bg-accent-100">View Details</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchDoubts(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchDoubts(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showRaiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Raise a Doubt</h2>
              <button onClick={() => setShowRaiseModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Topic Tag</label>
                <input value={raiseForm.topicTag} onChange={(e) => setRaiseForm({ ...raiseForm, topicTag: e.target.value })} placeholder="e.g. Algebra" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Question / Description *</label>
                <textarea rows={4} value={raiseForm.questionText} onChange={(e) => setRaiseForm({ ...raiseForm, questionText: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
                <input value={raiseForm.imageUrl} onChange={(e) => setRaiseForm({ ...raiseForm, imageUrl: e.target.value })} placeholder="Optional image link" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowRaiseModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRaiseDoubt} disabled={saving} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Raise Doubt
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Doubt Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{selectedDoubt.status}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Created</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{new Date(selectedDoubt.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Mentor</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{selectedDoubt.mentor?.name || 'Not assigned'}</p>
                <p className="text-xs text-gray-500">{selectedDoubt.mentor?.email}</p>
              </div>
              {selectedDoubt.topicTag && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Topic Tag</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{selectedDoubt.topicTag}</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Question</p>
                <p className="mt-2 text-sm text-gray-700">{selectedDoubt.questionText}</p>
              </div>
              {selectedDoubt.imageUrl && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Image URL</p>
                  <a href={selectedDoubt.imageUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-700">Open image</a>
                </div>
              )}
              {selectedDoubt.mentorResponse ? (
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Mentor Response</p>
                  <p className="mt-2 text-sm text-green-700">{selectedDoubt.mentorResponse}</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-700">This doubt is still open and waiting for a mentor response.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
