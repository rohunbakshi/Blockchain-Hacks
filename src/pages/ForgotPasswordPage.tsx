import { useState } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const { navigateTo, sendPasswordResetEmail } = useRouter();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = sendPasswordResetEmail(email.trim());
      
      if (success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      } else {
        toast.error('Email not found. Please check your email address.');
      }
      
      setIsSending(false);
    }, 1000);
  };

  if (emailSent) {
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
              Email Sent!
            </h1>
            <p className="text-slate-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-teal-700 font-semibold mb-8">
              {email}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
            </p>
            <Button
              onClick={() => navigateTo('user-login')}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-14 text-lg rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              Back to Login
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
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-slate-900 mb-2 text-center">
            Forgot Password?
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-lg mb-3 block text-teal-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
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

            <Button
              type="submit"
              disabled={isSending}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-14 text-lg rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigateTo('user-login')}
              className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

