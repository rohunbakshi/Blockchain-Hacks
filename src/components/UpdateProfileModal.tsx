import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useRouter } from './Router';

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
    documents?: File[];
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      year?: string;
    }>;
    workExperience?: Array<{
      company: string;
      position: string;
      duration: string;
      description?: string;
    }>;
  };
  onUpdateSuccess: () => void;
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  currentUserData,
  onUpdateSuccess,
}: UpdateProfileModalProps) {
  const { setUserData } = useRouter();
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
      setFirstName(currentUserData.firstName || '');
      setLastName(currentUserData.lastName || '');
      setGender(currentUserData.gender || '');
      setAge(currentUserData.age || '');
      setLastFourSSN(currentUserData.lastFourSSN || '');
      setProfileImage(currentUserData.profileImage || '');
      setUploadedFiles([]); // Reset uploaded files when modal opens
    }
  }, [isOpen, currentUserData]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!firstName || !firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (!lastName || !lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    if (!age || !age.trim()) {
      toast.error('Age is required');
      return;
    }

    // Validate age is a valid positive number
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      toast.error('Please enter a valid age (1-150)');
      return;
    }

    // Validate last 4 SSN if provided
    if (lastFourSSN && lastFourSSN.trim()) {
      const ssnRegex = /^\d{4}$/;
      if (!ssnRegex.test(lastFourSSN.trim())) {
        toast.error('Last 4 SSN must be exactly 4 digits');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Update user data using router context (same as ProfileSetupPage)
      setUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || currentUserData.gender,
        age: ageNum.toString(),
        lastFourSSN: lastFourSSN.trim() || currentUserData.lastFourSSN,
        profileImage: profileImage || currentUserData.profileImage,
        documents: uploadedFiles.length > 0 ? uploadedFiles : currentUserData.documents,
        // Preserve existing education and work experience data
        education: currentUserData.education || [],
        workExperience: currentUserData.workExperience || [],
      });

      console.log('Profile updated successfully:', {
        firstName,
        lastName,
        age: ageNum,
      });

      toast.success('Profile updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
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
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Bob"
                  className={`border-2 rounded-xl h-12 ${
                    !firstName ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-teal-700 mb-2 block">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Jones"
                  className={`border-2 rounded-xl h-12 ${
                    !lastName ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-teal-700 mb-2 block">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select value={gender} onValueChange={setGender} required disabled={isLoading}>
                  <SelectTrigger className={`border-2 rounded-xl h-12 ${
                    !gender ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                  }`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {!gender && (
                  <p className="text-xs text-red-500 mt-1">Gender selection is required</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-teal-700 mb-2 block">
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={age}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      setAge(value);
                    }}
                    className={`border-2 rounded-xl h-12 ${
                      !age ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    placeholder="25"
                    required
                    disabled={isLoading}
                    min="1"
                    max="150"
                  />
                  {age && (isNaN(parseInt(age, 10)) || parseInt(age, 10) <= 0 || parseInt(age, 10) > 150) && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid age (1-150)</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ssn" className="text-teal-700 mb-2 block">
                    Last 4 SSN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ssn"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={lastFourSSN}
                    onChange={(e) => {
                      // Only allow digits, limit to 4
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setLastFourSSN(value);
                    }}
                    className={`border-2 rounded-xl h-12 ${
                      !lastFourSSN || lastFourSSN.length !== 4 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    placeholder="1234"
                    required
                    disabled={isLoading}
                  />
                  {lastFourSSN && lastFourSSN.length !== 4 && (
                    <p className="text-xs text-red-500 mt-1">Must be exactly 4 digits</p>
                  )}
                  {!lastFourSSN && (
                    <p className="text-xs text-red-500 mt-1">Last 4 SSN is required</p>
                  )}
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

