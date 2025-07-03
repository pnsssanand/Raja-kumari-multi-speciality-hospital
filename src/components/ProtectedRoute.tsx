
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDoctor?: boolean;
  requirePatient?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireDoctor = false,
  requirePatient = false 
}) => {
  const { currentUser, userProfile, loading } = useAuth();

  console.log('ProtectedRoute check:', {
    currentUser: currentUser?.email,
    userProfile,
    requireAdmin,
    requireDoctor,
    requirePatient,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('No current user, redirecting to login');
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    if (requireDoctor) {
      return <Navigate to="/doctor/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userProfile?.role !== 'admin') {
    console.log('Admin required but user role is:', userProfile?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireDoctor && userProfile?.role !== 'doctor') {
    console.log('Doctor required but user role is:', userProfile?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  if (requirePatient && userProfile?.role !== 'patient') {
    console.log('Patient required but user role is:', userProfile?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
