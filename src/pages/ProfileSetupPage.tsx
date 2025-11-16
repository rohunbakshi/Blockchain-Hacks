import { useState, useRef } from 'react';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, FileText, User, ArrowRight, Loader2, Sparkles, Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { parseResumeFile } from '../utils/resumeParser';

export function ProfileSetupPage() {
  const { navigateTo, userData, setUserData, registerUser } = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [lastFourSSN, setLastFourSSN] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isParsingResume, setIsParsingResume] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Helper function to validate password
  const isPasswordValid = (pwd: string, firstName: string, lastName: string): boolean => {
    if (!pwd || pwd.length < 6) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return false;
    if (/[\s_]/.test(pwd)) return false;
    
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    const passwordLower = pwd.toLowerCase();
    
    if (firstNameLower && passwordLower.includes(firstNameLower)) return false;
    if (lastNameLower && passwordLower.includes(lastNameLower)) return false;
    
    return true;
  };

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

  /**
   * Check if a file is a resume (PDF, DOC, DOCX)
   */
  const isResumeFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    return (
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx') ||
      fileType === 'application/pdf' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  };

  /**
   * Auto-fill form fields with parsed resume data
   * Always fills fields if data is available (overwrites existing values)
   */
  const applyParsedData = (parsed: any) => {
    console.log('Applying parsed data to form:', parsed);
    
    let fieldsUpdated = 0;

    // Fill first name if available
    if (parsed.firstName) {
      const cleanFirstName = parsed.firstName.trim();
      if (cleanFirstName) {
        setFirstName(cleanFirstName);
        fieldsUpdated++;
        console.log('Set firstName:', cleanFirstName);
      }
    }

    // Fill last name if available
    if (parsed.lastName) {
      const cleanLastName = parsed.lastName.trim();
      if (cleanLastName) {
        setLastName(cleanLastName);
        fieldsUpdated++;
        console.log('Set lastName:', cleanLastName);
      }
    }

    // If full name is available but firstName/lastName aren't, try to split
    if (!parsed.firstName && !parsed.lastName && parsed.email) {
      // Try to extract name from email
      const emailName = parsed.email.split('@')[0];
      const nameParts = emailName.split(/[._-]/);
      if (nameParts.length >= 2) {
        setFirstName(nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1));
        setLastName(nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1));
        fieldsUpdated += 2;
        console.log('Extracted name from email:', nameParts[0], nameParts[nameParts.length - 1]);
      }
    }

    // Fill age if available
    if (parsed.age) {
      const cleanAge = parsed.age.toString().trim();
      if (cleanAge) {
        setAge(cleanAge);
        fieldsUpdated++;
        console.log('Set age:', cleanAge);
      }
    }

    // Fill gender if available
    if (parsed.gender) {
      // Map common gender values to our select options
      const genderMap: { [key: string]: string } = {
        'male': 'male',
        'm': 'male',
        'man': 'male',
        'female': 'female',
        'f': 'female',
        'woman': 'female',
        'non-binary': 'non-binary',
        'nonbinary': 'non-binary',
        'nb': 'non-binary',
      };
      const normalizedGender = parsed.gender.toLowerCase().trim();
      if (genderMap[normalizedGender]) {
        setGender(genderMap[normalizedGender]);
        fieldsUpdated++;
        console.log('Set gender:', genderMap[normalizedGender]);
      }
    }

    // Fill email if available
    if (parsed.email) {
      const cleanEmail = parsed.email.trim().toLowerCase();
      if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setEmail(cleanEmail);
        fieldsUpdated++;
        console.log('Set email:', cleanEmail);
      }
    }

    // Fill phone if available
    if (parsed.phone) {
      const cleanPhone = parsed.phone.trim();
      // Remove common formatting to store clean version
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      if (digitsOnly.length >= 10) {
        setPhone(cleanPhone);
        fieldsUpdated++;
        console.log('Set phone:', cleanPhone);
      }
    }

    console.log(`Applied ${fieldsUpdated} fields from parsed resume data`);
    
    return fieldsUpdated;
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Find resume files
    const resumeFiles = files.filter(isResumeFile);
    const otherFiles = files.filter(file => !isResumeFile(file));

    // Add all files to uploaded list
    setUploadedFiles(prev => [...prev, ...files]);

    // If there are resume files, parse them
    if (resumeFiles.length > 0) {
      setIsParsingResume(true);
      toast.info(`Parsing ${resumeFiles.length} resume(s) with AI...`, {
        position: 'top-right',
      });

      try {
        // Parse the first resume file
        const firstResume = resumeFiles[0];
        console.log('Parsing resume file:', firstResume.name, firstResume.type);
        
        const parsed = await parseResumeFile(firstResume);
        console.log('Resume parsed, received data:', parsed);

        // Auto-fill form fields
        const fieldsUpdated = applyParsedData(parsed);

        // Store parsed education and work experience data in userData for later use
        if (parsed.education || parsed.workExperience) {
          setUserData({
            education: parsed.education || [],
            workExperience: parsed.workExperience || [],
          });
          console.log('Stored parsed resume data:', {
            education: parsed.education?.length || 0,
            workExperience: parsed.workExperience?.length || 0,
          });
        }

        if (fieldsUpdated > 0) {
          toast.success(`Resume parsed successfully! Auto-filled ${fieldsUpdated} field(s).`, {
            position: 'top-right',
            duration: 4000,
          });
        } else {
          toast.warning('Resume parsed but no matching fields were found. Please fill the form manually.', {
            position: 'top-right',
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error('Resume parsing error:', error);
        console.error('Error stack:', error.stack);
        
        // Show detailed error message
        const errorMessage = error.message || 'Failed to parse resume';
        toast.error(`Parsing failed: ${errorMessage}. Check console for details. You can still fill the form manually.`, {
          position: 'top-right',
          duration: 6000,
        });
      } finally {
        setIsParsingResume(false);
      }
    } else {
      // Non-resume files
      if (otherFiles.length > 0) {
        toast.success(`${otherFiles.length} document(s) uploaded`, {
          position: 'top-right',
        });
      }
    }
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

    if (!gender || !gender.trim()) {
      toast.error('Gender is required');
      return;
    }

    if (!lastFourSSN || !lastFourSSN.trim()) {
      toast.error('Last 4 digits of SSN is required');
      return;
    }

    // Validate last 4 SSN is exactly 4 digits
    const ssnRegex = /^\d{4}$/;
    if (!ssnRegex.test(lastFourSSN)) {
      toast.error('Last 4 SSN must be exactly 4 digits');
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone
    if (!phone || !phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Phone validation: accepts formats like (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, etc.
    const phoneRegex = /^[\d\s\-\(\)\.\+]+$/;
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneRegex.test(phone.trim()) || phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate password
    if (!password || !password.trim()) {
      toast.error('Password is required');
      return;
    }

    const passwordErrors: string[] = [];

    // Check length
    if (password.length < 6) {
      passwordErrors.push('at least 6 characters long');
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }

    // Check for special character (excluding underscore since it's not allowed)
    if (!/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      passwordErrors.push('one special character');
    }

    // Check for spaces, underscores, and similar
    if (/[\s_]/.test(password)) {
      passwordErrors.push('no spaces or underscores');
    }

    // Check if password contains first name or last name (case-insensitive)
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    const passwordLower = password.toLowerCase();

    if (firstNameLower && passwordLower.includes(firstNameLower)) {
      passwordErrors.push('cannot contain your first name');
    }

    if (lastNameLower && passwordLower.includes(lastNameLower)) {
      passwordErrors.push('cannot contain your last name');
    }

    if (passwordErrors.length > 0) {
      toast.error(`Password must have: ${passwordErrors.join(', ')}`);
      return;
    }

    // Validate confirm password
    if (!confirmPassword || !confirmPassword.trim()) {
      toast.error('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Register the email address
    const emailLower = email.trim().toLowerCase();
    registerUser(emailLower);
    
    // Save user data - preserve existing education and workExperience from resume parsing
    setUserData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      age: ageNum.toString(),
      lastFourSSN: lastFourSSN.trim(),
      profileImage,
      documents: uploadedFiles,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim(),
      // Preserve parsed resume data (education and workExperience)
      education: userData.education || [],
      workExperience: userData.workExperience || [],
    });

    console.log('Profile saved with data:', {
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      education: userData.education?.length || 0,
      workExperience: userData.workExperience?.length || 0,
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
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Bob"
                    className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                      !firstName ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="text-teal-700 mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Jones"
                    className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                      !lastName ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-teal-700 mb-2 block">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
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

                {/* Age and Last 4 SSN */}
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
                      className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                        !age ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                      }`}
                      placeholder="25"
                      required
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
                      className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                        !lastFourSSN || lastFourSSN.length !== 4 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-teal-200/50 focus:border-teal-500'
                      }`}
                      placeholder="1234"
                      required
                    />
                    {lastFourSSN && lastFourSSN.length !== 4 && (
                      <p className="text-xs text-red-500 mt-1">Must be exactly 4 digits</p>
                    )}
                    {!lastFourSSN && (
                      <p className="text-xs text-red-500 mt-1">Last 4 SSN is required</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-teal-700 mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                      !email ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    required
                  />
                  {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-teal-700 mb-2 block">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      // Allow digits, spaces, dashes, parentheses, dots, and plus sign
                      const value = e.target.value.replace(/[^\d\s\-\(\)\.\+]/g, '');
                      setPhone(value);
                    }}
                    placeholder="(123) 456-7890"
                    className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 ${
                      !phone ? 'border-red-300 focus:border-red-500' : 'border-teal-200/50 focus:border-teal-500'
                    }`}
                    required
                  />
                  {phone && phone.replace(/\D/g, '').length < 10 && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid phone number (at least 10 digits)</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-teal-700 mb-2 block">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        // Prevent spaces and underscores
                        const value = e.target.value.replace(/[\s_]/g, '');
                        setPassword(value);
                      }}
                      placeholder="Enter password"
                      className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 pr-14 ${
                        !password || !isPasswordValid(password, firstName, lastName)
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-teal-200/50 focus:border-teal-500'
                      }`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1 space-y-1">
                      {password.length < 6 && (
                        <p className="text-xs text-red-500">✗ At least 6 characters</p>
                      )}
                      {!/[A-Z]/.test(password) && (
                        <p className="text-xs text-red-500">✗ One uppercase letter</p>
                      )}
                      {!/[a-z]/.test(password) && (
                        <p className="text-xs text-red-500">✗ One lowercase letter</p>
                      )}
                      {!/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                        <p className="text-xs text-red-500">✗ One special character</p>
                      )}
                      {/[\s_]/.test(password) && (
                        <p className="text-xs text-red-500">✗ No spaces or underscores</p>
                      )}
                      {firstName.trim() && password.toLowerCase().includes(firstName.trim().toLowerCase()) && (
                        <p className="text-xs text-red-500">✗ Cannot contain first name</p>
                      )}
                      {lastName.trim() && password.toLowerCase().includes(lastName.trim().toLowerCase()) && (
                        <p className="text-xs text-red-500">✗ Cannot contain last name</p>
                      )}
                      {isPasswordValid(password, firstName, lastName) && (
                        <p className="text-xs text-green-600">✓ Password meets all requirements</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Requirements: 6+ characters, 1 uppercase, 1 lowercase, 1 special character, no spaces/underscores, cannot contain your name
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-teal-700 mb-2 block">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`border-2 rounded-xl bg-white/50 backdrop-blur-sm h-12 pr-14 ${
                        !confirmPassword 
                          ? 'border-red-300 focus:border-red-500' 
                          : password !== confirmPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-teal-200/50 focus:border-teal-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Wallet ID */}
                <div>
                  <Label className="text-teal-700 mb-2 block">
                    Wallet ID <span className="text-sm text-slate-500">(Auto-filled)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={userData.walletAddress || ''}
                      disabled
                      className="border-2 border-slate-200 rounded-xl bg-slate-50 h-12 pr-12"
                    />
                    {userData.walletAddress && (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(userData.walletAddress || '');
                            toast.success('Wallet ID copied to clipboard!');
                          } catch (error) {
                            console.error('Failed to copy:', error);
                            toast.error('Failed to copy to clipboard');
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        type="button"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Upload Documents */}
            <div className="bg-white/80 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-xl p-10">
              <h2 className="text-2xl text-slate-900 mb-6">Upload Documents</h2>
              
              <div
                onClick={() => !isParsingResume && documentInputRef.current?.click()}
                className={`border-3 border-dashed border-teal-300 rounded-3xl min-h-[400px] flex flex-col items-center justify-center transition-all p-8 group bg-gradient-to-br from-teal-50/30 to-cyan-50/30 ${
                  isParsingResume 
                    ? 'cursor-not-allowed opacity-75' 
                    : 'cursor-pointer hover:bg-teal-50/50 hover:border-teal-400'
                }`}
              >
                {isParsingResume ? (
                  <>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <p className="text-xl text-slate-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      Parsing Resume with AI...
                    </p>
                    <p className="text-sm text-slate-600 text-center max-w-md">
                      Extracting information from your resume. This may take a few moments.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl text-slate-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      Upload Documents
                    </p>
                    <p className="text-sm text-slate-600 text-center max-w-md">
                      Click to upload resumes, transcripts, certificates, or other credentials.
                      <br />
                      <span className="text-teal-600 font-medium">Resumes will be automatically parsed with AI!</span>
                    </p>
                  </>
                )}
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
                    {uploadedFiles.map((file, index) => {
                      const isResume = isResumeFile(file);
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            isResume
                              ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200/50'
                              : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200/50'
                          }`}
                        >
                          {isResume ? (
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-teal-600" />
                          )}
                          <span className="text-sm text-slate-700 flex-1">{file.name}</span>
                          {isResume && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                              AI Parsed
                            </span>
                          )}
                        </div>
                      );
                    })}
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