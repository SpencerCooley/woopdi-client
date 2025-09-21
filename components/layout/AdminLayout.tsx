'use client';

import { ReactNode, useState } from 'react';
import { Box, useTheme, Toolbar, useMediaQuery } from '@mui/material';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import { useApp } from '../../context/app-context';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = 240;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, memberships, selectedOrganization, appMode, user } = useApp();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Show loading state while initializing
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  // If we have memberships but no selected organization, and appMode is not ORGANIZATION, redirect to select-organization
  // This is a safety check in case the AppProviders didn't handle it properly
  if (memberships.length > 0 && !selectedOrganization && appMode !== 'ORGANIZATION') {
    // Try to redirect to select-organization page
    // This is a fallback - the AppProviders should have handled this already
    // But we need to prevent infinite loops
    if (window.location.pathname !== '/select-organization') {
      // Add a small delay to prevent immediate redirect during navigation
      setTimeout(() => {
        // Check if we're still in the right location before redirecting
        if (window.location.pathname !== '/select-organization') {
          router.push('/select-organization');
        }
      }, 100);
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Redirecting to organization selection...
      </Box>
    );
  }

  // If user is admin, superadmin or moderator and has no memberships, allow direct access to admin
  if ((user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator') && memberships.length === 0) {
    // This case should be handled by AppProviders, but we'll keep it here as a safety net
    // Just render normally
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Fixed Top Bar */}
      <TopBar onMenuClick={handleDrawerToggle} isMobile={isMobile} />

      {/* Left Sidebar */}
      <LeftSidebar 
        width={SIDEBAR_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          position: 'relative',
          ml: { xs: 0, md: 0 }, // Remove margin
        }}
      >
        {/* This toolbar is for spacing below the fixed AppBar */}
        <Toolbar />
        
        {/* Page Content */}
        <Box sx={{ 
          width: '100%',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
