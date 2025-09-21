'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { authService } from '../../services/api';
import { useTheme as useAppTheme } from '../../context/theme-context';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('No reset token found.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ token, new_password: password });
      setSuccess(true);
    } catch (err: unknown) {
      setError('Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
            Reset Your Password
          </Typography>
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ mt: 2 }}>
                Your password has been reset successfully.
              </Typography>
              <Link href="/login" passHref>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Go to Login
                </Button>
              </Link>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!error}
              />
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ position: 'relative' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={!token || loading}
                >
                  Reset Password
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}