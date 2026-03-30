import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { surveysApi } from '../api/surveys';
import { showToast } from '../store/signals';
import type { Survey } from '../store/signals';
import AssignModal from '../components/survey/AssignModal';

const statusLabel: Record<string, string> = { draft: 'טיוטה', active: 'פעיל', closed: 'סגור' };
const statusColor: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignSurvey, setAssignSurvey] = useState<Survey | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await surveysApi.getAll({ search, status: statusFilter });
      setSurveys(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק את הסקר? לא ניתן לשחזר.')) return;
    try {
      await surveysApi.remove(id);
      showToast('הסקר נמחק', 'success');
      load();
    } catch {
      showToast('שגיאה במחיקה', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {assignSurvey && (
        <AssignModal
          survey={assignSurvey}
          onClose={() => setAssignSurvey(null)}
          onSuccess={load}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הסקרים שלי</h1>
        <Link to="/surveys/new" className="btn-primary">➕ סקר חדש</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="🔍 חפש סקר..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="active">פעיל</option>
          <option value="closed">סגור</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">טוען...</div>
      ) : surveys.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">אין סקרים</p>
          <p className="text-gray-400 mb-6">צור את הסקר הראשון שלך</p>
          <Link to="/surveys/new" className="btn-primary">צור סקר חדש</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {surveys.map((s) => (
            <div key={s._id} className="card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${statusColor[s.status]}`}>{statusLabel[s.status]}</span>
                <span className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString('he-IL')}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{s.title}</h3>
              {s.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{s.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span>❓ {s.questions?.length || 0} שאלות</span>
                <span>📧 {s.assignedUsers?.length || 0} מוענים</span>
                <span>✅ {s.assignedUsers?.filter((u) => u.status === 'responded').length || 0} תשובות</span>
              </div>
              <div className="flex gap-2 mt-auto pt-3 border-t">
                <button
                  onClick={() => navigate(`/surveys/${s._id}/edit`)}
                  className="btn-secondary flex-1 text-xs py-1.5"
                >
                  ✏️ ערוך
                </button>
                <button
                  onClick={() => setAssignSurvey(s)}
                  className="btn-primary flex-1 text-xs py-1.5"
                >
                  📧 שלח
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="btn-danger text-xs py-1.5 px-3"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
