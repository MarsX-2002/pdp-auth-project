import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authApi } from '@/lib/api';

// Password Reset Schema
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[!@#$%^&*]/, 'Must contain a special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = router.query.token as string;
    if (resetToken) {
      setToken(resetToken);
    } else {
      addToast('Invalid or missing reset token', 'error');
      router.push('/login');
    }
  }, [router.query]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) return;

    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword
      });
      
      addToast('Password reset successful', 'success');
      router.push('/login');
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to reset password', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter a new strong password
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input 
            label="New Password"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword}
            placeholder="Enter new password"
          />

          <Input 
            label="Confirm New Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
          />

          <Button 
            type="submit" 
            loading={loading}
            className="w-full"
          >
            Reset Password
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
