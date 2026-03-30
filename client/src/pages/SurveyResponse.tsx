import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { surveysApi } from '../api/surveys';
import type { Survey, Question } from '../store/signals';

type AnswerMap = Record<string, any>;

export default function SurveyResponse() {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    surveysApi
      .getByToken(token)
      .then((res) => {
        setSurvey(res.data.survey);
        setRecipientName(res.data.assignment?.name || '');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'קישור הסקר אינו תקף');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const setAnswer = (qId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setValidationErrors((prev) => ({ ...prev, [qId]: '' }));
  };

  const toggleCheckbox = (qId: string, option: string) => {
    const current: string[] = answers[qId] || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(qId, next);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const q of survey?.questions || []) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          errs[q.id] = 'שאלה זו היא חובה';
        }
      }
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const answersList = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await surveysApi.submitResponse(token!, answersList);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בשליחה');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">טוען סקר...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full card text-center py-12">
          <p className="text-5xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">שגיאה</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 to-indigo-50" dir="rtl">
        <div className="max-w-md w-full card text-center py-14">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">תודה רבה!</h2>
          <p className="text-gray-500 text-lg">תשובותיך נשמרו בהצלחה.</p>
          {recipientName && (
            <p className="text-gray-400 mt-2 text-sm">{recipientName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-indigo-600 font-bold text-xl">📊 מערכת סקרים</span>
        </div>

        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey?.title}</h1>
          {survey?.description && (
            <p className="text-gray-500">{survey.description}</p>
          )}
          {recipientName && (
            <p className="text-sm text-indigo-600 mt-2 font-medium">שלום, {recipientName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {survey?.questions?.map((q, idx) => (
            <QuestionField
              key={q.id}
              question={q}
              index={idx}
              value={answers[q.id]}
              error={validationErrors[q.id]}
              onAnswer={(val) => setAnswer(q.id, val)}
              onToggleCheckbox={(opt) => toggleCheckbox(q.id, opt)}
            />
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-4 text-base font-semibold"
          >
            {submitting ? 'שולח...' : 'שלח תשובות'}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuestionField({
  question, index, value, error, onAnswer, onToggleCheckbox,
}: {
  question: Question; index: number; value: any; error?: string;
  onAnswer: (v: any) => void; onToggleCheckbox: (opt: string) => void;
}) {
  return (
    <div className={`card ${error ? 'border border-red-300' : ''}`}>
      <p className="font-semibold text-gray-900 mb-3">
        <span className="text-indigo-500 ml-1">{index + 1}.</span>
        {question.text}
        {question.required && <span className="text-red-500 mr-1">*</span>}
      </p>

      {question.type === 'text' && (
        <input
          className="input"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}

      {question.type === 'textarea' && (
        <textarea
          className="input"
          rows={4}
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}

      {question.type === 'radio' && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={() => onAnswer(opt)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'checkbox' && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(value || []).includes(opt)}
                onChange={() => onToggleCheckbox(opt)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'select' && (
        <select
          className="input"
          value={value || ''}
          onChange={(e) => onAnswer(e.target.value)}
        >
          <option value="">-- בחר אפשרות --</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {question.type === 'rating' && (
        <div className="flex gap-3 flex-wrap">
          {Array.from(
            { length: (question.maxRating || 5) - (question.minRating || 1) + 1 },
            (_, i) => i + (question.minRating || 1),
          ).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onAnswer(n)}
              className={`w-11 h-11 rounded-lg border-2 font-bold text-sm transition-all ${
                value === n
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === 'date' && (
        <input
          type="date"
          className="input"
          value={value || ''}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
