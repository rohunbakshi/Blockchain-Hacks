import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VerificationBadge {
  id: string;
  label: string;
  type: 'education' | 'work';
}

interface ProfileCardProps {
  name: string;
  walletAddress: string;
  profileImageUrl?: string;
  badges: VerificationBadge[];
  summary: string;
  onUpdateProfile: () => void;
}

export function ProfileCard({
  name,
  walletAddress,
  profileImageUrl,
  badges,
  summary,
  onUpdateProfile,
}: ProfileCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      {/* Profile Picture */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {profileImageUrl ? (
            <ImageWithFallback
              src={profileImageUrl}
              alt={name}
              className="w-[120px] h-[120px] rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center border-4 border-gray-100">
              <span className="text-white text-4xl">
                {name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#10b981] rounded-full border-4 border-white"></div>
        </div>
      </div>

      {/* Name */}
      <h2 className="text-center text-[#111827] mb-2">{name}</h2>

      {/* Wallet Address */}
      <div className="text-center mb-4">
        <code className="text-xs text-[#6b7280] bg-gray-100 px-3 py-1 rounded-full">
          {walletAddress}
        </code>
      </div>

      {/* Verification Badges */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {badges.map((badge) => (
          <Badge
            key={badge.id}
            className={`${
              badge.type === 'education'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            } border-0`}
          >
            <span className="mr-1">✓</span>
            {badge.label}
          </Badge>
        ))}
      </div>

      {/* Summary */}
      <p className="text-sm text-[#6b7280] text-center mb-6 leading-relaxed">
        {summary}
      </p>

      {/* Update Profile Button */}
      <Button
        variant="outline"
        className="w-full border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white transition-colors"
        onClick={onUpdateProfile}
      >
        Update Profile
      </Button>
    </div>
  );
}
