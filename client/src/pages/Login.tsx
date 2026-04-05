import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/auth';
import { setAuth, showToast } from '../store/signals';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.token, res.data.user);
      showToast('התחברת בהצלחה!', 'success');
      navigate('/my-surveys');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'אימייל או סיסמה שגויים', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-indigo-600 font-bold text-2xl">📊 מערכת סקרים</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">כניסה למערכת</h1>
          <p className="text-gray-500 mt-1">הכנס את פרטי ההתחברות שלך</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <label className="label">כתובת אימייל</label>
            <input
              className="input"
              type="email"
              placeholder="israel@example.com"
              dir="ltr"
              {...register('email', {
                required: 'שדה חובה',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' },
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">סיסמה</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'שדה חובה' })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>

          <p className="text-center text-sm text-gray-500">
            אין לך חשבון?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              הרשם בחינם
            </Link>
          </p>
        </form>

        <div className="mt-6 card bg-blue-50 border-blue-200 text-sm text-blue-800">
          <p className="font-semibold mb-2">👤 כניסה לדוגמה:</p>
          <p>ניתן ליצור חשבון מנהל ראשון דרך ה-API ישירות.</p>
        </div>
      </div>
    </div>
  );
}
