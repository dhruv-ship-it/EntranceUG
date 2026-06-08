import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const formatEnum = (v) => v ? v.replace(/_/g, ' ') : '-';

export default function MentorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await api.get('/v1/mentor/students', { params });
      setStudents(res.data.data.students);
      setPagination(res.data.data.pagination);
    } catch { /* handled by error state */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-sm text-gray-500">Students assigned to you for mentoring</p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-accent-500 focus:outline-none" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              {['Name', 'Email', 'Phone', 'Exam', 'Class', 'Cohort', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-600" /></td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No students assigned to you yet.</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.email}</td>
                <td className="px-4 py-3 text-gray-600">{s.phone || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(s.examPrimary)}</td>
                <td className="px-4 py-3 text-gray-600">{formatEnum(s.classYear)}</td>
                <td className="px-4 py-3 text-gray-600">{s.cohort?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link to={`/mentor/dashboard/students/${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
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
            <button disabled={pagination.page <= 1} onClick={() => fetchStudents(pagination.page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchStudents(pagination.page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
