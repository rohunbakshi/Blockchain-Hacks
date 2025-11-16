const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001/api';

export interface UserProfile {
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
  lastFourSSN?: string;
  profileImage?: string;
  documents?: string[];
  education?: EducationCredential[];
  employment?: EmploymentCredential[];
  updatedAt?: string;
}

export interface EducationCredential {
  id: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear: string;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmploymentCredential {
  id: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  education: EducationCredential[];
  employment: EmploymentCredential[];
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function updateUserProfile(formData: FormData): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Credential Management Functions

export async function getUserCredentials(walletAddress: string): Promise<UserCredentials> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/credentials`);
    if (!response.ok) {
      if (response.status === 404) {
        return { education: [], employment: [] };
      }
      throw new Error('Failed to fetch credentials');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw error;
  }
}

export async function saveEducationCredential(
  walletAddress: string,
  credential: Partial<EducationCredential>
): Promise<EducationCredential> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/credentials/education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credential),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to save education credential' }));
      throw new Error(error.message || 'Failed to save education credential');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving education credential:', error);
    throw error;
  }
}

export async function saveEmploymentCredential(
  walletAddress: string,
  credential: Partial<EmploymentCredential>
): Promise<EmploymentCredential> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/credentials/employment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credential),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to save employment credential' }));
      throw new Error(error.message || 'Failed to save employment credential');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving employment credential:', error);
    throw error;
  }
}

export async function deleteEducationCredential(walletAddress: string, id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/credentials/education/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete education credential' }));
      throw new Error(error.message || 'Failed to delete education credential');
    }
  } catch (error) {
    console.error('Error deleting education credential:', error);
    throw error;
  }
}

export async function deleteEmploymentCredential(walletAddress: string, id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/credentials/employment/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete employment credential' }));
      throw new Error(error.message || 'Failed to delete employment credential');
    }
  } catch (error) {
    console.error('Error deleting employment credential:', error);
    throw error;
  }
}

