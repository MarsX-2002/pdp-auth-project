import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api';

// Profile Update Schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || ''
    }
  });

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      if (data.bio) formData.append('bio', data.bio);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await profileApi.updateProfile(formData);
      
      updateUser(response.data.user);
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
        
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex items-center space-x-4">
              <img 
                src={
                  profilePicture 
                    ? URL.createObjectURL(profilePicture) 
                    : user?.profilePicture || '/default-avatar.png'
                } 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>

            {/* First Name */}
            <Input 
              label="First Name"
              {...register('firstName')}
              error={errors.firstName}
            />

            {/* Last Name */}
            <Input 
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName}
            />

            {/* Bio */}
            <div>
              <label 
                htmlFor="bio" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio
              </label>
              <textarea 
                id="bio"
                {...register('bio')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              loading={loading}
              className="w-full"
            >
              Update Profile
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
