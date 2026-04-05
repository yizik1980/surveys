import { useEffect, useState } from 'react';
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

export default function MySurveys() {
  const [items, setItems] = useState<UserAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    surveysApi.getMyAssignments()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const completed = items.filter((i) => i.assignment.status === 'responded');
  const pending = items.filter((i) => i.assignment.status !== 'responded');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הסקרים שלי</h1>
        <p className="text-gray-500 text-sm">רשימת הסקרים שהוזמנת למלא</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">טוען...</p>
      ) : items.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>לא הוזמנת לאף סקר עדיין</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                ממתינים למילוי ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((item) => (
                  <div key={item._id} className="card flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
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
                      מלא סקר
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                הושלמו ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((item) => (
                  <div key={item._id} className="card flex items-center justify-between gap-4 opacity-75">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
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
