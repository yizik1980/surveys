import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../api/auth', () => ({
  authApi: { register: vi.fn() },
}));

vi.mock('../store/signals', () => ({
  setAuth: vi.fn(),
  showToast: vi.fn(),
}));

import { authApi } from '../api/auth';
import { setAuth, showToast } from '../store/signals';

const mockRegister = vi.mocked(authApi.register);
const mockSetAuth = vi.mocked(setAuth);
const mockShowToast = vi.mocked(showToast);

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
}

// Fill all required fields using placeholder text (labels lack `for` attr)
async function fillRequiredFields(overrides: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  const v = {
    firstName: 'ישראל',
    lastName: 'ישראלי',
    email: 'israel@example.com',
    phone: '050-1234567',
    password: 'password123',
    confirmPassword: 'password123',
    ...overrides,
  };

  await userEvent.type(screen.getByPlaceholderText('ישראל'), v.firstName);
  await userEvent.type(screen.getByPlaceholderText('ישראלי'), v.lastName);
  await userEvent.type(screen.getByPlaceholderText('israel@example.com'), v.email);
  await userEvent.type(screen.getByPlaceholderText('050-0000000'), v.phone);
  await userEvent.type(screen.getByPlaceholderText('לפחות 8 תווים'), v.password);
  await userEvent.type(screen.getByPlaceholderText('הקלד שוב את הסיסמה'), v.confirmPassword);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => vi.clearAllMocks());

describe('Register page', () => {
  // Rendering
  describe('rendering', () => {
    it('renders the page heading', () => {
      renderRegister();
      expect(screen.getByText('יצירת חשבון חדש')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
      renderRegister();
      expect(screen.getByText('פרטים אישיים')).toBeInTheDocument();
      expect(screen.getByText('כתובת מגורים')).toBeInTheDocument();
      expect(screen.getByText(/פרטים מקצועיים/)).toBeInTheDocument();
    });

    it('renders all required field labels', () => {
      renderRegister();
      expect(screen.getByText('שם פרטי *')).toBeInTheDocument();
      expect(screen.getByText('שם משפחה *')).toBeInTheDocument();
      expect(screen.getByText('אימייל *')).toBeInTheDocument();
      expect(screen.getByText('טלפון נייד *')).toBeInTheDocument();
      expect(screen.getByText('סיסמה *')).toBeInTheDocument();
      expect(screen.getByText('אימות סיסמה *')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      renderRegister();
      expect(screen.getByRole('button', { name: 'הרשמה' })).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
      renderRegister();
      expect(screen.getByRole('link', { name: 'התחבר כאן' })).toHaveAttribute('href', '/login');
    });

    it('defaults role select to "surveyed"', () => {
      renderRegister();
      expect(screen.getByRole('combobox')).toHaveValue('surveyed');
    });

    it('defaults country field to ישראל', () => {
      renderRegister();
      expect(screen.getByDisplayValue('ישראל')).toBeInTheDocument();
    });
  });

  // Validation
  describe('validation', () => {
    it('shows required errors when submitting empty form', async () => {
      renderRegister();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        const errors = screen.getAllByText('שדה חובה');
        expect(errors.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('shows email format error for invalid email', async () => {
      renderRegister();
      // 'test@test' passes native HTML5 email validation (has @) but fails
      // the custom /^\S+@\S+\.\S+$/ pattern (no dot in domain)
      await userEvent.type(screen.getByPlaceholderText('israel@example.com'), 'test@test');
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(screen.getByText('אימייל לא תקין')).toBeInTheDocument();
      });
    });

    it('shows password length error when password is shorter than 8 chars', async () => {
      renderRegister();
      await userEvent.type(screen.getByPlaceholderText('לפחות 8 תווים'), 'short');
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(screen.getByText('לפחות 8 תווים')).toBeInTheDocument();
      });
    });

    it('shows phone format error for non-numeric phone', async () => {
      renderRegister();
      await userEvent.type(screen.getByPlaceholderText('050-0000000'), 'abc-def');
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(screen.getByText('מספר טלפון לא תקין')).toBeInTheDocument();
      });
    });

    it('shows toast error when passwords do not match', async () => {
      renderRegister();
      await fillRequiredFields({ confirmPassword: 'differentpass' });
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('הסיסמאות אינן תואמות', 'error');
      });
    });

    it('does not call API when passwords do not match', async () => {
      renderRegister();
      await fillRequiredFields({ confirmPassword: 'differentpass' });
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });
  });

  // Successful submission
  describe('successful submission', () => {
    beforeEach(() => {
      mockRegister.mockResolvedValue({
        data: { token: 'test-token', user: { id: '1', firstName: 'ישראל', role: 'surveyed' } },
      } as any);
    });

    it('calls authApi.register with correct payload', async () => {
      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'ישראל',
            lastName: 'ישראלי',
            email: 'israel@example.com',
            password: 'password123',
            phone: '050-1234567',
          }),
        );
      });
    });

    it('calls setAuth with token and user from response', async () => {
      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockSetAuth).toHaveBeenCalledWith('test-token', expect.objectContaining({ id: '1' }));
      });
    });

    it('shows success toast after registration', async () => {
      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('נרשמת בהצלחה!', 'success');
      });
    });

    it('navigates to /dashboard after successful registration', async () => {
      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  // Failed submission
  describe('failed submission', () => {
    it('shows error toast from API response message', async () => {
      mockRegister.mockRejectedValue({
        response: { data: { message: 'כתובת המייל כבר קיימת במערכת' } },
      });

      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('כתובת המייל כבר קיימת במערכת', 'error');
      });
    });

    it('shows fallback error toast when API response has no message', async () => {
      mockRegister.mockRejectedValue({});

      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('שגיאה בהרשמה', 'error');
      });
    });

    it('does not navigate on failure', async () => {
      mockRegister.mockRejectedValue({ response: { data: { message: 'שגיאה' } } });

      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  // Loading state
  describe('loading state', () => {
    it('disables submit button and shows loading text while submitting', async () => {
      mockRegister.mockImplementation(() => new Promise(() => {})); // never resolves

      renderRegister();
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: 'הרשמה' }));

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: 'נרשם...' });
        expect(btn).toBeDisabled();
      });
    });
  });
});
