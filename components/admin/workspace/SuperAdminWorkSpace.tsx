'use client';

import { Box, Typography } from '@mui/material';

export default function SuperAdminWorkSpace() {
  return (
    <Box>
      <Typography variant="body1">
        Welcome, Super Admin! You have access to all system features.
      </Typography>
      
      <Typography variant="body1" sx={{ mt: 3 }}>
        As a Super Admin, you can manage all aspects of the system including:
      </Typography>
      
      <ul style={{ marginTop: '8px' }}>
        <li>User management</li>
        <li>Organization management</li>
        <li>System configuration</li>
        <li>Access to all reports and analytics</li>
      </ul>
    </Box>
  );
}