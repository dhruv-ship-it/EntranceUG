import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const examOptions = [
  { value: 'IPMAT_INDORE', label: 'IPMAT Indore' },
  { value: 'IPMAT_ROHTAK', label: 'IPMAT Rohtak' },
  { value: 'JIPMAT', label: 'JIPMAT' },
  { value: 'CUET', label: 'CUET' },
];

const classYearOptions = [
  { value: 'CLASS_11', label: 'Class 11' },
  { value: 'CLASS_12', label: 'Class 12' },
  { value: 'DROPPER', label: 'Dropper' },
];

export default function StudentSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    examPrimary: '',
    examSecondary: '',
    classYear: '',
  });
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      examPrimary: form.examPrimary,
      examSecondary: form.examSecondary || undefined,
      classYear: form.classYear,
    };

    const result = await signup(payload);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100';
  const selectClass =
    'w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 appearance-none bg-white';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-accent-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-500">Start your exam preparation journey today</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="name" type="text" value={form.name} onChange={update('name')} placeholder="Your full name" required className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="phone" type="tel" value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" required className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min 6 characters" required className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Exam */}
            <div>
              <label htmlFor="examPrimary" className={labelClass}>Primary Exam</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select id="examPrimary" value={form.examPrimary} onChange={update('examPrimary')} required className={selectClass}>
                  <option value="" disabled>Select your exam</option>
                  {examOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Secondary Exam (optional) */}
            <div>
              <label htmlFor="examSecondary" className={labelClass}>Secondary Exam <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select id="examSecondary" value={form.examSecondary} onChange={update('examSecondary')} className={selectClass}>
                  <option value="">None</option>
                  {examOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Class Year */}
            <div>
              <label htmlFor="classYear" className={labelClass}>Class / Year</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select id="classYear" value={form.classYear} onChange={update('classYear')} required className={selectClass}>
                  <option value="" disabled>Select your class</option>
                  {classYearOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
