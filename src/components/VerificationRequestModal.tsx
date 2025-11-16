import { X, Building2, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Experience {
  id: string;
  title: string;
  organization: string;
  type: 'education' | 'work';
  verified: boolean;
}

interface VerificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiences: Experience[];
  onRequestVerification: (experienceId: string) => void;
}

export function VerificationRequestModal({
  isOpen,
  onClose,
  experiences,
  onRequestVerification,
}: VerificationRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[#111827]">Request Verification</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <p className="text-sm text-[#6b7280] mb-6">
            Select an experience from your resume to request verification from the institution or employer.
          </p>

          <div className="space-y-4">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#667eea] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      experience.type === 'education' 
                        ? 'bg-blue-100' 
                        : 'bg-purple-100'
                    }`}>
                      {experience.type === 'education' ? (
                        <GraduationCap className={`w-5 h-5 ${
                          experience.type === 'education' 
                            ? 'text-blue-600' 
                            : 'text-purple-600'
                        }`} />
                      ) : (
                        <Building2 className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#111827] mb-1">{experience.title}</h4>
                      <p className="text-sm text-[#6b7280] mb-2">{experience.organization}</p>
                      {experience.verified && (
                        <Badge className="bg-[#10b981] text-white hover:bg-[#10b981] border-0">
                          <span className="mr-1">✓</span>
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={experience.verified ? 'outline' : 'default'}
                    className={
                      experience.verified
                        ? 'border-gray-300 text-gray-500'
                        : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white border-0'
                    }
                    disabled={experience.verified}
                    onClick={() => onRequestVerification(experience.id)}
                  >
                    {experience.verified ? 'Verified' : 'Request'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
