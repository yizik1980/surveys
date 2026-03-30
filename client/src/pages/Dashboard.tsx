import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import { currentUser, isAdmin, isSurveyor } from '../store/signals';
import { surveysApi } from '../api/surveys';
import { usersApi } from '../api/users';

interface SurveyStats {
  total: number;
  byStatus: Array<{ _id: string; count: number }>;
  totalResponses: number;
}

interface UserStats {
  total: number;
  byRole: Array<{ _id: string; count: number }>;
}

const statusLabel: Record<string, string> = {
  draft: 'טיוטה',
  active: 'פעיל',
  closed: 'סגור',
};

const statusColor: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function Dashboard() {
  useSignals();
  const [surveyStats, setSurveyStats] = useState<SurveyStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentSurveys, setRecentSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isSurveyor.value) {
          const [statsRes, surveysRes] = await Promise.all([
            surveysApi.getStats(),
            surveysApi.getAll(),
          ]);
          setSurveyStats(statsRes.data);
          setRecentSurveys(surveysRes.data.slice(0, 5));
        }
        if (isAdmin.value) {
          const uStats = await usersApi.getStats();
          setUserStats(uStats.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">טוען...</div>
      </div>
    );
  }

  const user = currentUser.value;
  const roleLabel: Record<string, string> = {
    admin: 'מנהל מערכת',
    surveyor: 'סוקר',
    surveyed: 'נסקר',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          שלום, {user?.firstName} {user?.lastName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {roleLabel[user?.role || '']} — ברוך הבא ללוח הבקרה
        </p>
      </div>

      {/* Stats Cards */}
      {isSurveyor.value && surveyStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📋"
            title="סה״כ סקרים"
            value={surveyStats.total}
            color="indigo"
          />
          <StatCard
            icon="✅"
            title="סקרים פעילים"
            value={surveyStats.byStatus.find((s) => s._id === 'active')?.count || 0}
            color="green"
          />
          <StatCard
            icon="📝"
            title="טיוטות"
            value={surveyStats.byStatus.find((s) => s._id === 'draft')?.count || 0}
            color="yellow"
          />
          <StatCard
            icon="💬"
            title="תשובות התקבלו"
            value={surveyStats.totalResponses}
            color="purple"
          />
        </div>
      )}

      {isAdmin.value && userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon="👥" title="סה״כ משתמשים" value={userStats.total} color="indigo" />
          <StatCard
            icon="🎯"
            title="סוקרים"
            value={userStats.byRole.find((r) => r._id === 'surveyor')?.count || 0}
            color="blue"
          />
          <StatCard
            icon="👤"
            title="נסקרים"
            value={userStats.byRole.find((r) => r._id === 'surveyed')?.count || 0}
            color="green"
          />
          <StatCard
            icon="🔑"
            title="מנהלים"
            value={userStats.byRole.find((r) => r._id === 'admin')?.count || 0}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surveys */}
        {isSurveyor.value && (
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">סקרים אחרונים</h2>
              <Link to="/surveys" className="text-indigo-600 text-sm hover:underline">
                הצג הכל
              </Link>
            </div>
            {recentSurveys.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p>אין סקרים עדיין</p>
                <Link to="/surveys/new" className="btn-primary mt-3 inline-block">
                  צור סקר ראשון
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSurveys.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.questions?.length || 0} שאלות •{' '}
                        {s.assignedUsers?.length || 0} מוענים
                      </p>
                    </div>
                    <span className={`badge ${statusColor[s.status]}`}>
                      {statusLabel[s.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h2>
          <div className="space-y-3">
            {isSurveyor.value && (
              <>
                <Link to="/surveys/new" className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
                  <span>➕</span> צור סקר חדש
                </Link>
                <Link to="/surveys" className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
                  <span>📋</span> כל הסקרים
                </Link>
                <Link to="/crm" className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
                  <span>👥</span> CRM - ניהול מוענים
                </Link>
              </>
            )}
            {isAdmin.value && (
              <Link to="/users" className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
                <span>🔑</span> ניהול משתמשים
              </Link>
            )}
            {user?.role === 'surveyed' && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p className="font-semibold mb-1">👋 שלום!</p>
                <p>הסקרים שנשלחו אליך יגיעו למייל שלך עם קישור ייחודי למילוי.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: {
  icon: string; title: string; value: number; color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
