/**
 * App.tsx - Root Application Component
 * Sets up routing and renders the Employee CRUD page.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import EmployeePage from './pages/EmployeePage/EmployeePage';
import Dashboard from './pages/Dashboard/Dashboard';
import HealthTracker from './pages/HealthTracker/HealthTracker';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import MainLayout from './components/MainLayout/MainLayout';
import './App.css';

const themeConfig = {
  token: {
    colorPrimary: '#0f172a',
    borderRadius: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

// Simple PrivateRoute wrapper to check for token
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/employees" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <EmployeePage />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/health-tracker" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <HealthTracker />
                </MainLayout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
