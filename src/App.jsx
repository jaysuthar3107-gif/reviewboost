import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './lib/i18n'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ReviewPage from './pages/ReviewPage'
import SettingsPage from './pages/SettingsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SupportPage from './pages/SupportPage'

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function ReviewLayout({ children }) {
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: 'var(--toast-bg, #1e293b)',
                color: '#f8fafc',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* Review page - no navbar/footer */}
            <Route path="/review/:slug" element={
              <ReviewLayout>
                <ReviewPage />
              </ReviewLayout>
            } />

            {/* OAuth callback - no navbar/footer, full-screen loader */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Auth pages - no footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Main app with nav/footer */}
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/dashboard" element={
              <AppLayout>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/settings" element={
              <AppLayout>
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </AppLayout>
            } />

            {/* Legal & Support — public pages */}
            <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
            <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
            <Route path="/support" element={<AppLayout><SupportPage /></AppLayout>} />

            {/* 404 */}
            <Route path="*" element={
              <AppLayout>
                <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
                  <div>
                    <div className="text-8xl mb-4">🔍</div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Page Not Found</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
