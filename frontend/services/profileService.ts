interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  phoneNumber: string;
  location: string;
  timezone: string;
  profession: string;
  company: string;
  website: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  profile: ProfileData;
  message?: string;
  error?: string;
}

class ProfileService {
  private baseUrl: string;

  constructor() {
    // Always use relative path to go through NGINX proxy
    this.baseUrl = '/api';
  }

  async getProfile(userId: string): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UpdateProfileResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data.profile;
    } catch (error) {
      console.error('Get profile error:', error);
      // Return default profile for development
      return this.getDefaultProfile();
    }
  }

  async updateProfile(
    userId: string,
    profileData: Partial<ProfileData>
  ): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UpdateProfileResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      return data.profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async updatePreferences(
    userId: string,
    preferences: ProfileData['preferences']
  ): Promise<ProfileData['preferences']> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/profile/${userId}/preferences`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ preferences }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      return data.preferences;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(
        `${this.baseUrl}/user/profile/${userId}/avatar`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || data.error || 'Failed to upload avatar'
        );
      }

      return data.avatarUrl || data.avatar;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  private getDefaultProfile(): ProfileData {
    return {
      name: 'John Doe',
      email: 'user@onelastai.com',
      avatar: '',
      bio: 'AI enthusiast and developer passionate about creating intelligent solutions that bridge the gap between human creativity and machine efficiency.',
      phoneNumber: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      timezone: 'Pacific Time (PT)',
      profession: 'AI Developer',
      company: 'Tech Innovation Inc.',
      website: 'https://johndoe.dev',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        github: 'https://github.com/johndoe',
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        productUpdates: true,
      },
    };
  }
}

export const profileService = new ProfileService();
export type { ProfileData, UpdateProfileResponse };
