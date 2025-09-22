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
import { useApp } from '../../context/app-context';
import { authService } from '../../services/api';
import { useRouter } from 'next/navigation';
import { useTheme as useAppTheme } from '../../context/theme-context';
import { useLogo } from '../../hooks/useLogo';

export default function LoginForm() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { currentLogoUrl, hasLogo } = useLogo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Get login response
      const response = await authService.login({ email, password });
      
      // Login will store token and fetch user data
      await login(response.token);
      
      // If successful, redirect
      router.push('/admin');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('Invalid email or password');
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
          {hasLogo && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Image
                  src={currentLogoUrl!}
                  alt="Company Logo"
                  width={300}
                  height={90}
                  priority
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </Box>
            </Box>
          )}
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Sign In
            </Button>
            <Link href="/signup">
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Don't have an account? Sign Up
              </Typography>
            </Link>
            <Link href="/request-password-reset">
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                Forgot password?
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
