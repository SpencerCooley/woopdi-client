'use client';

import { Box, Typography, Button } from '@mui/material';

import { useApp } from '../../../context/app-context';
import AdminNotes from './AdminNotes';

export default function UserManagement() {
  const { user, selectedOrganization } = useApp();
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" component="div" gutterBottom>
        {isSuperAdmin ? 'Super Admin User Management' : 'Organization User Management'}
      </Typography>
      
      {!isSuperAdmin && selectedOrganization && (
        <Typography variant="body1" paragraph>
          Manage users in the organization "{selectedOrganization.organization_name}".
        </Typography>
      )}
      
      {isSuperAdmin && (
        <Typography variant="body1" paragraph>
          This is the user management section. Here you can manage all users in the system.
        </Typography>
      )}
      
      <Button variant="contained" color="primary">
        Add New User
      </Button>
    </Box>
  );
} 