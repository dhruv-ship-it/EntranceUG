import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Redirect unauthenticated users to appropriate login
    const redirectTo = roles && roles.includes('ADMIN') ? '/admin/login' : 
                       roles && roles.includes('MENTOR') ? '/mentor/login' : 
                       '/login';
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
