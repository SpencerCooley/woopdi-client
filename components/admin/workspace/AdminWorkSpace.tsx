'use client';

import { Box, Typography } from '@mui/material';

export default function AdminWorkSpace() {
  return (
    <Box>
      <Typography variant="body1">
        Welcome, Admin! You have access to administrative features.
      </Typography>
      
      <Typography variant="body1" sx={{ mt: 3 }}>
        As an Admin, you can manage:
      </Typography>
      
      <ul style={{ marginTop: '8px' }}>
        <li>Customer accounts</li>
        <li>Support tickets</li>
        <li>Content management</li>
        <li>Standard reports</li>
      </ul>
    </Box>
  );
}