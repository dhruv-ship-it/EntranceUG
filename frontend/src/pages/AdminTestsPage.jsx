import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const EXAMS = ['IPMAT_INDORE', 'IPMAT_ROHTAK', 'JIPMAT', 'CUET'];
const TEST_TYPES = ['FULL_MOCK', 'SECTIONAL', 'TOPIC_TEST'];
const SECTIONS = ['QA', 'VARC', 'LRDI', 'GK'];
const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

const emptyForm = {
  title: '', examType: 'IPMAT_INDORE', testType: 'FULL_MOCK', section: '',
  durationMinutes: 60, totalMarks: 100, negativeMarking: 0.25,
  scheduledAt: '', isPublished: false,
};

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (examFilter) params.examType = examFilter;
      if (typeFilter) params.testType = typeFilter;
      const res = await api.get('/v1/admin/tests', { params });
      setTests(res.data.data.tests);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to fetch tests.'); }
    finally { setLoading(false); }
  }, [search, examFilter, typeFilter]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setError(''); setShowModal(true); };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      title: t.title, examType: t.examType, testType: t.testType, section: t.section || '',
      durationMinutes: t.durationMinutes, totalMarks: t.totalMarks, negativeMarking: t.negativeMarking,
      scheduledAt: t.scheduledAt ? new Date(t.scheduledAt).toISOString().slice(0, 16) : '',
      isPublished: t.isPublished,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        durationMinutes: parseInt(form.durationMinutes),
        totalMarks: parseInt(form.totalMarks),
        negativeMarking: parseFloat(form.negativeMarking),
        scheduledAt: form.scheduledAt || undefined,
        section: form.testType === 'SECTIONAL' ? form.section : null,
      };
      if (editId) {
        await api.put(`/v1/admin/tests/${editId}`, payload);
      } else {
        await api.post('/v1/admin/tests', payload);
      }
      setShowModal(false);
      fetchTests(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/v1/admin/tests/${deleteId}`);
      setDeleteId(null);
      fetchTests(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete test.');
    }
  };

  const upd = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [f]: val });
  };
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100';
  const selectCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-sm text-gray-500">Manage mock tests and sectionals</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Test
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tests..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Exams</option>
          {EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          {TEST_TYPES.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Title', 'Exam', 'Type', 'Section', 'Duration', 'Marks', 'Neg. Mark', 'Questions', 'Attempts', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={11} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" /></td></tr>
            ) : tests.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400">No tests found.</td></tr>
            ) : tests.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{t.title}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(t.examType)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.testType === 'FULL_MOCK' ? 'bg-blue-50 text-blue-700' :
                    t.testType === 'SECTIONAL' ? 'bg-purple-50 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{formatEnum(t.testType)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.section ? formatEnum(t.section) : '-'}</td>
                <td className="px-4 py-3 text-gray-600">{t.durationMinutes}m</td>
                <td className="px-4 py-3 text-gray-600">{t.totalMarks}</td>
                <td className="px-4 py-3 text-gray-600">-{t.negativeMarking}</td>
                <td className="px-4 py-3 text-gray-600">{t._count?.questions ?? 0}</td>
                <td className="px-4 py-3 text-gray-600">{t._count?.attempts ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${t.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(t.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
            <button disabled={pagination.page <= 1} onClick={() => fetchTests(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTests(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Test' : 'Create Test'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Title *</label><input value={form.title} onChange={upd('title')} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Exam Type *</label><select value={form.examType} onChange={upd('examType')} className={selectCls}>{EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Test Type *</label><select value={form.testType} onChange={upd('testType')} className={selectCls}>{TEST_TYPES.map((t) => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div>
              </div>
              {form.testType === 'SECTIONAL' && (
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Section *</label><select value={form.section} onChange={upd('section')} className={selectCls}>{SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Duration (min) *</label><input type="number" value={form.durationMinutes} onChange={upd('durationMinutes')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Total Marks *</label><input type="number" value={form.totalMarks} onChange={upd('totalMarks')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Neg. Marking *</label><input type="number" step="0.01" value={form.negativeMarking} onChange={upd('negativeMarking')} className={inputCls} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Scheduled At</label><input type="datetime-local" value={form.scheduledAt} onChange={upd('scheduledAt')} className={inputCls} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={upd('isPublished')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
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
            <h2 className="text-lg font-bold text-gray-900">Delete Test</h2>
            <p className="mt-2 text-sm text-gray-500">Are you sure? Tests with existing attempts cannot be deleted.</p>
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
