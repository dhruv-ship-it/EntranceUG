import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const EXAMS = ['IPMAT_INDORE', 'IPMAT_ROHTAK', 'JIPMAT', 'CUET'];
const TIERS = ['ADVANCED', 'REGULAR', 'FOUNDATION'];
const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

const emptyForm = {
  name: '', examType: 'IPMAT_INDORE', performanceTier: 'REGULAR',
  mentorId: '', startDate: '', examDate: '',
};

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mentors, setMentors] = useState([]);

  const fetchCohorts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (examFilter) params.examType = examFilter;
      const res = await api.get('/v1/admin/cohorts', { params });
      setCohorts(res.data.data.cohorts);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to fetch cohorts.'); }
    finally { setLoading(false); }
  }, [search, examFilter]);

  useEffect(() => { fetchCohorts(); }, [fetchCohorts]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const [mentorRes, adminRes] = await Promise.all([
          api.get('/v1/admin/users', { params: { role: 'MENTOR', limit: 100 } }),
          api.get('/v1/admin/users', { params: { role: 'ADMIN', limit: 100 } }),
        ]);
        setMentors([...mentorRes.data.data.users, ...adminRes.data.data.users]);
      } catch { /* ignore */ }
    };
    fetchMentors();
  }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setError(''); setShowModal(true); };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name, examType: c.examType, performanceTier: c.performanceTier,
      mentorId: c.mentorId,
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : '',
      examDate: c.examDate ? new Date(c.examDate).toISOString().slice(0, 10) : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/v1/admin/cohorts/${editId}`, form);
      } else {
        await api.post('/v1/admin/cohorts', form);
      }
      setShowModal(false);
      fetchCohorts(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save cohort.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/v1/admin/cohorts/${deleteId}`);
      setDeleteId(null);
      fetchCohorts(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete cohort.');
    }
  };

  const upd = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100';
  const selectCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-sm text-gray-500">Manage study cohorts and groups</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Cohort
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cohorts..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Exams</option>
          {EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Name', 'Exam', 'Tier', 'Mentor', 'Members', 'Start Date', 'Exam Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" /></td></tr>
            ) : cohorts.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No cohorts found.</td></tr>
            ) : cohorts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(c.examType)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.performanceTier === 'ADVANCED' ? 'bg-green-50 text-green-700' :
                    c.performanceTier === 'FOUNDATION' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{formatEnum(c.performanceTier)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.mentor?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{c._count?.members ?? 0}</td>
                <td className="px-4 py-3 text-gray-500">{c.startDate ? new Date(c.startDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-gray-500">{c.examDate ? new Date(c.examDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(c.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchCohorts(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchCohorts(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Cohort' : 'Create Cohort'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Cohort Name *</label><input value={form.name} onChange={upd('name')} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Exam Type *</label><select value={form.examType} onChange={upd('examType')} className={selectCls}>{EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Performance Tier *</label><select value={form.performanceTier} onChange={upd('performanceTier')} className={selectCls}>{TIERS.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Mentor *</label><select value={form.mentorId} onChange={upd('mentorId')} className={selectCls}><option value="">Select mentor</option>{mentors.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Start Date *</label><input type="date" value={form.startDate} onChange={upd('startDate')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Exam Date *</label><input type="date" value={form.examDate} onChange={upd('examDate')} className={inputCls} /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete Cohort</h2>
            <p className="mt-2 text-sm text-gray-500">Are you sure? Cohorts with members cannot be deleted.</p>
            {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
