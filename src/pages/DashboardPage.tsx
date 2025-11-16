import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, UserCog, Plus } from 'lucide-react';
import { TopNavigation } from '../components/TopNavigation';
import { ProfileCard } from '../components/ProfileCard';
import { ActionCard } from '../components/ActionCard';
import { VerificationRequestModal } from '../components/VerificationRequestModal';
import { UpdateProfileModal } from '../components/UpdateProfileModal';
import { CredentialModal } from '../components/CredentialModal';
import { Button } from '../components/ui/button';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';
import {
  getUserCredentials,
  EducationCredential,
  EmploymentCredential,
} from '../services/api';

// Mock data
const mockExperiences = [
  {
    id: '1',
    title: 'Bachelor of Science in Computer Science',
    organization: 'MIT',
    type: 'education' as const,
    verified: true,
  },
  {
    id: '2',
    title: 'Software Engineer',
    organization: 'Google',
    type: 'work' as const,
    verified: true,
  },
  {
    id: '3',
    title: 'Frontend Developer Intern',
    organization: 'Meta',
    type: 'work' as const,
    verified: false,
  },
  {
    id: '4',
    title: 'Teaching Assistant',
    organization: 'MIT CSAIL',
    type: 'work' as const,
    verified: false,
  },
];

export function DashboardPage() {
  const { userData } = useRouter();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialType, setCredentialType] = useState<'education' | 'employment' | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<EducationCredential | EmploymentCredential | null>(null);
  
  const [educationCredentials, setEducationCredentials] = useState<EducationCredential[]>([]);
  const [employmentCredentials, setEmploymentCredentials] = useState<EmploymentCredential[]>([]);

  const handleRequestVerification = (experienceId: string) => {
    const experience = mockExperiences.find(exp => exp.id === experienceId);
    if (experience) {
      toast.success(`Verification request sent to ${experience.organization}!`);
      setIsVerificationModalOpen(false);
    }
  };

  const handleStakeResume = () => {
    toast.info('Staking feature coming soon! You\'ll be able to earn 15-25% APY.');
  };

  const handleUpdateProfile = () => {
    setShowUpdateProfileModal(true);
  };

  const handleUpdateProfileSuccess = () => {
    // Refresh user data after successful update
    toast.success('Profile updated successfully!');
    window.location.reload(); // Simple refresh - in production, fetch updated data
  };

  // Load credentials
  useEffect(() => {
    const loadCredentials = async () => {
      if (!userData.walletAddress) {
        return;
      }

      try {
        const credentials = await getUserCredentials(userData.walletAddress);
        setEducationCredentials(credentials.education || []);
        setEmploymentCredentials(credentials.employment || []);
      } catch (error) {
        console.error('Failed to load credentials:', error);
        // Don't show error toast on initial load if profile doesn't exist yet
      }
    };

    loadCredentials();
  }, [userData.walletAddress]);

  const handleCredentialSuccess = async () => {
    if (!userData.walletAddress) return;

    try {
      const credentials = await getUserCredentials(userData.walletAddress);
      setEducationCredentials(credentials.education || []);
      setEmploymentCredentials(credentials.employment || []);
    } catch (error) {
      console.error('Failed to reload credentials:', error);
    }
  };

  const handleBadgeClick = (badge: { id: string; label: string; type: 'education' | 'work' }) => {
    if (badge.type === 'education') {
      const cred = educationCredentials.find(e => e.id === badge.id);
      setSelectedCredential(cred || null);
      setCredentialType('education');
    } else {
      const cred = employmentCredentials.find(e => e.id === badge.id);
      setSelectedCredential(cred || null);
      setCredentialType('employment');
    }
    setShowCredentialModal(true);
  };

  const handleAddEducation = () => {
    setSelectedCredential(null);
    setCredentialType('education');
    setShowCredentialModal(true);
  };

  const handleAddEmployment = () => {
    setSelectedCredential(null);
    setCredentialType('employment');
    setShowCredentialModal(true);
  };

  // Convert credentials to badges
  const badges = [
    ...educationCredentials.map(edu => ({
      id: edu.id,
      label: `${edu.school} '${edu.graduationYear.slice(-2)}`,
      type: 'education' as const,
    })),
    ...employmentCredentials.map(emp => ({
      id: emp.id,
      label: emp.company,
      type: 'work' as const,
    })),
  ];

  // Generate summary
  const generateSummary = () => {
    const parts: string[] = [];
    
    if (educationCredentials.length > 0) {
      const edu = educationCredentials[0];
      const fieldPart = edu.fieldOfStudy ? `${edu.fieldOfStudy} @ ` : '';
      parts.push(`${fieldPart}${edu.school}`);
    }
    
    if (employmentCredentials.length > 0) {
      const emp = employmentCredentials[0];
      parts.push(`${emp.position} @ ${emp.company}`);
    }
    
    const verifiedCount = educationCredentials.filter(e => e.verified).length +
                         employmentCredentials.filter(e => e.verified).length;
    if (verifiedCount > 0) {
      parts.push(`${verifiedCount} verified credential${verifiedCount !== 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Add your credentials to get started';
  };

  // Use data from profile setup or fallback to mock data
  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : 'Bob Jones';
  
  const profileImageUrl = userData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-6">
          {/* Left Section - Profile Card */}
          <div className="lg:sticky lg:top-8 h-fit">
            <ProfileCard
              name={displayName}
              walletAddress={userData.walletAddress || '0xM.E.T...98'}
              profileImageUrl={profileImageUrl}
              badges={badges}
              summary={generateSummary()}
              onUpdateProfile={handleUpdateProfile}
              onBadgeClick={handleBadgeClick}
            />
            
            {/* Add Credentials Buttons */}
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={handleAddEducation}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
              <Button
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={handleAddEmployment}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employment
              </Button>
            </div>
          </div>

          {/* Right Section - Action Cards */}
          <div className="space-y-6">
            {/* Request Verification Card */}
            <ActionCard
              icon={ShieldCheck}
              title="Request Verification"
              description="Ask employers or institutions to verify your credentials"
              buttonText="Request Verification"
              buttonVariant="default"
              onAction={() => setIsVerificationModalOpen(true)}
            >
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-[#6b7280]">
                  <span className="text-[#111827]">2 unverified experiences</span> ready for verification
                </p>
              </div>
            </ActionCard>

            {/* Staking Card */}
            <ActionCard
              icon={Lock}
              title="Stake Your Resume"
              description="Earn 15-25% APY by staking your verified credentials"
              buttonText="Stake & Earn"
              buttonVariant="default"
              onAction={handleStakeResume}
            >
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-[#6b7280] mb-1">Current Status</p>
                  <p className="text-sm text-[#111827]">Not currently staking</p>
                </div>
                <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-lg p-3 border border-[#667eea]/20">
                  <p className="text-xs text-[#667eea]">
                    <span className="text-[#111827]">523 students</span> earning{' '}
                    <span className="text-[#111827]">$247k combined</span>
                  </p>
                </div>
              </div>
            </ActionCard>

            {/* Profile Management Card */}
            <ActionCard
              icon={UserCog}
              title="Update Profile"
              description="Edit your information, add credentials, manage privacy"
              buttonText="Edit Profile"
              buttonVariant="outline"
              onAction={handleUpdateProfile}
            >
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-[#6b7280]">
                  Last updated: <span className="text-[#111827]">3 days ago</span>
                </p>
              </div>
            </ActionCard>
          </div>
        </div>
      </main>

      {/* Verification Request Modal */}
      <VerificationRequestModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        experiences={mockExperiences}
        onRequestVerification={handleRequestVerification}
      />

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateProfileModal}
        onClose={() => setShowUpdateProfileModal(false)}
        currentUserData={userData}
        onUpdateSuccess={handleUpdateProfileSuccess}
      />

      {/* Credential Modal */}
      {userData.walletAddress && (
        <CredentialModal
          isOpen={showCredentialModal}
          onClose={() => {
            setShowCredentialModal(false);
            setSelectedCredential(null);
            setCredentialType(null);
          }}
          walletAddress={userData.walletAddress}
          type={credentialType}
          credential={selectedCredential}
          onSuccess={handleCredentialSuccess}
        />
      )}
    </div>
  );
}
