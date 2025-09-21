'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/app-context';
import { authService } from '../services/api';

export default function Home() {
  const router = useRouter();
  const { user, setUser } = useApp();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        router.push('/admin');
      } catch (error: unknown) {
        console.error('Authentication check failed:', error);
        router.push('/login');
      }
    };

    if (!user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        checkAuth();
      } else {
        router.push('/login');
      }
    } else {
      router.push('/admin');
    }
  }, [user, setUser, router]);

  return null;
}
