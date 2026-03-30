import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import { currentUser, isAdmin, isSurveyor, clearAuth } from '../store/signals';

export default function Navbar() {
  useSignals();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'לוח בקרה', show: true },
    { to: '/surveys', label: 'סקרים', show: isSurveyor.value },
    { to: '/crm', label: 'CRM', show: isSurveyor.value },
    { to: '/users', label: 'ניהול משתמשים', show: isAdmin.value },
  ];

  const roleLabel: Record<string, string> = {
    admin: 'מנהל',
    surveyor: 'סוקר',
    surveyed: 'נסקר',
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-bold text-xl tracking-tight">
            📊 מערכת סקרים
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links
              .filter((l) => l.show)
              .map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(l.to)
                      ? 'bg-indigo-900'
                      : 'hover:bg-indigo-600'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-indigo-200">
            {currentUser.value?.firstName} {currentUser.value?.lastName}
          </span>
          <span className="badge bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
            {roleLabel[currentUser.value?.role || ''] || currentUser.value?.role}
          </span>
          <button
            onClick={() => { clearAuth(); navigate('/login'); }}
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>
    </nav>
  );
}
