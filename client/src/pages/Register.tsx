import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/auth';
import { setAuth, showToast } from '../store/signals';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  companyName: string;
  jobTitle: string;
  role: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { country: 'ישראל', role: 'surveyed' } });

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      showToast('הסיסמאות אינן תואמות', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        role: data.role,
      });
      setAuth(res.data.token, res.data.user);
      showToast('נרשמת בהצלחה!', 'success');
      navigate('/my-surveys');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בהרשמה', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-indigo-600 font-bold text-2xl">📊 מערכת סקרים</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">יצירת חשבון חדש</h1>
          <p className="text-gray-500 mt-1">מלא את הפרטים הבאים להרשמה למערכת</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {/* Personal Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">פרטים אישיים</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">שם פרטי *</label>
                <input className="input" placeholder="ישראל" {...register('firstName', { required: 'שדה חובה' })} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">שם משפחה *</label>
                <input className="input" placeholder="ישראלי" {...register('lastName', { required: 'שדה חובה' })} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="label">אימייל *</label>
                <input className="input" type="email" placeholder="israel@example.com"
                  {...register('email', { required: 'שדה חובה', pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' } })} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">טלפון נייד *</label>
                <input className="input" placeholder="050-0000000" dir="ltr"
                  {...register('phone', { required: 'שדה חובה', pattern: { value: /^[\d\-\+\s]+$/, message: 'מספר טלפון לא תקין' } })} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="label">סיסמה *</label>
                <input className="input" type="password" placeholder="לפחות 8 תווים"
                  {...register('password', { required: 'שדה חובה', minLength: { value: 8, message: 'לפחות 8 תווים' } })} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">אימות סיסמה *</label>
                <input className="input" type="password" placeholder="הקלד שוב את הסיסמה"
                  {...register('confirmPassword', { required: 'שדה חובה' })} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">כתובת מגורים</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">רחוב ומספר בית</label>
                <input className="input" placeholder="רחוב הרצל 1" {...register('street')} />
              </div>
              <div>
                <label className="label">עיר</label>
                <input className="input" placeholder="תל אביב" {...register('city')} />
              </div>
              <div>
                <label className="label">מחוז / אזור</label>
                <input className="input" placeholder="מחוז תל אביב" {...register('state')} />
              </div>
              <div>
                <label className="label">מיקוד</label>
                <input className="input" placeholder="6100000" dir="ltr" {...register('zipCode')} />
              </div>
              <div>
                <label className="label">מדינה</label>
                <input className="input" {...register('country')} />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">פרטים מקצועיים (אופציונלי)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">שם חברה / ארגון</label>
                <input className="input" placeholder="חברה בע״מ" {...register('companyName')} />
              </div>
              <div>
                <label className="label">תפקיד</label>
                <input className="input" placeholder="מנהל מחקר" {...register('jobTitle')} />
              </div>
              <div>
                <label className="label">סוג משתמש</label>
                <select className="input" {...register('role')}>
                  <option value="surveyed">נסקר (ממלא סקרים)</option>
                  <option value="surveyor">סוקר (יוצר סקרים)</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'נרשם...' : 'הרשמה'}
          </button>

          <p className="text-center text-sm text-gray-500">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              התחבר כאן
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
