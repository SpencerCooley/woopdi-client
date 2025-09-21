'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, useTheme, Container } from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';
import { useApp } from '../../context/app-context';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useApp();
  const theme = useTheme();

  useEffect(() => {
    // If user is already logged in, redirect to admin
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  // Show loading state while checking auth
  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '10.vh',
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
        <LoginForm />
      </Container>
    </Box>
  );
}
