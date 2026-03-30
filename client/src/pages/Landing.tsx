import { Link } from 'react-router-dom';

const features = [
  {
    icon: '📝',
    title: 'בנה סקרים בקלות',
    desc: 'ממשק גרור ושחרר לבניית שאלות מסוגים שונים — רב ברירה, דירוג, טקסט חופשי ועוד.',
  },
  {
    icon: '📧',
    title: 'שלח במייל בלחיצה אחת',
    desc: 'שייך סקר לרשימת מוענים ושלח הזמנה אוטומטית עם קישור ייחודי לכל אחד.',
  },
  {
    icon: '📊',
    title: 'ניתוח תוצאות מיידי',
    desc: 'צפה בסטטיסטיקות, גרפים ותשובות בזמן אמת ברגע שהמשיבים משלימים את הסקר.',
  },
  {
    icon: '👥',
    title: 'ניהול משתמשים ותפקידים',
    desc: 'מנהלים, סוקרים ונסקרים — כל אחד עם גישה מותאמת אישית.',
  },
  {
    icon: '🔒',
    title: 'אבטחה מלאה',
    desc: 'כל קישור סקר מאובטח עם טוקן ייחודי. הגנה מפני מענה כפול.',
  },
  {
    icon: '📱',
    title: 'מותאם לכל מכשיר',
    desc: 'ממשק רספונסיבי שעובד מצוין על מחשב, טאבלט וסמארטפון.',
  },
];

const steps = [
  { n: '1', title: 'הרשם למערכת', desc: 'צור חשבון חינמי תוך דקות.' },
  { n: '2', title: 'בנה את הסקר', desc: 'הוסף שאלות ממגוון סוגים והגדר הגדרות.' },
  { n: '3', title: 'שלח לנסקרים', desc: 'הזן כתובות מייל ושלח הזמנות אוטומטיות.' },
  { n: '4', title: 'נתח תוצאות', desc: 'קבל תובנות ונתונים בזמן אמת.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl">📊 מערכת סקרים</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-indigo-200 hover:text-white text-sm font-medium">
              התחברות
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              הרשמה חינמית
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            בנה, שלח ונתח סקרים
            <br />
            <span className="text-yellow-300">בקלות ובמהירות</span>
          </h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            פלטפורמת ניהול סקרים מתקדמת לעסקים וארגונים. צור סקרים מקצועיים,
            שלח למוענים ממוקדים וקבל תוצאות בזמן אמת.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
            >
              התחל בחינם עכשיו
            </Link>
            <Link
              to="/login"
              className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition-colors"
            >
              כניסה למערכת
            </Link>
          </div>
        </div>
      </section>

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

      {/* How it works */}
      <section className="py-20 bg-white">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            מוכן להתחיל?
          </h2>
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
