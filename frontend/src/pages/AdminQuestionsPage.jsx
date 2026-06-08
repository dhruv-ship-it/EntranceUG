import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const EXAMS = ['IPMAT_INDORE', 'IPMAT_ROHTAK', 'JIPMAT', 'CUET'];
const SECTIONS = ['QA', 'VARC', 'LRDI', 'GK'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const OPTIONS = ['A', 'B', 'C', 'D'];
const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

const emptyForm = {
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctOption: 'A', section: 'QA', topicTag: '', difficulty: 'MEDIUM',
  examType: 'IPMAT_INDORE', explanation: '', questionOrder: 1, testId: '',
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/v1/admin/tests', { params: { limit: 200 } })
      .then((res) => setTests(res.data.data.tests))
      .catch(() => {});
  }, []);

  const fetchQuestions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (examFilter) params.examType = examFilter;
      if (sectionFilter) params.section = sectionFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (testFilter) params.testId = testFilter;
      const res = await api.get('/v1/admin/questions', { params });
      setQuestions(res.data.data.questions);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to fetch questions.'); }
    finally { setLoading(false); }
  }, [search, examFilter, sectionFilter, difficultyFilter, testFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm, testId: testFilter || '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditId(q.id);
    setForm({
      questionText: q.questionText, optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption,
      section: q.section, topicTag: q.topicTag || '', difficulty: q.difficulty,
      examType: q.examType, explanation: q.explanation || '',
      questionOrder: q.questionOrder, testId: q.testId,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, questionOrder: parseInt(form.questionOrder) };
      if (!payload.topicTag) delete payload.topicTag;
      if (!payload.explanation) delete payload.explanation;
      if (editId) {
        await api.put(`/v1/admin/questions/${editId}`, payload);
      } else {
        await api.post('/v1/admin/questions', payload);
      }
      setShowModal(false);
      fetchQuestions(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/v1/admin/questions/${deleteId}`);
      setDeleteId(null);
      fetchQuestions(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const upd = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100';
  const selectCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white';
  const textareaCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-500">Manage question bank</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <select value={testFilter} onChange={(e) => setTestFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Tests</option>
          {tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Exams</option>
          {EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}
        </select>
        <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Difficulty</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['#', 'Question', 'Test', 'Section', 'Difficulty', 'Answer', 'Topic', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" /></td></tr>
            ) : questions.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No questions found.</td></tr>
            ) : questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-500">{q.questionOrder}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[300px] truncate">{q.questionText}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{q.test?.title || '-'}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{q.section}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    q.difficulty === 'EASY' ? 'bg-green-50 text-green-700' :
                    q.difficulty === 'HARD' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{q.difficulty}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{q.correctOption}</td>
                <td className="px-4 py-3 text-gray-500">{q.topicTag || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(q)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(q.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
            <button disabled={pagination.page <= 1} onClick={() => fetchQuestions(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchQuestions(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Question' : 'Create Question'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Test *</label><select value={form.testId} onChange={upd('testId')} className={selectCls}><option value="">Select test</option>{tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Question Text *</label><textarea rows={3} value={form.questionText} onChange={upd('questionText')} className={textareaCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Option A *</label><input value={form.optionA} onChange={upd('optionA')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Option B *</label><input value={form.optionB} onChange={upd('optionB')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Option C *</label><input value={form.optionC} onChange={upd('optionC')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Option D *</label><input value={form.optionD} onChange={upd('optionD')} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Correct Answer *</label><select value={form.correctOption} onChange={upd('correctOption')} className={selectCls}>{OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Section *</label><select value={form.section} onChange={upd('section')} className={selectCls}>{SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Difficulty *</label><select value={form.difficulty} onChange={upd('difficulty')} className={selectCls}>{DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Exam *</label><select value={form.examType} onChange={upd('examType')} className={selectCls}>{EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Question Order *</label><input type="number" min="1" value={form.questionOrder} onChange={upd('questionOrder')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Topic Tag</label><input value={form.topicTag} onChange={upd('topicTag')} placeholder="e.g. Algebra" className={inputCls} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Explanation</label><textarea rows={2} value={form.explanation} onChange={upd('explanation')} className={textareaCls} /></div>
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
            <h2 className="text-lg font-bold text-gray-900">Delete Question</h2>
            <p className="mt-2 text-sm text-gray-500">Are you sure? This action cannot be undone.</p>
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
