'use client';

import { Box, Typography, Paper } from '@mui/material';
import Settings from './Settings';
import Organizations from './Organizations';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import OrganizationUserManagement from './OrganizationUserManagement';
import SystemUserManagement from './SystemUserManagement';
import ToolsDemo from './ToolsDemo';

interface WorkSpaceProps {
  title?: string;
}

export default function WorkSpace({ title }: WorkSpaceProps) {
  const pageTitle = title;
  
  // Determine if we're on the settings page
  const isSettingsPage = title === 'Settings';
  const isDashboardPage = title === 'Dashboard';
  const isUserManagementPage = title === 'User Management';
  const isOrganizationsPage = title === 'Organizations';
  const isOrganizationUserManagementPage = title === 'Organization User Management';
  const isSystemUserManagementPage = title === 'System User Management';
  const isToolsDemoPage = title === 'Tools Demo';
  
  return (
    <Box sx={{
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      width: '100%',
      maxWidth: '100%',
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          width: '100%',
        }}>
          <Typography variant="h4" component="h1">
            {pageTitle}
          </Typography>
        </Box>

        {isSettingsPage && <Settings />}
        {isDashboardPage && <Dashboard />}
        {isUserManagementPage && <UserManagement />}
        {isOrganizationsPage && <Organizations />}
        {isOrganizationUserManagementPage && <OrganizationUserManagement />}
        {isSystemUserManagementPage && <SystemUserManagement />}
        {isToolsDemoPage && <ToolsDemo />}

      </Paper>
      
      {/* Add more dashboard content here */}
    </Box>
  );
}
