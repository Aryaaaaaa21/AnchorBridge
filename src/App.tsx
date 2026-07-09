import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { Wallet } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { SmartContract } from './pages/SmartContract';
import { Feedback } from './pages/Feedback';
import { ProductMetrics } from './pages/ProductMetrics';
import { Monitoring } from './pages/Monitoring';
import { ActivityFeed } from './pages/ActivityFeed';
import { Reputation } from './pages/Reputation';
import { Toaster } from 'sonner';
import { OnboardingTrigger } from './components/Onboarding';

import { useEffect } from 'react';
import { sorobanEventListener } from './services/eventListener';
import { initGoogleAnalytics, initVercelAnalytics, trackPageView } from './services/analytics';
import { initSentry, seedDemoSentryEvents } from './services/monitoring';
import { seedDemoFeedback } from './services/feedback';

function App() {
  useEffect(() => {
    // Initialize analytics & monitoring
    initGoogleAnalytics();
    initVercelAnalytics();
    initSentry();
    seedDemoSentryEvents();
    seedDemoFeedback();

    // Track initial page view
    trackPageView(window.location.pathname, document.title);

    // Start listening to live Soroban events
    sorobanEventListener.start();
    return () => {
      sorobanEventListener.stop();
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
      <OnboardingTrigger />
      <Routes>
        {/* Public Routes with Navbar / No Sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Dashboard Pages (layout wraps Navbar + Sidebar) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="contracts" element={<SmartContract />} />

          {/* Level 4 MVP Pages */}
          <Route path="feedback" element={<Feedback />} />
          <Route path="metrics" element={<ProductMetrics />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="activity" element={<ActivityFeed />} />
          <Route path="reputation" element={<Reputation />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
