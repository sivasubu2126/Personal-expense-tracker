import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 font-medium">Loading session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
