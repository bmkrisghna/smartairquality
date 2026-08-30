import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Chatbot } from '@/components/Chatbot';

import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { MapPage } from '@/pages/dashboard/MapPage';
import { PredictionPage } from '@/pages/dashboard/PredictionPage';
import { TravelPage } from '@/pages/dashboard/TravelPage';
import { ReportsPage } from '@/pages/dashboard/ReportsPage';
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardHome />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/map"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MapPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/prediction"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PredictionPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/travel"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TravelPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/reports"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ReportsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/notifications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <NotificationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Chatbot />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
