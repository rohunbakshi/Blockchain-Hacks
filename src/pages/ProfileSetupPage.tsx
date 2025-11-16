import { useState, useRef } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, FileText, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSetupPage() {
  const { navigateTo, userData, setUserData } = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [lastFourSSN, setLastFourSSN] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} document(s) uploaded`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !age) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save user data
    setUserData({
      firstName,
      lastName,
      gender,
      age,
      lastFourSSN,
      profileImage,
      documents: uploadedFiles,
    });

    toast.success('Profile created successfully!');
    
    // Navigate to dashboard
    setTimeout(() => {
      navigateTo('dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-12 px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Create Your Profile
            </span>
          </h1>
          <p className="text-slate-600 text-lg">Set up your credentials and upload your documents</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Profile Form */}
            <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 rounded-3xl shadow-xl p-10">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-10">
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
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
                >
                  Upload Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName" className="text-teal-700 mb-2 block">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Bob"
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl bg-white/50 backdrop-blur-sm h-12"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="text-teal-700 mb-2 block">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Jones"
                    className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl bg-white/50 backdrop-blur-sm h-12"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-teal-700 mb-2 block">
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="border-2 border-teal-200/50 focus:ring-teal-500 rounded-xl bg-white/50 backdrop-blur-sm h-12">
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

                {/* Age and Last 4 SSN */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-teal-700 mb-2 block">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl bg-white/50 backdrop-blur-sm h-12"
                      required
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
                      className="border-2 border-teal-200/50 focus:border-teal-500 rounded-xl bg-white/50 backdrop-blur-sm h-12"
                      placeholder="****"
                    />
                  </div>
                </div>

                {/* Wallet ID */}
                <div>
                  <Label className="text-teal-700 mb-2 block">
                    Wallet ID <span className="text-sm text-slate-500">(Auto-filled)</span>
                  </Label>
                  <Input
                    value={userData.walletAddress || ''}
                    disabled
                    className="border-2 border-slate-200 rounded-xl bg-slate-50 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Upload Documents */}
            <div className="bg-white/80 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-xl p-10">
              <h2 className="text-2xl text-slate-900 mb-6">Upload Documents</h2>
              
              <div
                onClick={() => documentInputRef.current?.click()}
                className="border-3 border-dashed border-teal-300 rounded-3xl min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-400 transition-all p-8 group bg-gradient-to-br from-teal-50/30 to-cyan-50/30"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl text-slate-900 mb-2">Upload Documents</p>
                <p className="text-sm text-slate-600 text-center max-w-md">
                  Click to upload resumes, transcripts, certificates, or other credentials
                </p>
              </div>

              <input
                ref={documentInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm text-slate-600 mb-3">Uploaded Files:</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200/50"
                      >
                        <FileText className="w-5 h-5 text-teal-600" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 text-center pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  After creating your account, you'll be taken to your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 flex justify-center">
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-16 py-7 text-xl rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="flex items-center gap-3">
                Create Profile & Continue to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}