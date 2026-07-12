import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Protected Route Guard & Layout
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Academics from './pages/Academics';
import Attendance from './pages/Attendance';
import AttendanceSession from './pages/AttendanceSession';
import Devices from './pages/Devices';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import QRScanner from './pages/QRScanner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes Wrapper */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout pageTitle="Attendance System Dashboard">
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/students" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout pageTitle="Student Biometrics Database">
                      <Students />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/teachers" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout pageTitle="Faculty Directory">
                      <Teachers />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Academics consolidated endpoints */}
              {['/departments', '/programs', '/courses', '/subjects'].map((path) => (
                <Route 
                  key={path}
                  path={path} 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DashboardLayout pageTitle="Academic Configurations">
                        <Academics />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
              ))}

              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    <DashboardLayout pageTitle="Attendance Sheets Ledger">
                      <Attendance />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/attendance-session" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout pageTitle="Live Biometric Sync Session">
                      <AttendanceSession />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/devices" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout pageTitle="Biometric Scanners Terminal Hub">
                      <Devices />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    <DashboardLayout pageTitle="Reports Compiler Console">
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    <DashboardLayout pageTitle="My Personal Account">
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/qr-scan" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout pageTitle="QR Attendance Check-in">
                      <QRScanner />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    <DashboardLayout pageTitle="System Settings Panel">
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />

              {/* 404 Routing Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          {/* Central Notification Hot Toast Container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '16px',
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.3)',
                padding: '12px 16px',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
