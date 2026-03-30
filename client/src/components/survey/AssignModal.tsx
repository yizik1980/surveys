import { useState } from 'react';
import { surveysApi } from '../../api/surveys';
import { usersApi } from '../../api/users';
import { showToast } from '../../store/signals';
import type { Survey } from '../../store/signals';

interface Recipient { email: string; name: string; }

export default function AssignModal({
  survey, onClose, onSuccess,
}: {
  survey: Survey; onClose: () => void; onSuccess: () => void;
}) {
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: '', name: '' }]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);

  const addRow = () => setRecipients([...recipients, { email: '', name: '' }]);
  const removeRow = (i: number) => setRecipients(recipients.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof Recipient, val: string) => {
    setRecipients(recipients.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const parseBulk = (): Recipient[] => {
    return bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        return { email: parts[0], name: parts[1] || '' };
      })
      .filter((r) => r.email.includes('@'));
  };

  const handleSend = async () => {
    const list = bulkMode ? parseBulk() : recipients.filter((r) => r.email.trim());
    if (list.length === 0) {
      showToast('יש להזין לפחות כתובת מייל אחת', 'error');
      return;
    }
    setLoading(true);
    try {
      await surveysApi.assign(survey._id, list);
      showToast(`הסקר נשלח ל-${list.length} כתובות`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בשליחה', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">שליחת סקר</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="bg-indigo-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-indigo-800">📋 {survey.title}</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {survey.questions?.length || 0} שאלות
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBulkMode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!bulkMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              הזנה ידנית
            </button>
            <button
              onClick={() => setBulkMode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${bulkMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              הדבקה מרובה
            </button>
          </div>

          {!bulkMode ? (
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="email@example.com"
                    dir="ltr"
                    value={r.email}
                    onChange={(e) => updateRow(i, 'email', e.target.value)}
                  />
                  <input
                    className="input flex-1 text-sm"
                    placeholder="שם (אופציונלי)"
                    value={r.name}
                    onChange={(e) => updateRow(i, 'name', e.target.value)}
                  />
                  {recipients.length > 1 && (
                    <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>
                  )}
                </div>
              ))}
              <button onClick={addRow} className="text-indigo-600 text-sm hover:underline">
                + הוסף שורה
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-2">
                הדבק רשימה — שורה לכל מוען. פורמט: <code>email, שם</code>
              </p>
              <textarea
                className="input font-mono text-sm"
                rows={8}
                dir="ltr"
                placeholder={'israel@example.com, ישראל ישראלי\ntest@example.com'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              {bulkMode && (
                <p className="text-xs text-gray-400 mt-1">
                  זוהו {parseBulk().length} כתובות תקינות
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">ביטול</button>
            <button onClick={handleSend} disabled={loading} className="btn-primary flex-1">
              {loading ? 'שולח...' : '📧 שלח הזמנות'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
