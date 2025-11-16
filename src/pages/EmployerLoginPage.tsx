import { useState } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Building2, Lock, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export function EmployerLoginPage() {
  const { navigateTo, setEmployerData } = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'employer' | 'institution'>('employer');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const isInstitution = accountType === 'institution';

    setEmployerData({
      username: username,
      companyName: isInstitution ? 'Massachusetts Institute of Technology' : 'Google',
      companyAbout: isInstitution 
        ? 'Leading educational institution focused on research and innovation.'
        : 'Leading technology company focused on search, advertising, and cloud computing.',
      accountType: accountType,
    });

    toast.success('Login successful!');
    
    setTimeout(() => {
      navigateTo(isInstitution ? 'institution-dashboard' : 'employer-dashboard');
    }, 1000);
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
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              accountType === 'employer' 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30' 
                : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30'
            }`}>
              {accountType === 'employer' ? (
                <Building2 className="w-10 h-10 text-white" />
              ) : (
                <GraduationCap className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-5xl text-slate-900 mb-4">
            <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
              accountType === 'employer'
                ? 'from-blue-600 to-indigo-600'
                : 'from-purple-600 to-pink-600'
            }`}>
              {accountType === 'employer' ? 'Employer' : 'University'} Login
            </span>
          </h1>
          <p className="text-slate-600 text-lg">Sign in to manage verifications</p>
        </div>

        {/* Sign In Form */}
        <div className={`bg-white/80 backdrop-blur-xl border p-12 rounded-3xl shadow-2xl transition-all ${
          accountType === 'employer'
            ? 'border-blue-200/50 shadow-blue-500/10'
            : 'border-purple-200/50 shadow-purple-500/10'
        }`}>
          {/* Account Type Toggle */}
          <div className="mb-8">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountType('employer')}
                className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  accountType === 'employer'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Employer</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('institution')}
                className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  accountType === 'institution'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Institution</span>
              </button>
            </div>
          </div>

          <h2 className="text-3xl text-slate-900 mb-8">
            Sign in
          </h2>

          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <Label htmlFor="username" className={`text-lg mb-3 block ${
                accountType === 'employer' ? 'text-blue-700' : 'text-purple-700'
              }`}>
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`border-2 rounded-xl h-14 pl-12 bg-white/50 backdrop-blur-sm ${
                    accountType === 'employer'
                      ? 'border-blue-200/50 focus:border-blue-500'
                      : 'border-purple-200/50 focus:border-purple-500'
                  }`}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className={`text-lg mb-3 block ${
                accountType === 'employer' ? 'text-blue-700' : 'text-purple-700'
              }`}>
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border-2 rounded-xl h-14 pl-12 bg-white/50 backdrop-blur-sm ${
                    accountType === 'employer'
                      ? 'border-blue-200/50 focus:border-blue-500'
                      : 'border-purple-200/50 focus:border-purple-500'
                  }`}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full text-white h-14 text-lg rounded-xl hover:shadow-lg transition-all ${
                accountType === 'employer'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/30'
              }`}
            >
              Sign In as {accountType === 'employer' ? 'Employer' : 'Institution'}
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