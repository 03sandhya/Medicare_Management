import { Navigate, Outlet } from 'react-router-dom';
import { UserAuth } from './Authprovider';

interface ProtectedRouteProps {
  requiredRole: 'patient' | 'caretaker';
  children?: React.ReactNode;
}

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { session, userRole, isLoading } = UserAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }


  if (userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;