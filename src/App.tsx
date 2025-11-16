import { RouterProvider, useRouter } from './components/Router';
import { LandingPage } from './pages/LandingPage';
import { WalletConnectPage } from './pages/WalletConnectPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserHomePage } from './pages/UserHomePage';
import { EmployerLoginPage } from './pages/EmployerLoginPage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { InstitutionDashboardPage } from './pages/InstitutionDashboardPage';
import { IDVerificationPage } from './pages/IDVerificationPage';
import { Toaster } from 'sonner';

function AppContent() {
  const { currentPage } = useRouter();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'wallet-connect':
        return <WalletConnectPage />;
      case 'profile-setup':
        return <ProfileSetupPage />;
      case 'dashboard':
        return <UserHomePage />;
      case 'employer-login':
        return <EmployerLoginPage />;
      case 'employer-dashboard':
        return <EmployerDashboardPage />;
      case 'institution-dashboard':
        return <InstitutionDashboardPage />;
      case 'id-verification':
        return <IDVerificationPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
