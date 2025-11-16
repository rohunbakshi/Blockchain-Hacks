import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { updateUserProfile, getUserProfile } from '../services/api';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserData: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    age?: string;
    lastFourSSN?: string;
    profileImage?: string;
    walletAddress?: string;
  };
  onUpdateSuccess: () => void;
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  currentUserData,
  onUpdateSuccess,
}: UpdateProfileModalProps) {
  const [profileImage, setProfileImage] = useState<string>(currentUserData.profileImage || '');
  const [firstName, setFirstName] = useState(currentUserData.firstName || '');
  const [lastName, setLastName] = useState(currentUserData.lastName || '');
  const [gender, setGender] = useState(currentUserData.gender || '');
  const [age, setAge] = useState(currentUserData.age || '');
  const [lastFourSSN, setLastFourSSN] = useState(currentUserData.lastFourSSN || '');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load current profile data when modal opens
      loadUserProfile();
    }
  }, [isOpen, currentUserData]);

  const loadUserProfile = async () => {
    try {
      if (currentUserData.walletAddress) {
        const profile = await getUserProfile(currentUserData.walletAddress);
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setGender(profile.gender || '');
          setAge(profile.age || '');
          setLastFourSSN(profile.lastFourSSN || '');
          setProfileImage(profile.profileImage || '');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB max
    if (validFiles.length !== files.length) {
      toast.error('Some files exceed 10MB limit');
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} document(s) uploaded`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !age) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentUserData.walletAddress) {
      toast.error('Wallet address is required');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('walletAddress', currentUserData.walletAddress);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('gender', gender);
      formData.append('age', age);
      formData.append('lastFourSSN', lastFourSSN);
      
      // Handle profile image - if it's a base64 string, send as-is
      if (profileImage && profileImage.startsWith('data:image')) {
        // Base64 image string - backend will handle conversion
        formData.append('profileImage', profileImage);
      }

      uploadedFiles.forEach((file) => {
        formData.append('documents', file);
      });

      await updateUserProfile(formData);
      toast.success('Profile updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-teal-200/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-teal-200/50 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl text-slate-900">Update Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-teal-50 rounded-xl transition-all"
            disabled={isLoading}
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section - Profile Form */}
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-teal-400 flex items-center justify-center bg-teal-50">
                      <User className="w-16 h-16 text-teal-400" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div>
                <Label htmlFor="firstName" className="text-teal-700 mb-2 block">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Bob"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-teal-700 mb-2 block">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Jones"
                  className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-teal-700 mb-2 block">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                  <SelectTrigger className="border-2 border-teal-200/50 focus:ring-teal-500 rounded-xl h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-teal-700 mb-2 block">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="ssn" className="text-teal-700 mb-2 block">
                    Last 4 SSN
                  </Label>
                  <Input
                    id="ssn"
                    type="text"
                    maxLength={4}
                    value={lastFourSSN}
                    onChange={(e) => setLastFourSSN(e.target.value.replace(/\D/g, ''))}
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl h-12"
                    placeholder="****"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-teal-700 mb-2 block">
                  Wallet ID
                </Label>
                <Input
                  value={currentUserData.walletAddress || ''}
                  disabled
                  className="border-2 border-slate-200 rounded-xl bg-slate-50 h-12"
                />
              </div>
            </div>

            {/* Right Section - Upload Documents */}
            <div className="space-y-6">
              <div>
                <Label className="text-teal-700 mb-2 block">
                  Upload Documents
                </Label>
                <div
                  onClick={() => !isLoading && documentInputRef.current?.click()}
                  className="border-3 border-dashed border-teal-300 rounded-3xl min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-400 transition-all p-8 group bg-gradient-to-br from-teal-50/30 to-cyan-50/30"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl text-slate-900 mb-2">Upload Documents</p>
                  <p className="text-sm text-slate-600 text-center max-w-md">
                    Click to upload resumes, transcripts, certificates, or other credentials (Max 10MB per file)
                  </p>
                </div>

                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  disabled={isLoading}
                />

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm text-slate-600 mb-3">New Files:</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-teal-600" />
                            <span className="text-sm text-slate-700">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-teal-200/50">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-slate-300 hover:bg-slate-50 h-12 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

