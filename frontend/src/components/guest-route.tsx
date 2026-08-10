import { Navigate } from 'react-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute — Guards guest-only routes (/login, /register, /forgot-password)
 * against authenticated users. Redirects logged-in users to /dashboard.
 * Displays a full-screen centered loading spinner during initial session check.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[hsl(var(--background))]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
