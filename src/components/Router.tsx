import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

type Page = 'landing' | 'wallet-connect' | 'profile-setup' | 'dashboard' | 'employer-login' | 'employer-dashboard' | 'institution-dashboard' | 'id-verification' | 'user-login' | 'forgot-password' | 'reset-password';

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
  logout: () => void;
  login: (email: string, password: string) => boolean;
  sendPasswordResetEmail: (email: string) => boolean;
  resetPassword: (token: string, newPassword: string) => boolean;
  checkEmailExists: (email: string) => boolean;
  registerUser: (email: string) => void;
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
  email?: string;
  phone?: string;
  password?: string;
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
    const validPages: Page[] = ['landing', 'wallet-connect', 'profile-setup', 'dashboard', 'employer-login', 'employer-dashboard', 'institution-dashboard', 'id-verification', 'user-login', 'forgot-password', 'reset-password'];
    return (hash && validPages.includes(hash as Page)) ? (hash as Page) : 'landing';
  };

  const initialPage = getInitialPage();
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [history, setHistory] = useState<Page[]>([initialPage]);
  
  const [historyIndex, setHistoryIndex] = useState(0);
  const isNavigatingRef = useRef(false);
  
  // Load userData from localStorage on initialization
  const loadUserDataFromStorage = (): UserData => {
    try {
      const stored = localStorage.getItem('credentialHub_userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Don't restore File objects - they can't be serialized
        const { documents, ...rest } = parsed;
        return rest as UserData;
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    }
    return {};
  };

  const [userData, setUserDataState] = useState<UserData>(loadUserDataFromStorage());
  const [employerData, setEmployerDataState] = useState<EmployerData>({});
  
  // Save userData to localStorage whenever it changes
  useEffect(() => {
    try {
      // Only save if user has wallet address (is logged in)
      if (userData.walletAddress) {
        // Don't save File objects - they can't be serialized
        const { documents, ...dataToSave } = userData;
        localStorage.setItem('credentialHub_userData', JSON.stringify(dataToSave));
        console.log('User data saved to localStorage');
      } else {
        // If no wallet address, clear storage (user logged out)
        localStorage.removeItem('credentialHub_userData');
      }
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
    }
  }, [userData]);

  // Handle browser back/forward buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (isNavigatingRef.current) return;
      
      const hash = window.location.hash.slice(1);
      const validPages: Page[] = ['landing', 'wallet-connect', 'profile-setup', 'dashboard', 'employer-login', 'employer-dashboard', 'institution-dashboard', 'id-verification', 'user-login', 'forgot-password', 'reset-password'];
      
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
    setUserDataState(prev => {
      const updated = { ...prev, ...data };
      return updated;
    });
  };

  const setEmployerData = (data: Partial<EmployerData>) => {
    setEmployerDataState(prev => ({ ...prev, ...data }));
  };

  const logout = () => {
    // Clear user data
    setUserDataState({});
    // Clear localStorage
    localStorage.removeItem('credentialHub_userData');
    // Navigate to landing page
    navigateTo('landing');
    console.log('User logged out');
  };

  const login = (email: string, password: string): boolean => {
    // Always allow login - no need to check credentials
    try {
      // Set flag to indicate user is logging in (not signing up)
      sessionStorage.setItem('credentialHub_isLogin', 'true');
      
      const stored = localStorage.getItem('credentialHub_userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Don't restore File objects - they can't be serialized
        const { documents, ...rest } = parsed;
        // Set name to Rohun Bakshi
        const userDataWithName: UserData = {
          ...rest,
          firstName: 'Rohun',
          lastName: 'Bakshi',
          email: email.toLowerCase(),
        };
        // Restore user data to state
        setUserDataState(userDataWithName);
      } else {
        // If no stored data, create user data with Rohun Bakshi name
        setUserDataState({ 
          email: email.toLowerCase(),
          firstName: 'Rohun',
          lastName: 'Bakshi',
        });
      }
      
      console.log('User logged in with email:', email);
      
      // Navigate to dashboard
      navigateTo('dashboard');
      return true; // Login always successful
    } catch (error) {
      console.error('Failed to login:', error);
      // Even on error, allow login with Rohun Bakshi name
      sessionStorage.setItem('credentialHub_isLogin', 'true');
      setUserDataState({ 
        email: email.toLowerCase(),
        firstName: 'Rohun',
        lastName: 'Bakshi',
      });
      navigateTo('dashboard');
      return true;
    }
  };

  const sendPasswordResetEmail = (email: string): boolean => {
    try {
      const stored = localStorage.getItem('credentialHub_userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check if email exists
        if (parsed.email && parsed.email.toLowerCase() === email.toLowerCase()) {
          // Generate reset token
          const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          
          // Store reset token in localStorage (in production, this would be in a database)
          const resetTokens = JSON.parse(localStorage.getItem('credentialHub_resetTokens') || '{}');
          resetTokens[email.toLowerCase()] = {
            token: resetToken,
            expiresAt: Date.now() + 3600000 // 1 hour from now
          };
          localStorage.setItem('credentialHub_resetTokens', JSON.stringify(resetTokens));
          
          // Send password reset email
          const resetLink = `${window.location.origin}${window.location.pathname}#reset-password?token=${resetToken}`;
          
          // Import email service dynamically
          import('../utils/emailService').then(({ sendPasswordResetEmail: sendResetEmail }) => {
            sendResetEmail(email.toLowerCase(), resetLink).then((sent) => {
              if (sent) {
                console.log('Password reset email sent to:', email);
              } else {
                console.error('Failed to send password reset email');
              }
            }).catch((error) => {
              console.error('Error sending password reset email:', error);
            });
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
    
    return false;
  };

  const resetPassword = (token: string, newPassword: string): boolean => {
    try {
      const resetTokens = JSON.parse(localStorage.getItem('credentialHub_resetTokens') || '{}');
      
      // Find email associated with token
      let emailToReset = '';
      for (const [email, data] of Object.entries(resetTokens)) {
        const tokenData = data as { token: string; expiresAt: number };
        if (tokenData.token === token && tokenData.expiresAt > Date.now()) {
          emailToReset = email;
          break;
        }
      }
      
      if (!emailToReset) {
        return false; // Invalid or expired token
      }
      
      // Update password in user data
      const stored = localStorage.getItem('credentialHub_userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        if (parsed.email && parsed.email.toLowerCase() === emailToReset) {
          parsed.password = newPassword;
          
          // Don't restore File objects - they can't be serialized
          const { documents, ...rest } = parsed;
          
          // Update user data
          setUserDataState(rest as UserData);
          
          // Save updated data
          localStorage.setItem('credentialHub_userData', JSON.stringify(rest));
          
          // Remove used reset token
          delete resetTokens[emailToReset];
          localStorage.setItem('credentialHub_resetTokens', JSON.stringify(resetTokens));
          
          console.log('Password reset successful for:', emailToReset);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
    
    return false;
  };

  const checkEmailExists = (email: string): boolean => {
    try {
      const emailLower = email.trim().toLowerCase();
      
      // Check if email exists in registered users list
      const registeredUsersStr = localStorage.getItem('credentialHub_registeredUsers');
      if (registeredUsersStr) {
        const registeredUsers = JSON.parse(registeredUsersStr) as string[];
        if (registeredUsers.includes(emailLower)) {
          return true; // Email already exists
        }
      }
      
      // Also check in current userData (for existing logged-in users)
      if (userData.email && userData.email.toLowerCase() === emailLower) {
        return true;
      }
      
      // Check in localStorage userData
      const stored = localStorage.getItem('credentialHub_userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.email.toLowerCase() === emailLower) {
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to check email existence:', error);
    }
    
    return false;
  };

  const registerUser = (email: string): void => {
    try {
      const emailLower = email.trim().toLowerCase();
      
      // Get existing registered users list
      const registeredUsersStr = localStorage.getItem('credentialHub_registeredUsers');
      let registeredUsers: string[] = [];
      
      if (registeredUsersStr) {
        registeredUsers = JSON.parse(registeredUsersStr) as string[];
      }
      
      // Add email if not already in list
      if (!registeredUsers.includes(emailLower)) {
        registeredUsers.push(emailLower);
        localStorage.setItem('credentialHub_registeredUsers', JSON.stringify(registeredUsers));
        console.log('Registered user email:', emailLower);
      }
    } catch (error) {
      console.error('Failed to register user:', error);
    }
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
        setEmployerData,
        logout,
        login,
        sendPasswordResetEmail,
        resetPassword,
        checkEmailExists,
        registerUser
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
