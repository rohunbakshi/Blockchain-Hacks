import { useState } from 'react';
import { Bell, Settings, User, ShieldCheck, Briefcase, Share2, CheckCircle, Clock, X, Send, Search, Building2 } from 'lucide-react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  work: string;
  time: string;
  status: 'pending' | 'verified';
}

const mockVerificationQueue: VerificationRequest[] = [
  { id: '1', work: 'Software Engineer at Meta', time: '2 days ago', status: 'pending' },
  { id: '2', work: 'Bachelor of CS at MIT', time: '5 days ago', status: 'verified' },
  { id: '3', work: 'Teaching Assistant at MIT', time: '1 week ago', status: 'verified' },
];

const mockJobMatches = [
  { id: '1', company: 'Google', position: 'Senior Software Engineer', location: 'Mountain View, CA', match: '95%' },
  { id: '2', company: 'Meta', position: 'Full Stack Developer', location: 'Menlo Park, CA', match: '92%' },
  { id: '3', company: 'Amazon', position: 'Software Development Engineer', location: 'Seattle, WA', match: '88%' },
];

export function UserHomePage() {
  const { userData, navigateTo } = useRouter();
  const [verificationQueue] = useState(mockVerificationQueue);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showJobMatchesModal, setShowJobMatchesModal] = useState(false);
  const [showShareResumeModal, setShowShareResumeModal] = useState(false);
  
  // Verification Modal State
  const [verificationType, setVerificationType] = useState('');
  const [verificationEntity, setVerificationEntity] = useState('');
  const [verificationDetails, setVerificationDetails] = useState('');
  
  // Share Resume Modal State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : 'Bob Jones';
  
  const profileImageUrl = userData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Verification request submitted!');
    setShowVerificationModal(false);
    setVerificationType('');
    setVerificationEntity('');
    setVerificationDetails('');
  };

  const handleShareResume = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Resume shared with ${recipientEmail}!`);
    setShowShareResumeModal(false);
    setRecipientEmail('');
    setShareMessage('');
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
        <div className="text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          CredentialHub
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 hover:bg-teal-50 rounded-xl transition-all relative group">
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          <button className="p-3 hover:bg-teal-50 rounded-xl transition-all">
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
          <button className="p-3 hover:bg-teal-50 rounded-xl transition-all">
            <User className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative px-8 py-10">
        <h1 className="text-5xl text-slate-900 mb-10">
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-8 rounded-3xl shadow-xl">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-6">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={displayName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-teal-500 flex items-center justify-center bg-teal-50">
                      <User className="w-16 h-16 text-teal-400" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>

                <h2 className="text-2xl text-slate-900 mb-4">{displayName}</h2>

                <div className="flex gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 px-4 py-1 rounded-full">
                    MIT
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 px-4 py-1 rounded-full">
                    Google SWE
                  </Badge>
                </div>

                <div className="w-full space-y-2 mb-6">
                  <div className="h-1.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                  <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full w-3/4"></div>
                </div>

                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl">
                  Update Profile
                </Button>
              </div>
            </div>

            {/* Verification Queue */}
            <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl text-slate-900 mb-6">
                Verification Queue
              </h3>
              
              <div className="space-y-3">
                {verificationQueue.map((item) => (
                  <div key={item.id} className="bg-gradient-to-r from-slate-50 to-teal-50/50 border border-teal-200/30 p-4 rounded-2xl hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 mb-1">{item.work}</p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </div>
                      <div className="flex items-center">
                        {item.status === 'verified' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Action Cards */}
          <div className="space-y-6">
            {/* Request Verification */}
            <div 
              onClick={() => setShowVerificationModal(true)}
              className="bg-white/80 backdrop-blur-xl border border-teal-200/50 p-10 rounded-3xl hover:shadow-2xl hover:shadow-teal-500/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl text-slate-900">Request Verification</h2>
              </div>
            </div>

            {/* Your Job Matches */}
            <div 
              onClick={() => setShowJobMatchesModal(true)}
              className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 p-10 rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl text-slate-900">Your Job Matches</h2>
              </div>
            </div>

            {/* Share Your Resume */}
            <div 
              onClick={() => setShowShareResumeModal(true)}
              className="bg-white/80 backdrop-blur-xl border border-orange-200/50 p-10 rounded-3xl hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl text-slate-900">Share Your Resume</h2>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Request Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-teal-200/50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-teal-200/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl text-slate-900">Request Verification</h2>
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="p-2 hover:bg-teal-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            <form onSubmit={handleRequestVerification} className="p-6 space-y-6">
              <div>
                <Label className="text-teal-700 mb-2 block">Verification Type</Label>
                <Select value={verificationType} onValueChange={setVerificationType} required>
                  <SelectTrigger className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employment">Employment History</SelectItem>
                    <SelectItem value="education">Education Degree</SelectItem>
                    <SelectItem value="certification">Professional Certification</SelectItem>
                    <SelectItem value="skill">Skill Endorsement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-teal-700 mb-2 block">Company/Institution Name</Label>
                <Input
                  value={verificationEntity}
                  onChange={(e) => setVerificationEntity(e.target.value)}
                  placeholder="e.g., Google, MIT, etc."
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                />
              </div>

              <div>
                <Label className="text-teal-700 mb-2 block">Details</Label>
                <Textarea
                  value={verificationDetails}
                  onChange={(e) => setVerificationDetails(e.target.value)}
                  placeholder="Provide additional details about what needs to be verified..."
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl min-h-[120px]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 rounded-xl"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 border-2 border-slate-300 hover:bg-slate-50 h-12 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Matches Modal */}
      {showJobMatchesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-200/50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-emerald-200/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl text-slate-900">Your Job Matches</h2>
              <button 
                onClick={() => setShowJobMatchesModal(false)}
                className="p-2 hover:bg-emerald-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search job matches..."
                    className="border-2 border-emerald-200/50 focus:border-emerald-500 rounded-xl h-12 pl-12"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {mockJobMatches.map((job) => (
                  <div key={job.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 p-6 rounded-2xl hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg text-slate-900">{job.position}</h3>
                          <p className="text-sm text-slate-600">{job.company}</p>
                          <p className="text-xs text-slate-500 mt-1">{job.location}</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        {job.match} Match
                      </Badge>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Resume Modal */}
      {showShareResumeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-orange-200/50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-orange-200/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl text-slate-900">Share Your Resume</h2>
              <button 
                onClick={() => setShowShareResumeModal(false)}
                className="p-2 hover:bg-orange-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            <form onSubmit={handleShareResume} className="p-6 space-y-6">
              <div>
                <Label className="text-orange-700 mb-2 block">Recipient Email</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="employer@company.com"
                  className="border-2 border-orange-200/50 focus:border-orange-500 rounded-xl h-12"
                  required
                />
              </div>

              <div>
                <Label className="text-orange-700 mb-2 block">Message (Optional)</Label>
                <Textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a personal message to your resume..."
                  className="border-2 border-orange-200/50 focus:border-orange-500 rounded-xl min-h-[120px]"
                />
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200/50 p-4 rounded-2xl">
                <h4 className="text-sm text-orange-900 mb-2">Resume Preview</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">{displayName}_Resume.pdf</p>
                    <p className="text-xs text-slate-500">Last updated 3 days ago</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white h-12 rounded-xl"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share Resume
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowShareResumeModal(false)}
                  className="flex-1 border-2 border-slate-300 hover:bg-slate-50 h-12 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}