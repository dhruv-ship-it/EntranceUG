import { Link } from 'react-router-dom';
import { BookOpen, Target, Users, TrendingUp, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Mock Tests',
    description: 'Full-length and sectional tests designed by experts with detailed analytics.',
  },
  {
    icon: Users,
    title: '1-on-1 Mentorship',
    description: 'Get paired with top mentors who guide your preparation strategy.',
  },
  {
    icon: Target,
    title: 'Personalized Study Plans',
    description: 'AI-driven plans adapted to your strengths, weaknesses, and timeline.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Track your progress with SWOT analysis and percentile rankings.',
  },
  {
    icon: Award,
    title: 'Gamified Learning',
    description: 'Earn XP, unlock badges, and stay motivated with streaks and leaderboards.',
  },
  {
    icon: Clock,
    title: 'Daily Check-ins',
    description: 'Build consistency with daily study logs and mentor reviews.',
  },
];

const exams = [
  { name: 'IPMAT Indore', tag: '5-year Integrated MBA', color: 'bg-blue-50 text-blue-700' },
  { name: 'IPMAT Rohtak', tag: '5-year Integrated MBA', color: 'bg-indigo-50 text-indigo-700' },
  { name: 'JIPMAT', tag: 'IIM Jammu IPM', color: 'bg-purple-50 text-purple-700' },
  { name: 'CUET', tag: 'Central Universities', color: 'bg-pink-50 text-pink-700' },
];

const stats = [
  { value: '10,000+', label: 'Students' },
  { value: '500+', label: 'Mock Tests' },
  { value: '50+', label: 'Expert Mentors' },
  { value: '95%', label: 'Success Rate' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold text-primary-700">
              Trusted by 10,000+ aspirants
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Crack Your Dream
              <span className="block text-primary-600">Entrance Exam</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              India&apos;s most comprehensive exam prep platform. Mock tests, personal mentors,
              AI-powered analytics &mdash; everything you need to ace IPMAT, JIPMAT, and CUET.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-xl sm:w-auto"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/#features"
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-md sm:w-auto"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-gray-600">
              A complete ecosystem for your exam preparation journey.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 p-6 transition-all hover:border-primary-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section id="exams" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Exams We Cover
            </h2>
            <p className="mt-4 text-gray-600">
              Specialized preparation for India&apos;s top management entrance exams.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {exams.map((exam) => (
              <div
                key={exam.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center transition-all hover:shadow-lg"
              >
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${exam.color}`}>
                  {exam.tag}
                </span>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{exam.name}</h3>
                <ul className="mt-4 space-y-2 text-left text-sm text-gray-500">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Mock Tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Study Plans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Mentorship</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of students who cracked their dream college with EntranceUG.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Already a Student? Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Access */}
      <div className="border-t border-gray-100 bg-gray-50 py-4 text-center">
        <Link
          to="/admin/login"
          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          Admin Portal
        </Link>
      </div>
    </div>
  );
}
