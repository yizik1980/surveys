import { signal, computed } from '@preact/signals-react';

// ---------- Types ----------
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'surveyor' | 'surveyed';
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  companyName?: string;
  jobTitle?: string;
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating' | 'date';
  text: string;
  options: string[];
  required: boolean;
  placeholder?: string;
  minRating?: number;
  maxRating?: number;
}

export interface Survey {
  _id: string;
  title: string;
  description?: string;
  creator: { _id: string; firstName: string; lastName: string; email: string } | string;
  questions: Question[];
  assignedUsers: AssignedUser[];
  status: 'draft' | 'active' | 'closed';
  category?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AssignedUser {
  email: string;
  name?: string;
  token: string;
  status: 'pending' | 'sent' | 'responded';
  sentAt?: string;
  respondedAt?: string;
}

// ---------- Auth Signals ----------
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const authToken = signal<string | null>(storedToken);
export const currentUser = signal<User | null>(
  storedUser ? JSON.parse(storedUser) : null,
);
export const authLoading = signal(false);

export const isAuthenticated = computed(() => !!authToken.value);
export const isAdmin = computed(() => currentUser.value?.role === 'admin');
export const isSurveyor = computed(
  () =>
    currentUser.value?.role === 'surveyor' ||
    currentUser.value?.role === 'admin',
);

export function setAuth(token: string, user: User) {
  authToken.value = token;
  currentUser.value = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  authToken.value = null;
  currentUser.value = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ---------- Surveys Signals ----------
export const surveys = signal<Survey[]>([]);
export const surveysLoading = signal(false);
export const surveysError = signal<string | null>(null);

export const activeSurveys = computed(() =>
  surveys.value.filter((s) => s.status === 'active'),
);
export const draftSurveys = computed(() =>
  surveys.value.filter((s) => s.status === 'draft'),
);

// ---------- Current Survey (Builder) ----------
export const currentSurvey = signal<Partial<Survey> | null>(null);
export const surveyBuilderDirty = signal(false);

export function initNewSurvey() {
  currentSurvey.value = {
    title: '',
    description: '',
    questions: [],
    status: 'draft',
    category: '',
  };
  surveyBuilderDirty.value = false;
}

export function addQuestion(q: Question) {
  if (!currentSurvey.value) return;
  currentSurvey.value = {
    ...currentSurvey.value,
    questions: [...(currentSurvey.value.questions || []), q],
  };
  surveyBuilderDirty.value = true;
}

export function updateQuestion(id: string, updated: Partial<Question>) {
  if (!currentSurvey.value) return;
  currentSurvey.value = {
    ...currentSurvey.value,
    questions: currentSurvey.value.questions!.map((q) =>
      q.id === id ? { ...q, ...updated } : q,
    ),
  };
  surveyBuilderDirty.value = true;
}

export function removeQuestion(id: string) {
  if (!currentSurvey.value) return;
  currentSurvey.value = {
    ...currentSurvey.value,
    questions: currentSurvey.value.questions!.filter((q) => q.id !== id),
  };
  surveyBuilderDirty.value = true;
}

export function reorderQuestions(questions: Question[]) {
  if (!currentSurvey.value) return;
  currentSurvey.value = { ...currentSurvey.value, questions };
  surveyBuilderDirty.value = true;
}

// ---------- UI Signals ----------
export const sidebarOpen = signal(true);
export const toastMessage = signal<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  toastMessage.value = { text, type };
  setTimeout(() => {
    toastMessage.value = null;
  }, 3500);
}
