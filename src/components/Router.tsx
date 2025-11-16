import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

type Page = 'landing' | 'wallet-connect' | 'profile-setup' | 'dashboard' | 'employer-login' | 'employer-dashboard' | 'institution-dashboard' | 'id-verification';

interface RouterContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  history: Page[];
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
  // Parsed resume data
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
  }>;
  workExperience?: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const getInitialPage = (): Page => {
    const hash = window.location.hash.slice(1);
    const validPages: Page[] = ['landing', 'wallet-connect', 'profile-setup', 'dashboard', 'employer-login', 'employer-dashboard', 'institution-dashboard', 'id-verification'];
    return (hash && validPages.includes(hash as Page)) ? (hash as Page) : 'landing';
  };

  const initialPage = getInitialPage();
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [history, setHistory] = useState<Page[]>([initialPage]);
  
  const [historyIndex, setHistoryIndex] = useState(0);
  const isNavigatingRef = useRef(false);
  
  const [userData, setUserDataState] = useState<UserData>({});
  const [employerData, setEmployerDataState] = useState<EmployerData>({});

  // Handle browser back/forward buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (isNavigatingRef.current) return;
      
      const hash = window.location.hash.slice(1);
      const validPages: Page[] = ['landing', 'wallet-connect', 'profile-setup', 'dashboard', 'employer-login', 'employer-dashboard', 'institution-dashboard', 'id-verification'];
      
      if (hash && validPages.includes(hash as Page)) {
        const page = hash as Page;
        
        // If page is already current, don't do anything
        if (page === currentPage) return;
        
        // Check if this page is in our history
        const existingIndex = history.findIndex(p => p === page);
        
        if (existingIndex !== -1) {
          // Page exists in history - navigate to that point
          setHistoryIndex(existingIndex);
        } else {
          // New page - add to history
          const newHistory = [...history, page];
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
        
        setCurrentPage(page);
      }
    };

    const handlePopState = (_event: PopStateEvent) => {
      isNavigatingRef.current = true;
      handleHashChange();
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    };

    // Listen to hash changes (for browser navigation)
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    // Handle initial hash
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      const validPages: Page[] = ['landing', 'wallet-connect', 'profile-setup', 'dashboard', 'employer-login', 'employer-dashboard', 'institution-dashboard', 'id-verification'];
      if (validPages.includes(initialHash as Page)) {
        const page = initialHash as Page;
        if (page !== currentPage) {
          setCurrentPage(page);
          if (history.length === 1 && history[0] !== page) {
            setHistory([history[0], page]);
            setHistoryIndex(1);
          }
        }
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPage, history]);

  const navigateTo = (page: Page) => {
    if (page === currentPage) return;

    isNavigatingRef.current = true;
    
    // If we're not at the end of history, remove forward history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(page);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPage(page);
    
    // Update URL without triggering hashchange listener
    window.history.pushState({ page }, '', `#${page}`);
    
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 50);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      isNavigatingRef.current = true;
      const newIndex = historyIndex - 1;
      const page = history[newIndex];
      
      // Update state
      setHistoryIndex(newIndex);
      setCurrentPage(page);
      
      // Use browser's back button
      window.history.back();
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      isNavigatingRef.current = true;
      const newIndex = historyIndex + 1;
      const page = history[newIndex];
      
      // Update state
      setHistoryIndex(newIndex);
      setCurrentPage(page);
      
      // Use browser's forward button
      window.history.forward();
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...data }));
  };

  const setEmployerData = (data: Partial<EmployerData>) => {
    setEmployerDataState(prev => ({ ...prev, ...data }));
  };

  return (
    <RouterContext.Provider 
      value={{ 
        currentPage, 
        navigateTo, 
        goBack, 
        goForward, 
        canGoBack, 
        canGoForward,
        history,
        userData, 
        setUserData, 
        employerData, 
        setEmployerData 
      }}
    >
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
