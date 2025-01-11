import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authApi } from '@/lib/api';

// Forgot Password Schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      
      setEmailSent(true);
      addToast('Password reset link sent to your email', 'success');
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to send reset link', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to your email. 
              Please check your inbox and follow the instructions.
            </p>
            <div className="mt-6">
              <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input 
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email}
            placeholder="you@example.com"
          />

          <Button 
            type="submit" 
            loading={loading}
            className="w-full"
          >
            Send Reset Link
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

export default ForgotPasswordPage;
