'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Container, useTheme, Button } from '@mui/material';
import { ApiError, userService } from '../../services/api';
import { useApp } from '../../context/app-context';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme as useAppTheme } from '../../context/theme-context';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [autoCreateFreeSubscription, setAutoCreateFreeSubscription] = useState(true);

  const getToken = useCallback(() => searchParams.get('token'), [searchParams]);

  const handleResend = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setResendMessage('');
    setError(null);
    try {
      await userService.resendConfirmation(token);
      setResendMessage('A new confirmation email has been sent. Please check your inbox.');
    } catch (err) {
      setError('Failed to resend confirmation email.');
    } finally {
      setLoading(false);
      setShowResend(false); // Hide button after click
    }
  };

  useEffect(() => {
    // Clear any existing token to prevent auth conflicts on this public page
    localStorage.removeItem('accessToken');

    const token = getToken();
    if (!token) {
      setError('No confirmation token found in URL.');
      setLoading(false);
      return;
    }

    const confirmEmail = async () => {
      let confirmationSucceeded = false;
      try {
        const response = await userService.confirmUser(token);
        confirmationSucceeded = true; // Mark confirmation as successful
        
        // Get system settings to determine if we should auto-create a free subscription
        const settingsResponse = await userService.getSystemSettings();
        setAutoCreateFreeSubscription(settingsResponse.auto_create_free_subscription);
        
        await login(response.token);
        
        // If auto-create free subscription is enabled, create it immediately
        if (autoCreateFreeSubscription) {
          try {
            await userService.createFreeSubscription();
          } catch (err) {
            // If creating free subscription fails, continue anyway
            console.warn("Failed to create free subscription:", err);
          }
          // Redirect to dashboard after creating free subscription
          router.push('/admin');
        } else {
          // If auto-create free subscription is disabled, redirect to payment page
          router.push('/payment-setup');
        }
      } catch (err: any) {

        console.log(err.message);
        // If confirmation succeeded, but the subsequent login failed,
        // just redirect to the login page without setting an error here.
        if (confirmationSucceeded) {
          console.error("Login failed after successful confirmation:", err);
          router.push('/login');
          return; // Exit to prevent setLoading(false) from causing a re-render
        }

        // If we are here, it means the confirmation itself failed.
        if (err instanceof ApiError) {
            if (err.status === 410) {
                setError('Your confirmation link has expired.');
                setShowResend(true);
            } else if (err.status === 409) {
                setError('This email has already been confirmed.');
            } else {
                setError('This confirmation link is invalid.');
            }
        } else {
            setError('An unexpected error occurred.');
        }
        setLoading(false);
      }
    };

    confirmEmail();
  }, [getToken, router, login, autoCreateFreeSubscription]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3, position: 'relative' }}>
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
        
        {loading && (
          <>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Confirming your email...</Typography>
          </>
        )}

        {error && !loading && (
          <>
            <Typography color="error" component="div" sx={{ mb: 2 }}>
              {error}
            </Typography>
            {showResend && (
              <Button variant="contained" onClick={handleResend}>
                Resend Confirmation Email
              </Button>
            )}
            {!showResend && error.includes('confirmed') && (
                 <Link href="/login" style={{ color: theme.palette.primary.main }}>
                    Proceed to Login
                </Link>
            )}
          </>
        )}

        {resendMessage && !loading && (
          <Typography color="primary">{resendMessage}</Typography>
        )}
      </Box>
    </Container>
  );
}