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
  Modal,
} from '@mui/material';
import { userService } from '../../services/api';
import { useTheme as useAppTheme } from '../../context/theme-context';

export default function SignupForm() {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    form: '',
  });

  const validate = () => {
    const newErrors = { email: '', password: '', confirmPassword: '', form: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      newErrors.password = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', confirmPassword: '', form: '' });

    if (!validate()) {
      return;
    }

    try {
      await userService.createUser({ email, password });
      setOpen(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ ...errors, form: err.message });
      } else {
        setErrors({ ...errors, form: 'An unexpected error occurred.' });
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: 'none',
          '& *': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
          },
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Please check your email
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            We've sent a confirmation link to your email address. Please click the link to complete your registration.
          </Typography>
        </Box>
      </Modal>
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
            <Box sx={{ position: 'relative', zIndex: 1 }}>
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
          </Box>
          <Typography component="h1" variant="h5">
            Sign up
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
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            {errors.form && (
              <Typography color="error" sx={{ mt: 1 }}>
                {errors.form}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Link href="/login">
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Already have an account? Sign in
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
