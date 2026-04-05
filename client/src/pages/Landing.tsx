import { Link } from 'react-router-dom';
import { PRICING } from '../const/pricing';
import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    tag: 'מחקר שוק',
    title: 'הבן את הלקוחות שלך',
    desc: 'קבל תובנות עמוקות על הצרכים, הציפיות והחוויות של הלקוחות שלך בזמן אמת.',
    accent: 'from-indigo-600 to-purple-700',
    icon: '🎯',
    stat: { n: '10K+', label: 'סקרים פעילים' },
  },
  {
    tag: 'משאבי אנוש',
    title: 'מדוד שביעות רצון עובדים',
    desc: 'סקרי Pulse אנונימיים שעוזרים לך לזהות בעיות ולשפר את סביבת העבודה.',
    accent: 'from-violet-600 to-indigo-700',
    icon: '👥',
    stat: { n: '500+', label: 'ארגונים פעילים' },
  },
  {
    tag: 'פידבק מוצר',
    title: 'שפר את המוצר שלך',
    desc: 'אסוף משוב מדויק ממשתמשים ולקוחות ותרגם אותו לשיפורים קונקרטיים.',
    accent: 'from-blue-600 to-indigo-700',
    icon: '🚀',
    stat: { n: '98%', label: 'שביעות רצון' },
  },
  {
    tag: 'אירועים',
    title: 'הצלח כל אירוע',
    desc: 'שאלוני רישום, משוב אחרי האירוע וסקרי ציפיות — הכל במקום אחד.',
    accent: 'from-purple-600 to-pink-600',
    icon: '🎉',
    stat: { n: '2M+', label: 'תשובות נאספו' },
  },
];

const features = [
  { icon: '📝', title: 'בנה סקרים בקלות', desc: 'ממשק גרור ושחרר לבניית שאלות מסוגים שונים — רב ברירה, דירוג, טקסט חופשי ועוד.' },
  { icon: '📧', title: 'שלח במייל בלחיצה אחת', desc: 'שייך סקר לרשימת מוענים ושלח הזמנה אוטומטית עם קישור ייחודי לכל אחד.' },
  { icon: '📊', title: 'ניתוח תוצאות מיידי', desc: 'צפה בסטטיסטיקות, גרפים ותשובות בזמן אמת ברגע שהמשיבים משלימים את הסקר.' },
  { icon: '👥', title: 'ניהול משתמשים ותפקידים', desc: 'מנהלים, סוקרים ונסקרים — כל אחד עם גישה מותאמת אישית.' },
  { icon: '🔒', title: 'אבטחה מלאה', desc: 'כל קישור סקר מאובטח עם טוקן ייחודי. הגנה מפני מענה כפול.' },
  { icon: '📱', title: 'מותאם לכל מכשיר', desc: 'ממשק רספונסיבי שעובד מצוין על מחשב, טאבלט וסמארטפון.' },
];

const steps = [
  { n: '1', title: 'הרשם למערכת', desc: 'צור חשבון חינמי תוך דקות.' },
  { n: '2', title: 'בנה את הסקר', desc: 'הוסף שאלות ממגוון סוגים והגדר הגדרות.' },
  { n: '3', title: 'שלח לנסקרים', desc: 'הזן כתובות מייל ושלח הזמנות אוטומטיות.' },
  { n: '4', title: 'נתח תוצאות', desc: 'קבל תובנות ונתונים בזמן אמת.' },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className={`relative bg-gradient-to-br ${slide.accent} text-white overflow-hidden transition-all duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div
            key={current}
            className={`transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/30">
              {slide.tag}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {slide.title}
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              {slide.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register/surveyor"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg text-center"
              >
                הרשם כסוקר עכשיו
              </Link>
              <Link
                to="/login"
                className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition-colors text-center"
              >
                כניסה לסוקרים
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div
            key={`card-${current}`}
            className={`transition-all duration-500 delay-100 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-7xl mb-6 text-center">{slide.icon}</div>

              {/* Mock survey UI */}
              <div className="bg-white/10 rounded-2xl p-5 mb-4 space-y-3">
                <div className="h-3 bg-white/40 rounded-full w-3/4" />
                <div className="h-2 bg-white/25 rounded-full w-full" />
                <div className="h-2 bg-white/25 rounded-full w-5/6" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {['אפשרות א', 'אפשרות ב', 'אפשרות ג', 'אפשרות ד'].map((o) => (
                    <div key={o} className="bg-white/20 rounded-lg px-3 py-2 text-xs text-white/80 text-center">
                      {o}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat badge */}
              <div className="flex items-center justify-between bg-white/15 rounded-xl px-5 py-3">
                <span className="text-white/70 text-sm">{slide.stat.label}</span>
                <span className="text-2xl font-bold text-yellow-300">{slide.stat.n}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
        {/* Prev */}
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-colors"
          aria-label="הקודם"
        >
          ‹
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current ? 'w-8 h-2.5 bg-yellow-400' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`שקופית ${i + 1}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-colors"
          aria-label="הבא"
        >
          ›
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={`progress-${current}`}
          className="h-full bg-yellow-400 origin-left"
          style={{
            animation: paused ? 'none' : 'slideProgress 5s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">📊 מערכת סקרים</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-indigo-200 hover:text-white text-sm font-medium">
              כניסה לסוקרים
            </Link>
            <Link
              to="/register/surveyor"
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              הרשמה כסוקר
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            כל מה שצריך לסקר מוצלח
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            כלים מתקדמים שמפשטים את תהליך יצירת וניהול הסקרים
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">תמחור פשוט ושקוף</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">כל התכונות כלולות — ללא עמלות נסתרות</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-colors">
              <p className="font-bold text-gray-900 text-xl mb-1">חודשי</p>
              <p className="text-gray-400 text-sm mb-6">{PRICING.monthly.billingNote}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">₪{PRICING.monthly.pricePerMonth}</span>
                <span className="text-gray-400 text-sm"> / חודש</span>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {['סקרים ללא הגבלה', 'עד 1,000 מוענים לסקר', 'ניתוחים וסטטיסטיקות', 'תמיכה בדוא"ל'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register/surveyor"
                className="block text-center bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                התחל עכשיו
              </Link>
            </div>

            {/* Annual */}
            <div className="border-2 border-indigo-600 rounded-2xl p-8 relative bg-indigo-50">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                הכי פופולרי — חסכון 25%
              </span>
              <p className="font-bold text-gray-900 text-xl mb-1">שנתי</p>
              <p className="text-gray-400 text-sm mb-6">{PRICING.annual.billingNote} — ₪{PRICING.annual.pricePerYear.toLocaleString()} / שנה</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-indigo-700">₪{PRICING.annual.pricePerMonth}</span>
                <span className="text-gray-400 text-sm"> / חודש</span>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {['סקרים ללא הגבלה', 'עד 1,000 מוענים לסקר', 'ניתוחים וסטטיסטיקות', 'תמיכה בדוא"ל + טלפון'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register/surveyor"
                className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                התחל עכשיו
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            איך זה עובד?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: '10,000+', label: 'סקרים נוצרו' },
              { n: '500+', label: 'ארגונים פעילים' },
              { n: '98%', label: 'שביעות רצון לקוחות' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-yellow-300 mb-2">{s.n}</div>
                <div className="text-indigo-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">מוכן להתחיל?</h2>
          <p className="text-gray-500 mb-8 text-lg">
            הצטרף לאלפי ארגונים שכבר משתמשים במערכת הסקרים שלנו.
          </p>
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-colors inline-block shadow-lg"
          >
            הרשמה חינמית — ללא כרטיס אשראי
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>© 2025 מערכת סקרים. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
