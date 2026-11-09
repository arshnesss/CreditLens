import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Customers } from './pages/Customers';
import { RiskAssessment } from './pages/RiskAssessment';
import { PortfolioAnalytics } from './pages/PortfolioAnalytics';
import { AIInvestigator } from './pages/AIInvestigator';
import { ModelMonitoring } from './pages/ModelMonitoring';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="customers" element={<Customers />} />
          <Route path="risk-assessment" element={<RiskAssessment />} />
          <Route path="analytics" element={<PortfolioAnalytics />} />
          <Route path="investigator" element={<AIInvestigator />} />
          <Route path="monitoring" element={<ModelMonitoring />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

