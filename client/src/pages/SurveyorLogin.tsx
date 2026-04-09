import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/auth';
import { setAuth, showToast } from '../store/signals';

interface FormData {
  email: string;
  password: string;
}

export default function SurveyorLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.surveyorLogin(data.email, data.password);
      setAuth(res.data.token, res.data.user);
      showToast('התחברת בהצלחה!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'אימייל או סיסמה שגויים', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-indigo-600 font-bold text-2xl">📊 מערכת סקרים</Link>
          <div className="mt-4 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full">
            🧑‍💼 פורטל סוקרים
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">כניסה לסוקר</h1>
          <p className="text-gray-500 mt-1">הכנס את פרטי חשבון הסוקר שלך</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <label className="label">כתובת אימייל</label>
            <input
              className="input"
              type="email"
              placeholder="surveyor@example.com"
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
            {loading ? 'מתחבר...' : 'כניסה לפורטל'}
          </button>

          <p className="text-center text-sm text-gray-500">
            אין לך חשבון סוקר?{' '}
            <Link to="/register/surveyor" className="text-indigo-600 font-medium hover:underline">
              הרשם כסוקר
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          נסקר?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline">
            כניסה לנסקרים
          </Link>
        </p>
      </div>
    </div>
  );
}
