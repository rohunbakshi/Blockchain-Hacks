import { useState, useEffect } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const { navigateTo, resetPassword } = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    // Extract token from URL hash or query params
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Invalid reset link. No token found.');
      setTimeout(() => navigateTo('forgot-password'), 2000);
    }
  }, [navigateTo]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];

    if (pwd.length < 6) {
      errors.push('at least 6 characters long');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('one lowercase letter');
    }
    if (!/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('one special character');
    }
    if (/[\s_]/.test(pwd)) {
      errors.push('no spaces or underscores');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      toast.error(`Password must have: ${passwordErrors.join(', ')}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsResetting(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = resetPassword(token, newPassword);
      
      if (success) {
        setIsReset(true);
        toast.success('Password reset successfully!');
        
        setTimeout(() => {
          navigateTo('user-login');
        }, 2000);
      } else {
        toast.error('Invalid or expired reset token. Please request a new reset link.');
        setTimeout(() => {
          navigateTo('forgot-password');
        }, 2000);
      }
      
      setIsResetting(false);
    }, 1000);
  };

  if (isReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-12 rounded-3xl shadow-2xl shadow-teal-500/10 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl text-slate-900 mb-4">
              Password Reset!
            </h1>
            <p className="text-slate-600 mb-8">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center px-8 relative overflow-hidden">
        <div className="relative w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl border border-red-200/50 p-12 rounded-3xl shadow-2xl text-center">
            <h1 className="text-2xl text-slate-900 mb-4">Invalid Reset Link</h1>
            <p className="text-slate-600 mb-6">Please request a new password reset link.</p>
            <Button
              onClick={() => navigateTo('forgot-password')}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              Go to Forgot Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-12 rounded-3xl shadow-2xl shadow-teal-500/10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-slate-900 mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword" className="text-lg mb-3 block text-teal-700">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[\s_]/g, '');
                    setNewPassword(value);
                  }}
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-14 pl-12 pr-14 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2 space-y-1">
                  {validatePassword(newPassword).map((error, idx) => (
                    <p key={idx} className="text-xs text-red-500">✗ {error}</p>
                  ))}
                  {validatePassword(newPassword).length === 0 && (
                    <p className="text-xs text-green-600">✓ Password meets all requirements</p>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Requirements: 6+ characters, 1 uppercase, 1 lowercase, 1 special character, no spaces/underscores
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-lg mb-3 block text-teal-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`border-2 rounded-xl h-14 pl-12 pr-14 bg-white/50 backdrop-blur-sm ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-teal-200/50 focus:border-teal-500'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isResetting || !newPassword || !confirmPassword || newPassword !== confirmPassword || validatePassword(newPassword).length > 0}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-14 text-lg rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigateTo('user-login')}
              className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

