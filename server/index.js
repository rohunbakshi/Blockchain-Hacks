import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const profilesDir = path.join(dataDir, 'profiles');

fs.ensureDirSync(dataDir);
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(profilesDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Helper function to get profile file path
const getProfilePath = (walletAddress) => {
  return path.join(profilesDir, `${walletAddress}.json`);
};

// Helper function to read profile
const readProfile = async (walletAddress) => {
  const profilePath = getProfilePath(walletAddress);
  try {
    const data = await fs.readFile(profilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

// Helper function to write profile
const writeProfile = async (walletAddress, profile) => {
  const profilePath = getProfilePath(walletAddress);
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
};

// API Routes

// Get user profile
app.get('/api/users/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const profile = await readProfile(walletAddress);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
app.post('/api/users/update', upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { walletAddress, firstName, lastName, gender, age, lastFourSSN, profileImage } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Get existing profile or create new one
    let profile = await readProfile(walletAddress) || {
      walletAddress,
      createdAt: new Date().toISOString(),
    };

    // Update profile fields
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (gender) profile.gender = gender;
    if (age) profile.age = age;
    if (lastFourSSN) profile.lastFourSSN = lastFourSSN;

    // Handle profile image
    if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
      const imageFile = req.files['profileImage'][0];
      profile.profileImage = `/uploads/${imageFile.filename}`;
    } else if (profileImage && profileImage.startsWith('data:image')) {
      // Handle base64 image from frontend
      const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const imageFilename = `profile-${Date.now()}.png`;
      const imagePath = path.join(uploadsDir, imageFilename);
      await fs.writeFile(imagePath, buffer);
      profile.profileImage = `/uploads/${imageFilename}`;
    }

    // Handle document uploads
    if (req.files && req.files['documents']) {
      const uploadedFiles = req.files['documents'];
      if (!profile.documents) {
        profile.documents = [];
      }
      uploadedFiles.forEach(file => {
        profile.documents.push(`/uploads/${file.filename}`);
      });
    }

    profile.updatedAt = new Date().toISOString();

    // Save profile
    await writeProfile(walletAddress, profile);

    // Return profile with full URLs
    const responseProfile = {
      ...profile,
      profileImage: profile.profileImage ? `http://localhost:${PORT}${profile.profileImage}` : null,
      documents: profile.documents ? profile.documents.map(doc => `http://localhost:${PORT}${doc}`) : [],
    };

    res.json(responseProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Credential Management Endpoints

// Get all credentials for a user
app.get('/api/users/:walletAddress/credentials', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const profile = await readProfile(walletAddress);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const credentials = {
      education: profile.education || [],
      employment: profile.employment || [],
    };

    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add or update education credential
app.post('/api/users/:walletAddress/credentials/education', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { id, school, degree, fieldOfStudy, graduationYear, verified } = req.body;

    if (!school || !graduationYear) {
      return res.status(400).json({ message: 'School and graduation year are required' });
    }

    let profile = await readProfile(walletAddress);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.education) {
      profile.education = [];
    }

    const educationData = {
      id: id || `edu-${Date.now()}`,
      school: school.trim(),
      degree: degree?.trim() || '',
      fieldOfStudy: fieldOfStudy?.trim() || '',
      graduationYear: graduationYear.toString(),
      verified: verified || false,
      createdAt: id ? profile.education.find(e => e.id === id)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      // Update existing
      const index = profile.education.findIndex(e => e.id === id);
      if (index !== -1) {
        profile.education[index] = { ...profile.education[index], ...educationData };
      } else {
        return res.status(404).json({ message: 'Education credential not found' });
      }
    } else {
      // Add new
      profile.education.push(educationData);
    }

    profile.updatedAt = new Date().toISOString();
    await writeProfile(walletAddress, profile);

    res.json(educationData);
  } catch (error) {
    console.error('Error saving education credential:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Add or update employment credential
app.post('/api/users/:walletAddress/credentials/employment', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { id, company, position, startDate, endDate, isCurrent, verified } = req.body;

    if (!company || !position) {
      return res.status(400).json({ message: 'Company and position are required' });
    }

    let profile = await readProfile(walletAddress);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.employment) {
      profile.employment = [];
    }

    const employmentData = {
      id: id || `emp-${Date.now()}`,
      company: company.trim(),
      position: position.trim(),
      startDate: startDate || '',
      endDate: endDate || '',
      isCurrent: isCurrent || false,
      verified: verified || false,
      createdAt: id ? profile.employment.find(e => e.id === id)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      // Update existing
      const index = profile.employment.findIndex(e => e.id === id);
      if (index !== -1) {
        profile.employment[index] = { ...profile.employment[index], ...employmentData };
      } else {
        return res.status(404).json({ message: 'Employment credential not found' });
      }
    } else {
      // Add new
      profile.employment.push(employmentData);
    }

    profile.updatedAt = new Date().toISOString();
    await writeProfile(walletAddress, profile);

    res.json(employmentData);
  } catch (error) {
    console.error('Error saving employment credential:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Delete education credential
app.delete('/api/users/:walletAddress/credentials/education/:id', async (req, res) => {
  try {
    const { walletAddress, id } = req.params;
    const profile = await readProfile(walletAddress);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.education) {
      return res.status(404).json({ message: 'Education credential not found' });
    }

    profile.education = profile.education.filter(e => e.id !== id);
    profile.updatedAt = new Date().toISOString();
    await writeProfile(walletAddress, profile);

    res.json({ message: 'Education credential deleted successfully' });
  } catch (error) {
    console.error('Error deleting education credential:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete employment credential
app.delete('/api/users/:walletAddress/credentials/employment/:id', async (req, res) => {
  try {
    const { walletAddress, id } = req.params;
    const profile = await readProfile(walletAddress);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.employment) {
      return res.status(404).json({ message: 'Employment credential not found' });
    }

    profile.employment = profile.employment.filter(e => e.id !== id);
    profile.updatedAt = new Date().toISOString();
    await writeProfile(walletAddress, profile);

    res.json({ message: 'Employment credential deleted successfully' });
  } catch (error) {
    console.error('Error deleting employment credential:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

