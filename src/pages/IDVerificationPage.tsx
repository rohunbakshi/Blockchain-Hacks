import { useState } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShieldCheck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function IDVerificationPage() {
  const { navigateTo } = useRouter();
  const [userID, setUserID] = useState('');
  const [credentialID, setCredentialID] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userID || !credentialID) {
      toast.error('Please fill in all fields');
      return;
    }

    // Simulate verification check
    const isApproved = Math.random() > 0.5;
    setStatus(isApproved ? 'approved' : 'pending');
    
    toast.success('Verification check completed!');
  };

  const handleBack = () => {
    navigateTo('institution-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-12 px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ID Verification
            </span>
          </h1>
          <p className="text-slate-600 text-lg">Verify student credentials and identities</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 rounded-3xl shadow-2xl shadow-indigo-500/10 p-10">
          <form onSubmit={handleVerify} className="space-y-8">
            {/* User ID */}
            <div>
              <Label className="text-indigo-700 text-xl mb-4 block">
                User ID
              </Label>
              <Input
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                className="border-2 border-indigo-200/50 focus:border-indigo-500 rounded-xl h-14 text-lg bg-white/50 backdrop-blur-sm"
                placeholder="Enter user ID..."
                required
              />
            </div>

            {/* Credential ID */}
            <div>
              <Label className="text-indigo-700 text-xl mb-4 block">
                Credential ID
              </Label>
              <Input
                value={credentialID}
                onChange={(e) => setCredentialID(e.target.value)}
                className="border-2 border-indigo-200/50 focus:border-indigo-500 rounded-xl h-14 text-lg bg-white/50 backdrop-blur-sm"
                placeholder="Enter credential ID..."
                required
              />
            </div>

            {/* Status */}
            <div>
              <Label className="text-indigo-700 text-xl mb-4 block">
                STATUS
              </Label>
              <div className="border-2 border-indigo-200/50 rounded-2xl p-10 min-h-[160px] flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm">
                {status === null ? (
                  <p className="text-slate-400 text-lg">Enter IDs and verify to see status</p>
                ) : (
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${
                      status === 'approved' 
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                        : 'bg-gradient-to-br from-orange-400 to-yellow-500'
                    }`}>
                      {status === 'approved' ? (
                        <CheckCircle className="w-10 h-10 text-white" />
                      ) : (
                        <Clock className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <p className={`text-2xl ${status === 'approved' ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {status === 'approved' ? 'Approved' : 'Pending Review'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Verify Credentials
              </Button>
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-2 border-slate-300 hover:bg-slate-50 h-14 text-lg rounded-xl hover:shadow-md transition-all group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        {status !== null && (
          <div className="mt-8 p-8 bg-white/80 backdrop-blur-xl border border-indigo-200/50 rounded-3xl shadow-xl">
            <h3 className="text-xl text-slate-900 mb-6">Verification Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">User ID</p>
                  <p className="text-slate-900">{userID}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Credential ID</p>
                  <p className="text-slate-900">{credentialID}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className={status === 'approved' ? 'text-emerald-600' : 'text-orange-600'}>
                    {status === 'approved' ? 'Approved ✓' : 'Pending Review ⏱'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}