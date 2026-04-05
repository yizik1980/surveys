import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import { currentUser } from '../store/signals';
import { surveysApi } from '../api/surveys';

interface UserAssignment {
  _id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  assignment: {
    token?: string;
    status?: 'pending' | 'sent' | 'responded';
    sentAt?: string;
    respondedAt?: string;
  };
}

export default function SurveyedDashboard() {
  useSignals();
  const [items, setItems] = useState<UserAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    surveysApi.getMyAssignments()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const user = currentUser.value;
  const completed = items.filter((i) => i.assignment.status === 'responded');
  const pending = items.filter((i) => i.assignment.status !== 'responded');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          שלום, {user?.firstName} {user?.lastName} 👋
        </h1>
        <p className="text-gray-500 mt-1">ברוך הבא — כאן תמצא את כל הסקרים שנשלחו אליך</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-indigo-50 text-indigo-600">
            📋
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-sm text-gray-500">סה״כ סקרים</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-yellow-50 text-yellow-600">
            ⏳
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
            <p className="text-sm text-gray-500">ממתינים למילוי</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-green-50 text-green-600">
            ✅
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
            <p className="text-sm text-gray-500">הושלמו</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📬</p>
          <p className="text-lg font-medium text-gray-600">אין סקרים עדיין</p>
          <p className="text-sm mt-1">כשיישלחו אליך סקרים הם יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                ממתינים למילוי
              </h2>
              <div className="space-y-3">
                {pending.map((item) => (
                  <div
                    key={item._id}
                    className="card flex items-center justify-between gap-4 border-r-4 border-yellow-400"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      {item.assignment.sentAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          נשלח: {new Date(item.assignment.sentAt).toLocaleDateString('he-IL')}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/survey/${item.assignment.token}`}
                      className="btn-primary text-sm whitespace-nowrap shrink-0"
                    >
                      מלא עכשיו
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                הושלמו
              </h2>
              <div className="space-y-3">
                {completed.map((item) => (
                  <div
                    key={item._id}
                    className="card flex items-center justify-between gap-4 opacity-70 border-r-4 border-green-400"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      {item.assignment.respondedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          הגבת: {new Date(item.assignment.respondedAt).toLocaleDateString('he-IL')}
                        </p>
                      )}
                    </div>
                    <span className="badge bg-green-100 text-green-700 shrink-0">✓ הושלם</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
