import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace('/login', { 
          query: { 
            redirectFrom: router.pathname 
          } 
        });
      } else if (requiredRoles.length > 0 && user) {
        // Check user roles if specified
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
          // Redirect to unauthorized page
          router.replace('/unauthorized');
        }
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render children if authenticated and has required roles
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
