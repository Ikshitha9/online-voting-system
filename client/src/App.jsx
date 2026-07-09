/**
 * App.jsx — Application Router
 * ============================
 * Defines all client-side routes using React Router v6.
 * Uses ProtectedRoute to guard voter and admin areas.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';

// Voter Pages (protected + verified)
import Dashboard from './pages/Dashboard';
import Elections from './pages/Elections';
import ElectionDetail from './pages/ElectionDetail';
import VotePage from './pages/VotePage';
import Surveys from './pages/Surveys';
import SurveyDetail from './pages/SurveyDetail';
import Results from './pages/Results';
import Profile from './pages/Profile';

// Admin Pages (protected + admin role)
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateElection from './pages/admin/CreateElection';
import ManageElections from './pages/admin/ManageElections';
import CreateSurvey from './pages/admin/CreateSurvey';
import AdminElectionResults from './pages/admin/ElectionResults';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#f3f4f6',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#111827' } },
          }}
        />

        <div className="app-wrapper">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* ── Public Routes ─────────────────────────────── */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

              {/* ── Voter Routes (require auth + isVerified) ──── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireVerified>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/elections"
                element={
                  <ProtectedRoute requireVerified>
                    <Elections />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/elections/:id"
                element={
                  <ProtectedRoute requireVerified>
                    <ElectionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vote/:id"
                element={
                  <ProtectedRoute requireVerified>
                    <VotePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys"
                element={
                  <ProtectedRoute requireVerified>
                    <Surveys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id"
                element={
                  <ProtectedRoute requireVerified>
                    <SurveyDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute requireVerified>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* ── Admin Routes (require admin role) ─────────── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/elections"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageElections />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/elections/create"
                element={
                  <ProtectedRoute requireAdmin>
                    <CreateElection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/create"
                element={
                  <ProtectedRoute requireAdmin>
                    <CreateSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/elections/:id/results"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminElectionResults />
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback ───────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
