'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, useTheme, Container } from '@mui/material';
import SignupForm from '../../components/auth/SignupForm';
import { useApp } from '../../context/app-context';
import { authService } from '../../services/api';

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const theme = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        router.push('/admin');
      } catch (error: unknown) {
        console.error('Authentication failed:', error);
      }
    };

    if (user) {
      router.push('/admin');
    } else if (localStorage.getItem('accessToken')) {
      checkAuth();
    }
  }, [user, setUser, router]);

  if (user) {
    return null; // Render nothing while redirecting
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 12,
        px: { xs: 2, sm: 6, lg: 8 },
      }}
    >
      <Container maxWidth="sm">
        <SignupForm />
      </Container>
    </Box>
  );
}