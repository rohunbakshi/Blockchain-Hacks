import { useState, useEffect } from 'react';
import { Bell, Settings, User, ShieldCheck, Briefcase, Share2, CheckCircle, Clock, X, Send, Search, Building2 } from 'lucide-react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UpdateProfileModal } from '../components/UpdateProfileModal';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  work: string;
  time: string;
  status: 'pending' | 'verified';
}

// Verification queue starts empty - items are added as users submit verification requests

const mockJobMatches = [
  { id: '1', company: 'Google', position: 'Senior Software Engineer', location: 'Mountain View, CA', match: '95%' },
  { id: '2', company: 'Meta', position: 'Full Stack Developer', location: 'Menlo Park, CA', match: '92%' },
  { id: '3', company: 'Amazon', position: 'Software Development Engineer', location: 'Seattle, WA', match: '88%' },
];

export function UserHomePage() {
  const { userData } = useRouter();
  const [verificationQueue, setVerificationQueue] = useState<VerificationRequest[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showJobMatchesModal, setShowJobMatchesModal] = useState(false);
  const [showShareResumeModal, setShowShareResumeModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  
  // Verification Modal State
  const [verificationType, setVerificationType] = useState('');
  const [verificationEntity, setVerificationEntity] = useState('');
  const [verificationDetails, setVerificationDetails] = useState('');
  const [selectedEducationIndex, setSelectedEducationIndex] = useState<number | null>(null);
  const [showEducationSelector, setShowEducationSelector] = useState(false);
  
  // Share Resume Modal State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : 'Bob Jones';
  
  const profileImageUrl = userData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

  // Get parsed education and work experience from userData
  const parsedEducation = userData.education || [];
  const parsedWorkExperience = userData.workExperience || [];

  // Debug: Log parsed data when it changes
  useEffect(() => {
    console.log('UserData education:', userData.education);
    console.log('UserData workExperience:', userData.workExperience);
    console.log('Parsed education array:', parsedEducation);
    console.log('Parsed work experience array:', parsedWorkExperience);
  }, [userData.education, userData.workExperience, parsedEducation, parsedWorkExperience]);

  // Auto-fill when verification type changes to education
  useEffect(() => {
    if (verificationType === 'education' && parsedEducation.length > 0) {
      console.log('=== useEffect triggered: Education type selected');
      console.log('=== parsedEducation:', JSON.stringify(parsedEducation, null, 2));
      
      if (parsedEducation.length === 1 && !verificationEntity) {
        // Only one education entry - autofill directly if not already filled
        const education = parsedEducation[0];
        console.log('=== useEffect: Auto-filling with single education:', JSON.stringify(education, null, 2));
        
        if (education && education.institution) {
          console.log('=== useEffect: Setting institution to:', education.institution);
          setVerificationEntity(education.institution);
          
          // Build degree text
          let degreeText = '';
          if (education.degree && education.field) {
            degreeText = `${education.degree} in ${education.field}`;
          } else if (education.degree) {
            degreeText = education.degree;
          } else if (education.field) {
            degreeText = education.field;
          }
          
          if (education.year) {
            degreeText += ` (${education.year})`;
          }
          
          if (degreeText && !verificationDetails) {
            setVerificationDetails(degreeText);
            console.log('=== useEffect: Set details to:', degreeText);
          }
        } else {
          console.error('=== useEffect: Education entry missing institution!', education);
        }
      } else if (parsedEducation.length > 1 && !showEducationSelector) {
        // Multiple education entries - show selector
        console.log('=== useEffect: Multiple education entries found, showing selector');
        setShowEducationSelector(true);
      }
    }
  }, [verificationType, parsedEducation, verificationEntity, verificationDetails, showEducationSelector]);

  // Handle verification type change - autofill education if selected
  const handleVerificationTypeChange = (type: string) => {
    console.log('=== Verification type changed to:', type);
    console.log('=== Current parsed education data:', JSON.stringify(parsedEducation, null, 2));
    console.log('=== Current parsed work experience data:', JSON.stringify(parsedWorkExperience, null, 2));
    console.log('=== Full userData:', JSON.stringify(userData, null, 2));
    console.log('=== userData.education:', userData.education);
    console.log('=== parsedEducation.length:', parsedEducation.length);
    
    setVerificationType(type);
    setSelectedEducationIndex(null);
    setShowEducationSelector(false);
    
    // Use setTimeout to ensure state updates happen after Select component finishes
    setTimeout(() => {
      // Re-fetch education data in case it was just set
      const currentEducation = userData.education || [];
      console.log('=== Inside setTimeout - currentEducation:', JSON.stringify(currentEducation, null, 2));
      
      if (type === 'education' && currentEducation.length > 0) {
        console.log('=== Education selected, found', currentEducation.length, 'education entries');
        
        if (currentEducation.length === 1) {
          // Only one education entry - autofill directly
          const education = currentEducation[0];
          console.log('=== Auto-filling with single education:', JSON.stringify(education, null, 2));
          
          if (education && education.institution) {
            console.log('=== Setting institution name to:', education.institution);
            setVerificationEntity(education.institution);
            
            // Build degree text
            let degreeText = '';
            if (education.degree && education.field) {
              degreeText = `${education.degree} in ${education.field}`;
            } else if (education.degree) {
              degreeText = education.degree;
            } else if (education.field) {
              degreeText = education.field;
            }
            
            if (education.year) {
              degreeText += ` (${education.year})`;
            }
            
            if (degreeText) {
              setVerificationDetails(degreeText);
              console.log('=== Set details to:', degreeText);
            }
          } else {
            console.error('=== Education entry missing institution field!', education);
            console.error('=== Available fields:', Object.keys(education || {}));
          }
        } else {
          // Multiple education entries - show selector
          console.log('=== Multiple education entries found, showing selector');
          setShowEducationSelector(true);
          setVerificationEntity('');
          setVerificationDetails('');
        }
      } else if (type === 'employment' && parsedWorkExperience.length > 0) {
        // Could also autofill from work experience if needed
        setVerificationEntity('');
        setVerificationDetails('');
      } else {
        if (type === 'education') {
          console.warn('=== Education type selected but no parsed education data found!');
          console.warn('=== userData.education:', userData.education);
          console.warn('=== currentEducation array:', currentEducation);
          console.warn('=== currentEducation.length:', currentEducation.length);
        }
        setVerificationEntity('');
        setVerificationDetails('');
      }
    }, 100);
  };

  // Handle education selection
  const handleEducationSelect = (index: number) => {
    setSelectedEducationIndex(index);
    const selectedEducation = parsedEducation[index];
    console.log('Education selected at index', index, ':', selectedEducation);
    
    if (selectedEducation.institution) {
      setVerificationEntity(selectedEducation.institution);
      console.log('Set institution name to:', selectedEducation.institution);
    } else {
      console.warn('Selected education missing institution field:', selectedEducation);
    }
    
    // Build degree text
    let degreeText = '';
    if (selectedEducation.degree && selectedEducation.field) {
      degreeText = `${selectedEducation.degree} in ${selectedEducation.field}`;
    } else if (selectedEducation.degree) {
      degreeText = selectedEducation.degree;
    } else if (selectedEducation.field) {
      degreeText = selectedEducation.field;
    }
    
    if (selectedEducation.year) {
      degreeText += ` (${selectedEducation.year})`;
    }
    
    if (degreeText) {
      setVerificationDetails(degreeText);
      console.log('Set details to:', degreeText);
    }
    
    setShowEducationSelector(false);
  };

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create verification request
    const requestId = Date.now().toString();
    let workText = '';
    
    if (verificationType === 'education') {
      const education = selectedEducationIndex !== null 
        ? parsedEducation[selectedEducationIndex]
        : parsedEducation[0];
      workText = `${education?.degree || verificationDetails} from ${verificationEntity}`;
    } else {
      workText = verificationEntity;
    }
    
    const newRequest: VerificationRequest = {
      id: requestId,
      work: workText,
      time: 'Just now',
      status: 'pending',
    };

    // Add to verification queue
    setVerificationQueue(prev => [newRequest, ...prev]);

    toast.success('Verification request submitted!');
    setShowVerificationModal(false);
    setVerificationType('');
    setVerificationEntity('');
    setVerificationDetails('');
    setSelectedEducationIndex(null);
    setShowEducationSelector(false);
  };

  const handleShareResume = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Resume shared with ${recipientEmail}!`);
    setShowShareResumeModal(false);
    setRecipientEmail('');
    setShareMessage('');
  };

  const handleUpdateProfileSuccess = () => {
    // Refresh user data after successful update
    // In a real app, you'd fetch the updated profile from the backend
    toast.success('Profile updated successfully!');
    window.location.reload(); // Simple refresh - in production, fetch updated data
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

                <Button 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                  onClick={() => setShowUpdateProfileModal(true)}
                >
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
                {verificationQueue.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No verification requests yet</p>
                    <p className="text-xs mt-1">Submit a verification request to get started</p>
                  </div>
                ) : (
                  verificationQueue.map((item) => (
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
                  ))
                )}
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
                <Select value={verificationType} onValueChange={handleVerificationTypeChange} required>
                  <SelectTrigger className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employment">Employment History</SelectItem>
                    <SelectItem value="education">Education Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Education Selector - shown when multiple education entries exist */}
              {showEducationSelector && parsedEducation.length > 1 && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <Label className="text-teal-700 mb-3 block">Select Education to Verify</Label>
                  <div className="space-y-2">
                    {parsedEducation.map((edu, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEducationSelect(index)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedEducationIndex === index
                            ? 'border-teal-500 bg-teal-100'
                            : 'border-teal-200 bg-white hover:border-teal-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900">{edu.degree} in {edu.field}</div>
                        <div className="text-sm text-slate-600">{edu.institution}</div>
                        {edu.year && <div className="text-xs text-slate-500 mt-1">{edu.year}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-teal-700 mb-2 block">
                  {verificationType === 'education' ? 'Institution Name' : 'Company Name'}
                  {verificationType === 'education' && parsedEducation.length > 0 && (
                    <span className="text-xs text-teal-500 ml-2">
                      (Auto-filled from resume)
                    </span>
                  )}
                </Label>
                <Input
                  value={verificationEntity}
                  onChange={(e) => {
                    console.log('=== Institution field manually changed to:', e.target.value);
                    setVerificationEntity(e.target.value);
                  }}
                  placeholder={verificationType === 'education' ? 'e.g., MIT, Stanford, etc.' : 'e.g., Google, Microsoft, etc.'}
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                />
                {verificationType === 'education' && parsedEducation.length > 0 && !verificationEntity && (
                  <p className="text-xs text-amber-600 mt-1">
                    Debug: Education data found but not filled. Check console for details.
                  </p>
                )}
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

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateProfileModal}
        onClose={() => setShowUpdateProfileModal(false)}
        currentUserData={userData}
        onUpdateSuccess={handleUpdateProfileSuccess}
      />
    </div>
  );
}