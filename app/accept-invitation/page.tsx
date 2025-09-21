'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { membershipService } from '../../services/api';
import { useApp } from '../../context/app-context';
import { CircularProgress, Box, Typography, TextField, Button, Alert, Paper, Stack } from '@mui/material';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const { login } = useApp();

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const fetchInvitationDetails = async () => {
      try {
        const details = await membershipService.getInvitationDetails(token);
        setInvitationDetails(details);
        
        // Check if this is a new user or existing user
        if (details.status === 'new_user_required') {
          setShowPasswordFields(true);
        } else if (details.status === 'existing_user') {
          // For existing users, proceed with automatic acceptance
          await acceptInvitation(token);
        }
        setLoading(false);
      } catch (err: any) {
        if (err.status === 404) {
          setError('This invitation link is not valid.');
        } else if (err.status === 400) {
          setError('This invitation link has expired.');
        } else {
          setError('An error occurred while processing the invitation.');
        }
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token]);

  const acceptInvitation = async (token: string) => {
    try {
      const result = await membershipService.acceptInvitation({
        token,
        password: showPasswordFields ? password : undefined
      });
      
      // If we get a token back, it means the user was successfully accepted
      if (result && typeof result === 'object' && 'token' in result) {
        // Login the user with the returned token
        await login(result.token);
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        // If we get a message, it means the invitation was accepted but no token was returned
        // This could happen for existing users who were already confirmed
        router.push('/admin');
      }
    } catch (err: any) {
      setError('Failed to accept invitation. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (token) {
      await acceptInvitation(token);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper sx={{ p: 4, maxWidth: 500 }}>
          <Alert severity="error">{error}</Alert>
          {error.includes('expired') && (
            <Box mt={2}>
              <Button variant="contained" onClick={() => router.push('/request-invitation')}>
                Request a New Invitation Link
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, maxWidth: 500 }}>
        <Typography variant="h4" gutterBottom align="center">
          Accept Invitation
        </Typography>
        
        {showPasswordFields ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
              >
                Accept Invitation
              </Button>
            </Stack>
          </form>
        ) : (
          <Box textAlign="center">
            <Typography variant="body1" gutterBottom>
              You are being invited to join {invitationDetails?.organization_name} as {invitationDetails?.email}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => acceptInvitation(token!)}
              disabled={loading}
            >
              Accept Invitation
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
