import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSignals } from '@preact/signals-react/runtime';
import { adminApi, SurveyorData } from '../api/admin';
import { currentUser, clearAuth, showToast, toastMessage, isAdmin } from '../store/signals';
import Toast from '../components/Toast';
import Dialog from '../components/Dialog';

interface Subscription {
  plan?: 'monthly' | 'annual';
  status?: 'trial' | 'active' | 'inactive' | 'cancelled';
  pricePerMonth?: number;
  startDate?: string;
  endDate?: string;
}

interface Surveyor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  jobTitle?: string;
  isActive: boolean;
  subscription?: Subscription;
}

type ModalMode = 'create' | 'edit';

const PLAN_LABEL: Record<string, string> = { monthly: 'חודשי', annual: 'שנתי' };
const STATUS_LABEL: Record<string, string> = {
  trial: 'ניסיון',
  active: 'פעיל',
  inactive: 'לא פעיל',
  cancelled: 'בוטל',
};
const STATUS_COLOR: Record<string, string> = {
  trial: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-200 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminSurveyors() {
  useSignals();
  const navigate = useNavigate();
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: ModalMode; surveyor?: Surveyor } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SurveyorData>();
  const watchedPlan = watch('subscription.plan');

  useEffect(() => {
    if (!isAdmin.value) navigate('/admin', { replace: true });
    else fetchSurveyors();
  }, []);

  async function fetchSurveyors(q?: string) {
    setLoading(true);
    try {
      const res = await adminApi.getSurveyors(q);
      setSurveyors(res.data);
    } catch {
      showToast('שגיאה בטעינת הסוקרים', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchSurveyors(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search]);

  function openCreate() {
    reset({
      firstName: '', lastName: '', email: '', password: '', phone: '',
      companyName: '', jobTitle: '',
      subscription: { plan: 'monthly', status: 'trial', pricePerMonth: 0 },
    });
    setModal({ mode: 'create' });
  }

  function openEdit(s: Surveyor) {
    reset({
      firstName: s.firstName, lastName: s.lastName, email: s.email,
      password: '', phone: s.phone,
      companyName: s.companyName ?? '', jobTitle: s.jobTitle ?? '',
      subscription: {
        plan: s.subscription?.plan ?? 'monthly',
        status: s.subscription?.status ?? 'trial',
        pricePerMonth: s.subscription?.pricePerMonth ?? 0,
        startDate: s.subscription?.startDate?.slice(0, 10) ?? '',
        endDate: s.subscription?.endDate?.slice(0, 10) ?? '',
      },
    });
    setModal({ mode: 'edit', surveyor: s });
  }

  const onSubmit = async (data: SurveyorData) => {
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await adminApi.createSurveyor(data);
        showToast('סוקר נוצר בהצלחה', 'success');
      } else if (modal?.surveyor) {
        const payload = { ...data };
        if (!payload.password) delete (payload as any).password;
        await adminApi.updateSurveyor(modal.surveyor._id, payload);
        showToast('הסוקר עודכן בהצלחה', 'success');
      }
      setModal(null);
      fetchSurveyors(search || undefined);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בשמירה', 'error');
    } finally {
      setSaving(false);
    }
  };

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await adminApi.deleteSurveyor(deleteId);
      showToast('הסוקר נמחק', 'success');
      setDeleteId(null);
      fetchSurveyors(search || undefined);
    } catch {
      showToast('שגיאה במחיקה', 'error');
    }
  }

  function logout() {
    clearAuth();
    navigate('/admin');
  }

  // Monthly equivalent price for display
  const monthlyPrice = (s: Surveyor) => {
    const p = s.subscription?.pricePerMonth ?? 0;
    if (!p) return null;
    if (s.subscription?.plan === 'annual') return `₪${(p * 12).toLocaleString()} / שנה`;
    return `₪${p.toLocaleString()} / חודש`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {toastMessage.value && <Toast />}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="font-bold text-lg leading-none">ממשק ניהול</h1>
            <p className="text-gray-400 text-xs mt-0.5">ניהול סוקרים ומנויים</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {currentUser.value?.firstName} {currentUser.value?.lastName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            יציאה
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="חיפוש לפי שם, אימייל, חברה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-sm px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <span>+</span> סוקר חדש
          </button>
        </div>

        {/* Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">טוען...</div>
          ) : surveyors.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p>לא נמצאו סוקרים</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 text-gray-300 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-right px-5 py-3">שם</th>
                  <th className="text-right px-5 py-3">אימייל</th>
                  <th className="text-right px-5 py-3">טלפון</th>
                  <th className="text-right px-5 py-3">חברה</th>
                  <th className="text-right px-5 py-3">תוכנית</th>
                  <th className="text-right px-5 py-3">סטטוס מנוי</th>
                  <th className="text-right px-5 py-3">עלות</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {surveyors.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 font-medium">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs" dir="ltr">
                      {s.email}
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-xs" dir="ltr">{s.phone}</td>
                    <td className="px-5 py-4 text-gray-300">{s.companyName || '—'}</td>
                    <td className="px-5 py-4">
                      {s.subscription?.plan ? (
                        <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded-full">
                          {PLAN_LABEL[s.subscription.plan]}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {s.subscription?.status ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[s.subscription.status]}`}>
                          {STATUS_LABEL[s.subscription.status]}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-xs">
                      {monthlyPrice(s) || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1 rounded-lg hover:bg-indigo-900/30 transition-colors"
                        >
                          עריכה
                        </button>
                        <button
                          onClick={() => setDeleteId(s._id)}
                          className="text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-900/30 transition-colors"
                        >
                          מחיקה
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-3">{surveyors.length} סוקרים במערכת</p>
      </main>

      {/* Create / Edit Modal */}
      {modal && (
        <Dialog
          title={modal.mode === 'create' ? 'יצירת סוקר חדש' : 'עריכת סוקר'}
          onClose={() => setModal(null)}
          size="xl"
          variant="dark"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Personal details */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-3 border-b border-gray-700 pb-1">
                פרטים אישיים
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">שם פרטי</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('firstName', { required: 'שדה חובה' })}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">שם משפחה</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('lastName', { required: 'שדה חובה' })}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm text-gray-300 mb-1">אימייל</label>
                <input
                  type="email"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('email', {
                    required: 'שדה חובה',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' },
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="mt-3">
                <label className="block text-sm text-gray-300 mb-1">
                  סיסמה {modal.mode === 'edit' && <span className="text-gray-500 text-xs">(ריק = ללא שינוי)</span>}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('password', {
                    required: modal.mode === 'create' ? 'שדה חובה' : false,
                    minLength: { value: 8, message: 'לפחות 8 תווים' },
                  })}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">טלפון</label>
                  <input
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('phone', { required: 'שדה חובה' })}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">חברה</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('companyName')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">תפקיד</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('jobTitle')}
                  />
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-3 border-b border-gray-700 pb-1">
                💳 פרטי מנוי
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">תוכנית</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('subscription.plan', { required: 'שדה חובה' })}
                  >
                    <option value="monthly">חודשי</option>
                    <option value="annual">שנתי</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">סטטוס</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('subscription.status')}
                  >
                    <option value="trial">ניסיון</option>
                    <option value="active">פעיל</option>
                    <option value="inactive">לא פעיל</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm text-gray-300 mb-1">
                  מחיר לחודש (₪)
                  {watchedPlan === 'annual' && (
                    <span className="text-gray-400 text-xs mr-2">
                      — סה״כ שנתי: ₪{((Number(watch('subscription.pricePerMonth')) || 0) * 12).toLocaleString()}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('subscription.pricePerMonth', { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">תאריך התחלה</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('subscription.startDate')}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">תאריך סיום</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register('subscription.endDate')}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? 'שומר...' : modal.mode === 'create' ? 'יצירה' : 'שמירה'}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                ביטול
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <Dialog title="מחיקת סוקר" onClose={() => setDeleteId(null)} size="sm" variant="dark">
          <div className="text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <p className="text-gray-400 text-sm">פעולה זו אינה ניתנת לביטול.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                מחיקה
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
