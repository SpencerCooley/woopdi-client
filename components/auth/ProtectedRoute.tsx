'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/app-context';
import { authService } from '../../services/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, logout } = useApp();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error: unknown) {
        console.error('Protected route authentication failed:', error);  // Use error in logging
        logout();
        router.push('/login');
      }
    };

    if (!user) {
      verifyAuth();
    }
  }, [user, setUser, logout, router]);

  // Show nothing while checking authentication
  if (!user) {
    return null;
  }

  return <>{children}</>;
} 