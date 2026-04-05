import { useEffect, useState } from 'react';
import { surveysApi } from '../api/surveys';
import type { Survey } from '../store/signals';
import AssignModal from '../components/survey/AssignModal';

interface ResponseStats {
  total: number;
  assigned: number;
  responseRate: number;
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/survey/${token}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title={link}
      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {copied ? '✓ הועתק' : '🔗 קישור'}
    </button>
  );
}

export default function CRM() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [stats, setStats] = useState<ResponseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await surveysApi.getAll();
      setSurveys(res.data);
      if (res.data.length > 0 && !selectedSurvey) {
        selectSurvey(res.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectSurvey = async (survey: Survey) => {
    setSelectedSurvey(survey);
    try {
      const statsRes = await surveysApi.getResponseStats(survey._id);
      setStats(statsRes.data);
    } catch {
      setStats(null);
    }
  };

  useEffect(() => { load(); }, []);

  const statusLabel: Record<string, string> = {
    pending: 'ממתין',
    sent: 'נשלח',
    responded: 'הגיב',
  };
  const statusColor: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    responded: 'bg-green-100 text-green-700',
  };

  const filteredUsers = selectedSurvey?.assignedUsers?.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()),
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {assignModal && selectedSurvey && (
        <AssignModal
          survey={selectedSurvey}
          onClose={() => setAssignModal(false)}
          onSuccess={() => { load(); setAssignModal(false); }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM — ניהול סקרים ומוענים</h1>
          <p className="text-gray-500 text-sm">עקוב אחרי מצב השליחה והמענה לכל סקר</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey list */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">הסקרים שלי</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">טוען...</p>
          ) : (
            <div className="space-y-2">
              {surveys.map((s) => (
                <button
                  key={s._id}
                  onClick={() => selectSurvey(s)}
                  className={`w-full text-right p-3 rounded-lg transition-colors text-sm ${
                    selectedSurvey?._id === s._id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <p className="font-medium text-gray-900 line-clamp-1">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.assignedUsers?.length || 0} מוענים •{' '}
                    {s.assignedUsers?.filter((u) => u.status === 'responded').length || 0} הגיבו
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-5">
          {!selectedSurvey ? (
            <div className="card text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p>בחר סקר מהרשימה לצפייה</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedSurvey.title}</h2>
                    {selectedSurvey.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{selectedSurvey.description}</p>
                    )}
                  </div>
                  <button onClick={() => setAssignModal(true)} className="btn-primary text-sm">
                    📧 שלח לנסקרים
                  </button>
                </div>

                {stats && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{stats.assigned}</p>
                      <p className="text-xs text-blue-600 mt-1">הוזמנו</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{stats.total}</p>
                      <p className="text-xs text-green-600 mt-1">הגיבו</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-700">{stats.responseRate}%</p>
                      <p className="text-xs text-indigo-600 mt-1">שיעור מענה</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Respondent list */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">רשימת מוענים</h3>
                  <input
                    className="input max-w-[220px] text-sm"
                    placeholder="🔍 חפש לפי מייל או שם..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    {selectedSurvey.assignedUsers?.length === 0
                      ? 'טרם נשלחו הזמנות לסקר זה'
                      : 'לא נמצאו תוצאות'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-gray-500 text-xs">
                          <th className="text-right pb-2 font-medium">שם</th>
                          <th className="text-right pb-2 font-medium">אימייל</th>
                          <th className="text-right pb-2 font-medium">סטטוס</th>
                          <th className="text-right pb-2 font-medium">נשלח</th>
                          <th className="text-right pb-2 font-medium">הגיב</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2.5 font-medium text-gray-900">
                              {u.name || '—'}
                            </td>
                            <td className="py-2.5 text-gray-600 font-mono text-xs">{u.email}</td>
                            <td className="py-2.5">
                              <span className={`badge ${statusColor[u.status]}`}>
                                {statusLabel[u.status]}
                              </span>
                            </td>
                            <td className="py-2.5 text-gray-400 text-xs">
                              {u.sentAt ? new Date(u.sentAt).toLocaleDateString('he-IL') : '—'}
                            </td>
                            <td className="py-2.5 text-gray-400 text-xs">
                              {u.respondedAt ? new Date(u.respondedAt).toLocaleDateString('he-IL') : '—'}
                            </td>
                            <td className="py-2.5">
                              <CopyLinkButton token={u.token} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
