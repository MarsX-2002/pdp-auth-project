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

// Password Change Schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'New password must contain at least one special character'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

const SecurityPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema)
  });

  const onPasswordChangeSubmit: SubmitHandler<PasswordChangeFormData> = async (data) => {
    setLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      addToast('Password changed successfully', 'success');
      reset(); // Clear form
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to change password', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        await profileApi.disable2FA();
        addToast('Two-factor authentication disabled', 'info');
      } else {
        // Enable 2FA
        const response = await profileApi.enable2FA();
        // Open modal or redirect to 2FA setup
        addToast('Two-factor authentication setup initiated', 'success');
      }
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to update 2FA settings', 
        'error'
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Security Settings</h1>
        
        <div className="max-w-md mx-auto space-y-6">
          {/* Password Change Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
              <Input 
                type="password"
                label="Current Password"
                {...register('currentPassword')}
                error={errors.currentPassword}
              />

              <Input 
                type="password"
                label="New Password"
                {...register('newPassword')}
                error={errors.newPassword}
              />

              <Input 
                type="password"
                label="Confirm New Password"
                {...register('confirmNewPassword')}
                error={errors.confirmNewPassword}
              />

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
              >
                Change Password
              </Button>
            </form>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled 
                    ? 'Two-factor authentication is enabled' 
                    : 'Two-factor authentication is disabled'}
                </p>
              </div>
              <Button 
                variant={twoFactorEnabled ? 'danger' : 'primary'}
                onClick={handle2FAToggle}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SecurityPage;
