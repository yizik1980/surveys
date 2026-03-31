import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSignals } from '@preact/signals-react/runtime';
import { authApi } from '../api/auth';
import { setAuth, isAdmin, showToast, toastMessage } from '../store/signals';
import Toast from '../components/Toast';

interface FormData {
  email: string;
  password: string;
}

export default function AdminLogin() {
  useSignals();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (isAdmin.value) navigate('/admin/surveyors', { replace: true });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.adminLogin(data.email, data.password);
      setAuth(res.data.token, res.data.user);
      showToast('ברוך הבא, מנהל!', 'success');
      navigate('/admin/surveyors');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'פרטי התחברות שגויים', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4" dir="rtl">
      {toastMessage.value && <Toast />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ממשק ניהול</h1>
          <p className="text-gray-400 mt-1">כניסה לאדמין בלבד</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 border border-gray-700 rounded-2xl p-8 space-y-5 shadow-2xl"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">אימייל</label>
            <input
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              type="email"
              placeholder="admin@example.com"
              dir="ltr"
              {...register('email', {
                required: 'שדה חובה',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' },
              })}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">סיסמה</label>
            <input
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'שדה חובה' })}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'מתחבר...' : 'כניסה לממשק הניהול'}
          </button>
        </form>
      </div>
    </div>
  );
}
