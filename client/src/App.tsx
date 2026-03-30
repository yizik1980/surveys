import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import { isAuthenticated, toastMessage } from './store/signals';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyResponse from './pages/SurveyResponse';
import CRM from './pages/CRM';
import AdminUsers from './pages/AdminUsers';

function PrivateRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  useSignals();
  if (!isAuthenticated.value) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  useSignals();
  return (
    <BrowserRouter>
      {toastMessage.value && <Toast />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/survey/:token" element={<SurveyResponse />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <><Navbar /><Dashboard /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys"
          element={
            <PrivateRoute>
              <><Navbar /><SurveyList /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys/new"
          element={
            <PrivateRoute>
              <><Navbar /><SurveyBuilder /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/surveys/:id/edit"
          element={
            <PrivateRoute>
              <><Navbar /><SurveyBuilder /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/crm"
          element={
            <PrivateRoute>
              <><Navbar /><CRM /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <><Navbar /><AdminUsers /></>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
