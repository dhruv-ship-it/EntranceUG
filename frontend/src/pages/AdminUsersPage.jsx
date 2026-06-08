import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const ROLES = ['STUDENT', 'MENTOR', 'ADMIN', 'PARENT'];
const EXAMS = ['IPMAT_INDORE', 'IPMAT_ROHTAK', 'JIPMAT', 'CUET'];
const CLASS_YEARS = ['CLASS_11', 'CLASS_12', 'DROPPER'];
const SUB_STATUSES = ['ACTIVE', 'EXPIRED', 'TRIAL'];
const SUB_PLANS = ['BASIC', 'PRO', 'ELITE'];

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

const emptyForm = {
  name: '', email: '', password: '', phone: '', role: 'STUDENT',
  examPrimary: 'IPMAT_INDORE', examSecondary: '', classYear: 'CLASS_12',
  subscriptionStatus: 'TRIAL', subscriptionPlan: 'BASIC',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mentors, setMentors] = useState([]);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorModalStudent, setMentorModalStudent] = useState(null);
  const [mentorModalMentorId, setMentorModalMentorId] = useState('');
  const [mentorModalError, setMentorModalError] = useState('');
  const [mentorSaving, setMentorSaving] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/v1/admin/users', { params });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch { setError('Failed to fetch users.'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/v1/admin/mentors');
        setMentors(res.data.data.mentors);
      } catch (err) {
        console.error('Failed to load mentors:', err);
      }
    };
    fetchMentors();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({
      name: u.name, email: u.email, password: '', phone: u.phone, role: u.role,
      examPrimary: u.examPrimary, examSecondary: u.examSecondary || '', classYear: u.classYear,
      subscriptionStatus: u.subscriptionStatus, subscriptionPlan: u.subscriptionPlan,
    });
    setError('');
    setShowModal(true);
  };

  const openAssignMentor = (student) => {
    setMentorModalStudent(student);
    setMentorModalMentorId(student.mentorId || '');
    setMentorModalError('');
    setSuccessMessage('');
    setMentorModalOpen(true);
  };

  const closeMentorModal = () => {
    setMentorModalOpen(false);
    setMentorModalStudent(null);
    setMentorModalMentorId('');
    setMentorModalError('');
  };

  const handleAssignMentor = async () => {
    if (!mentorModalStudent) return;
    if (!mentorModalMentorId) {
      setMentorModalError('Please select a mentor.');
      return;
    }

    setMentorSaving(true);
    setMentorModalError('');
    try {
      await api.put(`/v1/admin/students/${mentorModalStudent.id}/mentor`, { mentorId: mentorModalMentorId });
      setSuccessMessage('Mentor assignment updated successfully.');
      closeMentorModal();
      fetchUsers(pagination.page);
    } catch (err) {
      setMentorModalError(err.response?.data?.message || 'Failed to assign mentor.');
    } finally {
      setMentorSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editId) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/v1/admin/users/${editId}`, data);
      } else {
        await api.post('/v1/admin/users', form);
      }
      setShowModal(false);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/v1/admin/users/${deleteId}`);
      setDeleteId(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const upd = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100';
  const selectCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage all platform users</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Name', 'Email', 'Phone', 'Role', 'Mentor', 'Exam', 'Class', 'Plan', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-600" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                    u.role === 'MENTOR' ? 'bg-purple-50 text-purple-700' :
                    u.role === 'PARENT' ? 'bg-amber-50 text-amber-700' :
                    'bg-green-50 text-green-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.role === 'STUDENT' ? (u.mentor?.name || 'Unassigned') : '-'}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(u.examPrimary)}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(u.classYear)}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(u.subscriptionPlan)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 space-y-2">
                  {u.role === 'STUDENT' && (
                    <button onClick={() => openAssignMentor(u)} className="w-full rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100">
                      {u.mentorId ? 'Change Mentor' : 'Assign Mentor'}
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(u.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit User' : 'Create User'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Name *</label><input value={form.name} onChange={upd('name')} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Phone *</label><input value={form.phone} onChange={upd('phone')} className={inputCls} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Email *</label><input type="email" value={form.email} onChange={upd('email')} className={inputCls} /></div>
              <div><label className="mb-1 block text-xs font-medium text-gray-600">Password {!editId && '*'}</label><input type="password" value={form.password} onChange={upd('password')} placeholder={editId ? 'Leave blank to keep' : ''} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Role *</label><select value={form.role} onChange={upd('role')} className={selectCls}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Class *</label><select value={form.classYear} onChange={upd('classYear')} className={selectCls}>{CLASS_YEARS.map((c) => <option key={c} value={c}>{formatEnum(c)}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Primary Exam *</label><select value={form.examPrimary} onChange={upd('examPrimary')} className={selectCls}>{EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Secondary Exam</label><select value={form.examSecondary} onChange={upd('examSecondary')} className={selectCls}><option value="">None</option>{EXAMS.map((e) => <option key={e} value={e}>{formatEnum(e)}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Subscription Status</label><select value={form.subscriptionStatus} onChange={upd('subscriptionStatus')} className={selectCls}>{SUB_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Subscription Plan</label><select value={form.subscriptionPlan} onChange={upd('subscriptionPlan')} className={selectCls}>{SUB_PLANS.map((p) => <option key={p}>{p}</option>)}</select></div>
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

      {/* Assign Mentor Modal */}
      {mentorModalOpen && mentorModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{mentorModalStudent.mentorId ? 'Change Mentor' : 'Assign Mentor'}</h2>
                <p className="text-sm text-gray-500">Select a mentor for {mentorModalStudent.name}</p>
              </div>
              <button onClick={closeMentorModal} className="rounded-lg p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            {mentorModalError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{mentorModalError}</div>}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Mentor *</label>
                <select value={mentorModalMentorId} onChange={(e) => setMentorModalMentorId(e.target.value)} className={selectCls}>
                  <option value="">Select a mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>{mentor.name} — {mentor.email}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeMentorModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssignMentor} disabled={mentorSaving} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                {mentorSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete User</h2>
            <p className="mt-2 text-sm text-gray-500">Are you sure? This will permanently remove the user and cannot be undone.</p>
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
