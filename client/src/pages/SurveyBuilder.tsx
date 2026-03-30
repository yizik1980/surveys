import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import {
  currentSurvey, initNewSurvey, addQuestion, updateQuestion,
  removeQuestion, reorderQuestions, surveyBuilderDirty, showToast,
} from '../store/signals';
import { surveysApi } from '../api/surveys';
import type { Question } from '../store/signals';

const QUESTION_TYPES = [
  { value: 'text', label: 'שדה טקסט קצר' },
  { value: 'textarea', label: 'שדה טקסט ארוך' },
  { value: 'radio', label: 'בחירה יחידה' },
  { value: 'checkbox', label: 'בחירה מרובה' },
  { value: 'select', label: 'רשימה נפתחת' },
  { value: 'rating', label: 'דירוג (1-5)' },
  { value: 'date', label: 'תאריך' },
];

function newQuestion(): Question {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'text',
    text: '',
    options: [],
    required: false,
  };
}

export default function SurveyBuilder() {
  useSignals();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeQIdx, setActiveQIdx] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      surveysApi.getById(id).then((res) => {
        currentSurvey.value = res.data;
      });
    } else {
      initNewSurvey();
    }
  }, [id]);

  const survey = currentSurvey.value;
  if (!survey) return <div className="p-8 text-center text-gray-400">טוען...</div>;

  const questions = survey.questions || [];

  const handleSave = async (status?: string) => {
    if (!survey.title?.trim()) {
      showToast('יש להזין כותרת לסקר', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...survey, status: status || survey.status };
      if (id) {
        await surveysApi.update(id, payload);
      } else {
        await surveysApi.create(payload);
      }
      surveyBuilderDirty.value = false;
      showToast('הסקר נשמר בהצלחה', 'success');
      navigate('/surveys');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בשמירה', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const q = newQuestion();
    addQuestion(q);
    setActiveQIdx(questions.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'עריכת סקר' : 'סקר חדש'}
          </h1>
          {surveyBuilderDirty.value && (
            <span className="text-xs text-orange-500 font-medium">● שינויים לא שמורים</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/surveys')} className="btn-secondary">
            ביטול
          </button>
          <button onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary">
            שמור טיוטה
          </button>
          <button onClick={() => handleSave('active')} disabled={saving} className="btn-primary">
            {saving ? 'שומר...' : 'פרסם סקר'}
          </button>
        </div>
      </div>

      {/* Survey Meta */}
      <div className="card mb-6 space-y-4">
        <div>
          <label className="label">כותרת הסקר *</label>
          <input
            className="input text-lg font-medium"
            placeholder="למשל: סקר שביעות רצון לקוחות 2025"
            value={survey.title || ''}
            onChange={(e) => { currentSurvey.value = { ...survey, title: e.target.value }; surveyBuilderDirty.value = true; }}
          />
        </div>
        <div>
          <label className="label">תיאור הסקר</label>
          <textarea
            className="input"
            rows={2}
            placeholder="תיאור קצר שיוצג למשיבים..."
            value={survey.description || ''}
            onChange={(e) => { currentSurvey.value = { ...survey, description: e.target.value }; surveyBuilderDirty.value = true; }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">קטגוריה</label>
            <select
              className="input"
              value={survey.category || ''}
              onChange={(e) => { currentSurvey.value = { ...survey, category: e.target.value }; surveyBuilderDirty.value = true; }}
            >
              <option value="">בחר קטגוריה</option>
              <option value="satisfaction">שביעות רצון</option>
              <option value="research">מחקר שוק</option>
              <option value="hr">משאבי אנוש</option>
              <option value="feedback">פידבק</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div>
            <label className="label">תוקף הסקר</label>
            <input
              className="input"
              type="date"
              value={survey.expiresAt ? new Date(survey.expiresAt).toISOString().split('T')[0] : ''}
              onChange={(e) => { currentSurvey.value = { ...survey, expiresAt: e.target.value }; surveyBuilderDirty.value = true; }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {questions.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">❓</p>
            <p className="text-lg font-medium">אין שאלות עדיין</p>
            <p className="text-sm">לחץ על "הוסף שאלה" להתחלה</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              isActive={activeQIdx === idx}
              onActivate={() => setActiveQIdx(activeQIdx === idx ? null : idx)}
              onUpdate={(updated) => updateQuestion(q.id, updated)}
              onRemove={() => {
                removeQuestion(q.id);
                setActiveQIdx(null);
              }}
              canMoveUp={idx > 0}
              canMoveDown={idx < questions.length - 1}
              onMoveUp={() => {
                const qs = [...questions];
                [qs[idx - 1], qs[idx]] = [qs[idx], qs[idx - 1]];
                reorderQuestions(qs);
                setActiveQIdx(idx - 1);
              }}
              onMoveDown={() => {
                const qs = [...questions];
                [qs[idx], qs[idx + 1]] = [qs[idx + 1], qs[idx]];
                reorderQuestions(qs);
                setActiveQIdx(idx + 1);
              }}
            />
          ))
        )}
      </div>

      <button
        onClick={handleAddQuestion}
        className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium"
      >
        ➕ הוסף שאלה
      </button>
    </div>
  );
}

function QuestionCard({
  question, index, isActive, onActivate, onUpdate, onRemove,
  canMoveUp, canMoveDown, onMoveUp, onMoveDown,
}: {
  question: Question; index: number; isActive: boolean;
  onActivate: () => void; onUpdate: (u: Partial<Question>) => void; onRemove: () => void;
  canMoveUp: boolean; canMoveDown: boolean; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const hasOptions = ['radio', 'checkbox', 'select'].includes(question.type);

  return (
    <div className={`card border-2 transition-all ${isActive ? 'border-indigo-400' : 'border-gray-200 hover:border-gray-300'}`}>
      {/* Question header */}
      <div className="flex items-start gap-3" onClick={onActivate} style={{ cursor: 'pointer' }}>
        <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {question.text || <span className="text-gray-400 italic">שאלה ריקה</span>}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
            {question.required && ' • חובה'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {canMoveUp && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 text-gray-400 hover:text-gray-600">↑</button>}
          {canMoveDown && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 text-gray-400 hover:text-gray-600">↓</button>}
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600 mr-1">🗑</button>
        </div>
      </div>

      {/* Expanded editor */}
      {isActive && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <label className="label">טקסט השאלה</label>
            <input
              className="input"
              placeholder="הקלד את השאלה..."
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">סוג שאלה</label>
              <select
                className="input"
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as Question['type'], options: [] })}
                onClick={(e) => e.stopPropagation()}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">שאלת חובה</span>
              </label>
            </div>
          </div>

          {question.type === 'text' || question.type === 'textarea' ? (
            <div>
              <label className="label">טקסט מקום שמור (placeholder)</label>
              <input
                className="input"
                placeholder="טקסט רמז לשדה..."
                value={question.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : null}

          {question.type === 'rating' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">מינימום</label>
                <input
                  type="number" className="input" value={question.minRating ?? 1}
                  onChange={(e) => onUpdate({ minRating: +e.target.value })}
                />
              </div>
              <div>
                <label className="label">מקסימום</label>
                <input
                  type="number" className="input" value={question.maxRating ?? 5}
                  onChange={(e) => onUpdate({ maxRating: +e.target.value })}
                />
              </div>
            </div>
          )}

          {hasOptions && (
            <div>
              <label className="label">אפשרויות (אחת בכל שורה)</label>
              <textarea
                className="input"
                rows={4}
                placeholder="אפשרות א&#10;אפשרות ב&#10;אפשרות ג"
                value={question.options.join('\n')}
                onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(Boolean) })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
