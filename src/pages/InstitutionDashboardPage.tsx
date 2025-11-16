import { useState } from 'react';
import { useRouter } from '../components/Router';
import { GraduationCap, CheckCircle, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  studentName: string;
  credential: string;
  date: string;
}

const mockPendingRequests: VerificationRequest[] = [
  { id: '1', studentName: 'Rohun Bakshi', credential: 'Bachelor of Computer Science', date: '11/16/2025' },
];

const mockApprovedRequests: VerificationRequest[] = [
  { id: '4', studentName: 'Bob Jones', credential: 'BS Computer Science', date: '2023-12-20' },
  { id: '5', studentName: 'Emma Wilson', credential: 'MS Data Science', date: '2023-12-18' },
];

export function InstitutionDashboardPage() {
  const { employerData, navigateTo, logout } = useRouter();
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>(mockPendingRequests);
  const [approvedRequests, setApprovedRequests] = useState<VerificationRequest[]>(mockApprovedRequests);
  const [showCheckCredentialsModal, setShowCheckCredentialsModal] = useState(false);
  const [userWallet, setUserWallet] = useState('');
  const [credentialsResult, setCredentialsResult] = useState<string | null>(null);

  const handleApproveRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      // Remove from pending and add to approved
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      setApprovedRequests([...approvedRequests, request]);
      toast.success(`Verified ${request.studentName}'s ${request.credential}`);
    }
  };

  const handleRejectRequest = (_requestId: string) => {
    toast.error('Request rejected');
  };

  const handleCheckCredentials = () => {
    if (!userWallet || !userWallet.trim()) {
      toast.error('Please enter a user wallet address');
      return;
    }

    // Display credentials result
    setCredentialsResult('B.S. in Computer Science at the University of Wisconsin Madison');
  };

  const handleOpenCheckCredentials = () => {
    setShowCheckCredentialsModal(true);
    setUserWallet('');
    setCredentialsResult(null);
  };

  const handleCloseCheckCredentials = () => {
    setShowCheckCredentialsModal(false);
    setUserWallet('');
    setCredentialsResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-teal-200/50 px-8 py-5 flex items-center justify-between shadow-sm">
        <h1 className="text-5xl text-slate-900">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Institution Dashboard
          </span>
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 hover:bg-purple-50 rounded-xl transition-all">
              <Settings className="w-5 h-5 text-slate-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-purple-200/50 rounded-xl shadow-lg">
            <DropdownMenuItem 
              onClick={() => {
                logout();
                toast.success('Logged out successfully');
              }}
              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="relative px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          {/* Left Sidebar - School Profile */}
          <div className="bg-white/80 backdrop-blur-xl border border-purple-200/50 p-8 rounded-3xl shadow-xl h-fit sticky top-8">
            {/* School Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-red-600 flex items-center justify-center bg-white mb-6 relative shadow-lg overflow-hidden">
                {/* UW Madison Logo */}
                <img 
                  src="https://brand.wisc.edu/content/uploads/2017/04/Wisconsin_W-256x256.png"
                  alt="University of Wisconsin Madison Logo"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback to a red circle with "W" if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-logo')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-logo w-full h-full bg-red-600 flex items-center justify-center text-white text-4xl font-bold';
                      fallback.textContent = 'W';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>

              <h2 className="text-2xl text-slate-900 mb-6">School Profile</h2>
              
              <div className="w-full">
                <h3 className="text-purple-700 mb-3">School Name</h3>
                <p className="text-sm text-slate-600 mb-6">
                  {employerData.companyName || 'University of Wisconsin Madison'}
                </p>
                
                <h3 className="text-purple-700 mb-3">About</h3>
                <div className="space-y-2">
                  <div className="h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <div className="h-1.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></div>
                  <div className="h-1.5 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Action Sections */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <div className="bg-white/80 backdrop-blur-xl border border-orange-200/50 p-8 rounded-3xl shadow-xl">
              <h2 className="text-3xl text-slate-900 mb-8">
                <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Pending Requests
                </span>
              </h2>

              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200/50 p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:shadow-orange-500/10 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg text-slate-900">{request.studentName}</h3>
                      <p className="text-sm text-slate-600">{request.credential}</p>
                      <p className="text-xs text-slate-500 mt-1">{request.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="outline"
                        className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl"
                        size="sm"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Requests */}
            <div className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 p-8 rounded-3xl shadow-xl">
              <h2 className="text-3xl text-slate-900 mb-8">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Approved Requests
                </span>
              </h2>

              <div className="space-y-3">
                {approvedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg text-slate-900">{request.studentName}</h3>
                      <p className="text-sm text-slate-600">{request.credential}</p>
                      <p className="text-xs text-slate-500 mt-1">Approved: {request.date}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Check User Credentials */}
            <div 
              onClick={handleOpenCheckCredentials}
              className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 p-10 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl text-slate-900">Check User Credentials</h2>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Check Credentials Modal */}
      <Dialog open={showCheckCredentialsModal} onOpenChange={setShowCheckCredentialsModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-indigo-200/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900 mb-4">Check User Credentials</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="userWallet" className="text-indigo-700 text-base mb-2 block">
                User Wallet Address
              </Label>
              <Input
                id="userWallet"
                value={userWallet}
                onChange={(e) => setUserWallet(e.target.value)}
                className="border-2 border-indigo-200/50 focus:border-indigo-500 rounded-xl h-12 text-base bg-white/50 backdrop-blur-sm"
                placeholder="Enter user wallet address..."
              />
            </div>

            {credentialsResult && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-base text-slate-900 font-medium">{credentialsResult}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleCheckCredentials}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 text-base rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Check Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}