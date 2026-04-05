import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/auth';
import { PRICING } from '../const/pricing';
import { setAuth, showToast } from '../store/signals';

// ─── types ────────────────────────────────────────────────────────────────────

interface PersonalFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName?: string;
  jobTitle?: string;
}

interface PlanFields {
  plan: 'monthly' | 'annual';
}

interface PaymentFields {
  cardholderName: string;
  cardNumber: string;      // full PAN — only last 4 sent to server
  expiryMonth: string;
  expiryYear: string;
  cvv: string;             // never sent to server
}

type Step = 'personal' | 'plan' | 'payment';

// ─── pricing ──────────────────────────────────────────────────────────────────

const PLANS = {
  monthly: { label: PRICING.monthly.label, priceLabel: `₪${PRICING.monthly.pricePerMonth} / חודש`, badge: null },
  annual:  { label: PRICING.annual.label,  priceLabel: `₪${PRICING.annual.pricePerMonth} / חודש`, badge: PRICING.annual.badge },
} as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

function detectCardType(num: string): 'visa' | 'mastercard' | 'amex' | 'other' {
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  return 'other';
}

function formatCardDisplay(raw: string) {
  return raw.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

const CARD_ICONS: Record<string, string> = {
  visa: '🟦',
  mastercard: '🔴',
  amex: '💚',
  other: '💳',
};

// ─── step indicator ────────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'personal', label: 'פרטים אישיים' },
    { key: 'plan',     label: 'בחירת תוכנית' },
    { key: 'payment',  label: 'פרטי תשלום' },
  ];
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i < idx
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : i === idx
                  ? 'bg-white border-indigo-600 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 ${i === idx ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-5 ${i < idx ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export default function SurveyorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('personal');
  const [personal, setPersonal] = useState<PersonalFields | null>(null);
  const [plan, setPlan] = useState<PlanFields['plan']>('monthly');
  const [loading, setLoading] = useState(false);

  // ── step 1: personal ──────────────────────────────────────────────────────

  const {
    register: rp, handleSubmit: hsp, watch: wp,
    formState: { errors: ep },
  } = useForm<PersonalFields>();

  const onPersonal = (data: PersonalFields) => {
    if (data.password !== data.confirmPassword) {
      showToast('הסיסמאות אינן תואמות', 'error');
      return;
    }
    setPersonal(data);
    setStep('plan');
  };

  // ── step 2: plan ─────────────────────────────────────────────────────────

  const onPlan = () => setStep('payment');

  // ── step 3: payment ───────────────────────────────────────────────────────

  const {
    register: rpay, handleSubmit: hspay, watch: wpay,
    formState: { errors: epay },
  } = useForm<PaymentFields>();

  const watchedCard = wpay('cardNumber') || '';
  const cardType = detectCardType(watchedCard.replace(/\D/g, ''));

  const onPayment = async (payData: PaymentFields) => {
    if (!personal) return;
    setLoading(true);
    try {
      const digits = payData.cardNumber.replace(/\D/g, '');
      const payload = {
        firstName: personal.firstName,
        lastName: personal.lastName,
        email: personal.email,
        password: personal.password,
        phone: personal.phone,
        companyName: personal.companyName,
        jobTitle: personal.jobTitle,
        subscription: { plan },
        payment: {
          cardLast4: digits.slice(-4),
          cardType,
          cardholderName: payData.cardholderName,
          expiryMonth: payData.expiryMonth,
          expiryYear: payData.expiryYear,
          // cvv is intentionally NOT sent
        },
      };
      const res = await authApi.surveyorRegister(payload);
      setAuth(res.data.token, res.data.user);
      showToast('ברוך הבא! הרישום הושלם בהצלחה', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בהרשמה', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4" dir="rtl">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="text-indigo-600 font-bold text-2xl">📊 מערכת סקרים</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">הרשמה לסוקר</h1>
          <p className="text-gray-500 mt-1">צור חשבון ובנה סקרים מקצועיים</p>
        </div>

        <StepBar current={step} />

        {/* ── STEP 1: Personal ── */}
        {step === 'personal' && (
          <form onSubmit={hsp(onPersonal)} className="card space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg border-b pb-2">פרטים אישיים</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">שם פרטי *</label>
                <input className="input" placeholder="ישראל"
                  {...rp('firstName', { required: 'שדה חובה' })} />
                {ep.firstName && <p className="text-red-500 text-xs mt-1">{ep.firstName.message}</p>}
              </div>
              <div>
                <label className="label">שם משפחה *</label>
                <input className="input" placeholder="ישראלי"
                  {...rp('lastName', { required: 'שדה חובה' })} />
                {ep.lastName && <p className="text-red-500 text-xs mt-1">{ep.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">אימייל *</label>
              <input className="input" type="email" placeholder="israel@example.com" dir="ltr"
                {...rp('email', {
                  required: 'שדה חובה',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' },
                })} />
              {ep.email && <p className="text-red-500 text-xs mt-1">{ep.email.message}</p>}
            </div>

            <div>
              <label className="label">טלפון *</label>
              <input className="input" placeholder="050-0000000" dir="ltr"
                {...rp('phone', {
                  required: 'שדה חובה',
                  pattern: { value: /^[\d\-\+\s]+$/, message: 'מספר טלפון לא תקין' },
                })} />
              {ep.phone && <p className="text-red-500 text-xs mt-1">{ep.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">סיסמה *</label>
                <input className="input" type="password" placeholder="לפחות 8 תווים"
                  {...rp('password', { required: 'שדה חובה', minLength: { value: 8, message: 'לפחות 8 תווים' } })} />
                {ep.password && <p className="text-red-500 text-xs mt-1">{ep.password.message}</p>}
              </div>
              <div>
                <label className="label">אימות סיסמה *</label>
                <input className="input" type="password" placeholder="הקלד שוב"
                  {...rp('confirmPassword', {
                    required: 'שדה חובה',
                    validate: (v) => v === wp('password') || 'הסיסמאות אינן תואמות',
                  })} />
                {ep.confirmPassword && <p className="text-red-500 text-xs mt-1">{ep.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">חברה / ארגון</label>
                <input className="input" placeholder="חברה בע״מ" {...rp('companyName')} />
              </div>
              <div>
                <label className="label">תפקיד</label>
                <input className="input" placeholder="מנהל מחקר" {...rp('jobTitle')} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3">
              המשך לבחירת תוכנית →
            </button>

            <p className="text-center text-sm text-gray-500">
              כבר יש לך חשבון?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">התחבר</Link>
            </p>
          </form>
        )}

        {/* ── STEP 2: Plan ── */}
        {step === 'plan' && (
          <div className="card space-y-6">
            <h2 className="font-semibold text-gray-800 text-lg border-b pb-2">בחר תוכנית</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['monthly', 'annual'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`relative p-5 rounded-xl border-2 text-right transition-all ${
                    plan === p
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  {PLANS[p].badge && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {PLANS[p].badge}
                    </span>
                  )}
                  <p className="font-bold text-gray-900 text-lg">{PLANS[p].label}</p>
                  <p className="text-indigo-700 font-semibold text-2xl mt-1">{PLANS[p].priceLabel}</p>
                  {p === 'annual' && (
                    <p className="text-gray-400 text-xs mt-1">{PRICING.annual.billingNote} — ₪{PRICING.annual.pricePerYear.toLocaleString()} / שנה</p>
                  )}
                  {p === 'monthly' && (
                    <p className="text-gray-400 text-xs mt-1">{PRICING.monthly.billingNote}</p>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 mt-3 flex items-center justify-center ${
                    plan === p ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {plan === p && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1.5">
              <p className="font-semibold text-gray-800 mb-2">כל התוכניות כוללות:</p>
              {['סקרים ללא הגבלה', 'עד 1,000 מוענים לסקר', 'ניתוחים וסטטיסטיקות', 'תמיכה בדוא"ל'].map((f) => (
                <p key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('personal')} className="btn-secondary flex-1 py-3">
                → חזור
              </button>
              <button type="button" onClick={onPlan} className="btn-primary flex-1 py-3">
                המשך לתשלום ←
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 'payment' && (
          <form onSubmit={hspay(onPayment)} className="card space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg border-b pb-2">פרטי תשלום</h2>

            {/* Order summary */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-indigo-900">תוכנית {PLANS[plan].label}</p>
                <p className="text-indigo-600 text-xs mt-0.5">
                  {plan === 'annual' ? `${PRICING.annual.billingNote} ₪${PRICING.annual.pricePerYear.toLocaleString()}` : PRICING.monthly.billingNote}
                </p>
              </div>
              <p className="text-2xl font-bold text-indigo-700">{PLANS[plan].priceLabel}</p>
            </div>

            {/* Card preview */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg select-none">
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm opacity-75">כרטיס אשראי</span>
                <span className="text-2xl">{CARD_ICONS[cardType]}</span>
              </div>
              <p className="font-mono text-xl tracking-widest mb-4">
                {watchedCard.replace(/\D/g, '')
                  ? formatCardDisplay(watchedCard)
                  : '•••• •••• •••• ••••'}
              </p>
              <div className="flex justify-between text-sm">
                <span>{wpay('cardholderName') || 'שם בעל הכרטיס'}</span>
                <span>
                  {wpay('expiryMonth') && wpay('expiryYear')
                    ? `${wpay('expiryMonth')}/${wpay('expiryYear')?.slice(-2)}`
                    : 'MM/YY'}
                </span>
              </div>
            </div>

            <div>
              <label className="label">שם בעל הכרטיס *</label>
              <input className="input" placeholder="ISRAEL ISRAELSON" dir="ltr"
                {...rpay('cardholderName', { required: 'שדה חובה' })} />
              {epay.cardholderName && <p className="text-red-500 text-xs mt-1">{epay.cardholderName.message}</p>}
            </div>

            <div>
              <label className="label">מספר כרטיס *</label>
              <div className="relative">
                <input
                  className="input font-mono tracking-widest pl-10"
                  placeholder="0000 0000 0000 0000"
                  dir="ltr"
                  maxLength={19}
                  {...rpay('cardNumber', {
                    required: 'שדה חובה',
                    validate: (v) =>
                      v.replace(/\D/g, '').length >= 13 || 'מספר כרטיס לא תקין',
                    onChange: (e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                      e.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
                    },
                  })}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {CARD_ICONS[cardType]}
                </span>
              </div>
              {epay.cardNumber && <p className="text-red-500 text-xs mt-1">{epay.cardNumber.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">חודש פקיעה *</label>
                <select className="input" dir="ltr"
                  {...rpay('expiryMonth', { required: 'שדה חובה' })}>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {epay.expiryMonth && <p className="text-red-500 text-xs mt-1">{epay.expiryMonth.message}</p>}
              </div>
              <div>
                <label className="label">שנת פקיעה *</label>
                <select className="input" dir="ltr"
                  {...rpay('expiryYear', { required: 'שדה חובה' })}>
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {epay.expiryYear && <p className="text-red-500 text-xs mt-1">{epay.expiryYear.message}</p>}
              </div>
              <div>
                <label className="label">CVV *</label>
                <input className="input font-mono" placeholder="•••" dir="ltr" maxLength={4}
                  type="password"
                  {...rpay('cvv', {
                    required: 'שדה חובה',
                    pattern: { value: /^\d{3,4}$/, message: '3-4 ספרות' },
                  })} />
                {epay.cvv && <p className="text-red-500 text-xs mt-1">{epay.cvv.message}</p>}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              🔒 הפרטים מוצפנים ומאובטחים — מספר הכרטיס המלא אינו נשמר בשרת
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('plan')} className="btn-secondary flex-1 py-3">
                → חזור
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 font-semibold">
                {loading ? 'מעבד...' : `💳 השלם רישום — ${PLANS[plan].priceLabel}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
