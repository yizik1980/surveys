import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSignals } from '@preact/signals-react/runtime';
import { isAuthenticated, isAdmin, toastMessage } from './store/signals';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SurveyorRegister from './pages/SurveyorRegister';
import Dashboard from './pages/Dashboard';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyResponse from './pages/SurveyResponse';
import CRM from './pages/CRM';
import AdminUsers from './pages/AdminUsers';
import AdminLogin from './pages/AdminLogin';
import AdminSurveyors from './pages/AdminSurveyors';

function PrivateRoute({ children }: { children: ReactNode }) {
  useSignals();
  if (!isAuthenticated.value) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  useSignals();
  if (!isAdmin.value) return <Navigate to="/admin" replace />;
  return <>{children}</>;
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
        <Route path="/register/surveyor" element={<SurveyorRegister />} />
        <Route path="/survey/:token" element={<SurveyResponse />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/surveyors"
          element={
            <AdminRoute>
              <AdminSurveyors />
            </AdminRoute>
          }
        />

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
