'use client';

import { Box, Typography } from '@mui/material';
import { useApp } from '../../../context/app-context';

export default function Dashboard() {
  const { selectedOrganization } = useApp();

  return (
    <Box sx={{ p: 3 }}>
      {selectedOrganization ? (
        <Typography variant="h1">
          {selectedOrganization.organization_name} : Start building stuff.
        </Typography>


      ) : (
        <Typography variant="h6">
          No organization selected
        </Typography>
      )}
    </Box>
  );
}
