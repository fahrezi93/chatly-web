import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthData } from '../utils/auth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const { userId, token } = getAuthData();
      
      if (!userId || !token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsAdmin(response.data.isAdmin === true);
      } catch (error) {
        console.error('Failed to check admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
          <p className="mt-4 text-[#64748B]">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
