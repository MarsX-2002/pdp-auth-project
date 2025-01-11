import React from 'react';
import { cn } from '@/lib/utils';
import { FieldError } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-md shadow-sm',
              'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
              'sm:text-sm py-2 px-3',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
