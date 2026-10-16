import React from 'react';
import { useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Toast } from './components/Toast';
import { BlockDetailModal } from './components/BlockDetailModal';

export const App: React.FC = () => {
  const { page, user } = useApp();

  const isAdminOnlyPage = !user && (page === 'dashboard' || page === 'issue' || page === 'profile');

  return (
    <>
      {page === 'home' && <LandingPage />}
      {(page === 'login' || isAdminOnlyPage) && <AuthPage />}
      {!isAdminOnlyPage && page !== 'home' && page !== 'login' && <DashboardLayout />}

      <Toast />
      <BlockDetailModal />
    </>
  );
};
