import { useState } from 'react';
import { ShieldCheck, Lock, UserCog } from 'lucide-react';
import { TopNavigation } from '../components/TopNavigation';
import { ProfileCard } from '../components/ProfileCard';
import { ActionCard } from '../components/ActionCard';
import { VerificationRequestModal } from '../components/VerificationRequestModal';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

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
    toast.info('Opening profile editor...');
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
              badges={[
                { id: '1', label: "MIT '98", type: 'education' },
                { id: '2', label: 'Google SWE', type: 'work' },
              ]}
              summary="Computer Science @ MIT | Software Engineer @ Google | 3 verified credentials"
              onUpdateProfile={handleUpdateProfile}
            />
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
    </div>
  );
}
