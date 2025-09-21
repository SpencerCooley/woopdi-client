'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  useTheme,
} from '@mui/material';
import { authService } from '../../services/api';
import { useTheme as useAppTheme } from '../../context/theme-context';

export default function RequestPasswordResetPage() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await authService.requestPasswordReset({ email });
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Request password reset error:', err);
      setError('Failed to send password reset email. Please check the email address and try again.');
    }
  };

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
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Image
              src={appTheme.mode === 'dark' 
                ? '/company-logo-light-low.png' 
                : '/company-logo-dark-low.png'}
              alt="Woopdi Logo"
              width={300}
              height={90}
              priority
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          {success ? (
            <Typography sx={{ mt: 2 }}>
              If an account with that email exists, a password reset link has been sent.
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error}
              />
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send Reset Link
              </Button>
            </Box>
          )}
           <Link href="/login">
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                Back to login
              </Typography>
            </Link>
        </Paper>
      </Container>
    </Box>
  );
}
