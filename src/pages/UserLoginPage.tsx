import { useState } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function UserLoginPage() {
  const { navigateTo, login } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Attempt to login with credentials
    const success = login(email, password);
    
    if (success) {
      toast.success('Login successful!');
    } else {
      toast.error('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              User Login
            </span>
          </h1>
          <p className="text-slate-600 text-lg">Sign in to access your dashboard</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-12 rounded-3xl shadow-2xl shadow-teal-500/10">
          <h2 className="text-3xl text-slate-900 mb-8">
            Sign in
          </h2>

          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <Label htmlFor="email" className="text-lg mb-3 block text-teal-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-14 pl-12 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-lg mb-3 block text-teal-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-14 pl-12 pr-14 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
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
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-14 text-lg rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigateTo('landing')}
            className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

