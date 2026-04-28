/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import VisionPage from './pages/VisionPage';
import HowItWorksPage from './pages/HowItWorksPage';

export default function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
        <div className="min-h-screen relative overflow-x-hidden font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/analyze/:category" element={<InputPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}

