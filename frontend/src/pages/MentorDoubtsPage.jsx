import { useEffect, useState, useCallback } from 'react';
import { Search, MessageCircle, CheckCircle, Clock, AlertCircle, Loader2, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

export default function MentorDoubtsPage() {
  const [doubts, setDoubts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [respondingDoubt, setRespondingDoubt] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDoubts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/v1/mentor/doubts', { params });
      setDoubts(res.data.data.doubts);
      setPagination(res.data.data.pagination);
    } catch { /* handled by error state */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const handleRespond = async () => {
    if (!responseText.trim()) return;
    setSaving(true);
    try {
      await api.put(`/v1/mentor/doubts/${respondingDoubt.id}`, { mentorResponse: responseText });
      setShowResponseModal(false);
      setRespondingDoubt(null);
      setResponseText('');
      fetchDoubts();
    } catch (err) { alert(err.response?.data?.message || 'Failed to respond to doubt.'); }
    finally { setSaving(false); }
  };

  const openResponseModal = (doubt) => {
    setRespondingDoubt(doubt);
    setResponseText(doubt.mentorResponse || '');
    setShowResponseModal(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'OPEN': return { label: 'Open', color: 'bg-red-50 text-red-700', icon: AlertCircle };
      case 'RESOLVED': return { label: 'Resolved', color: 'bg-green-50 text-green-700', icon: CheckCircle };
      default: return { label: status, color: 'bg-gray-50 text-gray-700', icon: Clock };
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doubts Management</h1>
        <p className="text-sm text-gray-500">View and respond to doubts from your students</p>
      </div>

      <div className="mb-4">
        <div className="flex gap-4">
          <div className="flex-1 max-w-xs">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none bg-white">
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No doubts found</p>
            <p className="mt-1 text-xs text-gray-400">Doubts from your students will appear here</p>
          </div>
        ) : doubts.map((d) => {
          const status = getStatusInfo(d.status);
          return (
            <div key={d.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                      <status.icon className="h-3 w-3" /> {status.label}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-900">{d.student?.name || 'Unknown Student'}</p>
                    <span className="text-xs text-gray-400">{d.student?.email}</span>
                  </div>
                  {d.topicTag && (
                    <span className="inline-block rounded-lg bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700 mb-2">
                      {d.topicTag}
                    </span>
                  )}
                  <p className="text-sm text-gray-700">{d.questionText}</p>
                  {d.mentorResponse && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3">
                      <p className="text-xs font-medium text-green-800 mb-1">Your Response:</p>
                      <p className="text-sm text-green-700">{d.mentorResponse}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openResponseModal(d)}
                  className="ml-4 flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-sm font-medium text-accent-700 hover:bg-accent-100"
                >
                  <Send className="h-4 w-4" /> {d.mentorResponse ? 'Edit Response' : 'Respond'}
                </button>
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

      {/* Response Modal */}
      {showResponseModal && respondingDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Respond to Doubt</h2>
              <button onClick={() => setShowResponseModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{respondingDoubt.student?.name}</p>
                <p className="text-xs text-gray-500">{respondingDoubt.student?.email}</p>
              </div>
              <span className="text-xs text-gray-500">{new Date(respondingDoubt.createdAt).toLocaleString()}</span>
            </div>
            {respondingDoubt.student?.cohort && (
              <div className="mb-3 rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Cohort: {respondingDoubt.student.cohort.name} • {respondingDoubt.student.cohort.examType} • {respondingDoubt.student.cohort.performanceTier}
              </div>
            )}
            {respondingDoubt.topicTag && (
              <span className="inline-block rounded-lg bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700 mb-2">
                {respondingDoubt.topicTag}
              </span>
            )}
            <p className="text-sm text-gray-700">{respondingDoubt.questionText}</p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-600">Your Response *</label>
              <textarea
                rows={5}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response to help the student..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResponseModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRespond} disabled={saving || !responseText.trim()} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
