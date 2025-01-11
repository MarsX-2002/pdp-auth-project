import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api';

// 2FA Token Verification Schema
const twoFactorSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits')
});

type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

const TwoFactorSetupPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const initTwoFactor = async () => {
      try {
        const response = await profileApi.initiate2FA();
        setQrCodeUrl(response.data.qrCodeUrl);
      } catch (error: any) {
        addToast(
          error.response?.data?.message || 'Failed to initiate 2FA', 
          'error'
        );
      }
    };

    initTwoFactor();
  }, []);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema)
  });

  const onSubmit: SubmitHandler<TwoFactorFormData> = async (data) => {
    setLoading(true);
    try {
      await profileApi.verify2FA(data.token);
      
      addToast('Two-factor authentication enabled', 'success');
      router.push('/security');
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to verify 2FA', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Two-Factor Authentication Setup
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Scan the QR code with your authenticator app
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 mb-4"
                />
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Scan this QR code with Google Authenticator or Authy
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating QR code...</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input 
                label="Verification Code"
                type="text"
                {...register('token')}
                error={errors.token}
                placeholder="Enter 6-digit code from authenticator app"
                maxLength={6}
              />

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
                disabled={!qrCodeUrl}
              >
                Verify and Enable 2FA
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TwoFactorSetupPage;
