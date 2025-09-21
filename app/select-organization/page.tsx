'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/app-context';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { memberships, selectedOrganization, setOrganizationContext } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // If user already has a selected organization, redirect to admin
        if (selectedOrganization) {
          router.push('/admin');
          return;
        }

        // If user has no memberships, redirect to dashboard or show message
        if (memberships.length === 0) {
          router.push('/');
          return;
        }

        // If user has only one organization, auto-select it and redirect to admin
        if (memberships.length === 1) {
          setOrganizationContext(memberships[0].organization_id);
          router.push('/admin');
          return;
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load organization memberships');
        setLoading(false);
      }
    };

    initialize();
  }, [memberships, selectedOrganization, router, setOrganizationContext]);

  const handleSelectOrganization = (organizationId: number) => {
    setOrganizationContext(organizationId);
    router.push('/admin');
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh" 
      bgcolor="background.default"
    >
      <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
        <Card sx={{ maxWidth: 500, margin: 2, padding: 3 }}>
          <CardHeader
            title={
              <Typography variant="h5" align="center" gutterBottom>
                Select Organization
              </Typography>
            }
            subheader={
              <Typography variant="body2" align="center" color="textSecondary">
                Choose the organization you want to work with
              </Typography>
            }
          />
          <Divider />
          <CardContent>
            {memberships.length === 0 ? (
              <Box textAlign="center">
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  You don't belong to any organizations yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push('/')}
                  sx={{ mt: 2 }}
                >
                  Go Home
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Organizations:
                </Typography>
                <List>
                  {memberships.map((membership) => (
                    <ListItem key={membership.organization_id} disablePadding>
                      <ListItemButton 
                        onClick={() => handleSelectOrganization(membership.organization_id)}
                      >
                        <ListItemText 
                          primary={membership.organization_name}
                          secondary={membership.role === 'admin' ? 'Administrator' : membership.role === 'moderator' ? 'Moderator' : 'Member'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
