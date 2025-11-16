import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'landing' | 'wallet-connect' | 'profile-setup' | 'dashboard' | 'employer-login' | 'employer-dashboard' | 'institution-dashboard' | 'id-verification';

interface RouterContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  userData: UserData;
  setUserData: (data: Partial<UserData>) => void;
  employerData: EmployerData;
  setEmployerData: (data: Partial<EmployerData>) => void;
}

interface EmployerData {
  companyName?: string;
  username?: string;
  companyLogo?: string;
  companyAbout?: string;
  accountType?: 'employer' | 'institution';
}

interface UserData {
  walletAddress?: string;
  walletType?: string;
  network?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
  lastFourSSN?: string;
  profileImage?: string;
  documents?: File[];
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userData, setUserDataState] = useState<UserData>({});
  const [employerData, setEmployerDataState] = useState<EmployerData>({});

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...data }));
  };

  const setEmployerData = (data: Partial<EmployerData>) => {
    setEmployerDataState(prev => ({ ...prev, ...data }));
  };

  return (
    <RouterContext.Provider value={{ currentPage, navigateTo, userData, setUserData, employerData, setEmployerData }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}
