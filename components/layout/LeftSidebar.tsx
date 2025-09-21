'use client';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HolidayVillage from '@mui/icons-material/HolidayVillage';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/app-context';
import CurrencyDisplay from './CurrencyDisplay';

interface LeftSidebarProps {
  width: number;
  mobileOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function LeftSidebar({ 
  width, 
  mobileOpen, 
  onClose,
  isMobile 
}: LeftSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, memberships, selectedOrganization } = useApp();
  const isSuperAdmin = user?.role === 'superadmin';

  // Find the membership for the currently selected organization
  const currentMembership = memberships.find(
    membership => membership.organization_id === selectedOrganization?.organization_id
  );

  // Determine if user has admin privileges for the currently selected organization
  // The organizational role is stored in the membership data as "MEMBER", "ADMIN" or "MODERATOR"
  const isOrgAdmin = currentMembership?.role === 'ADMIN';
  const isOrgModerator = currentMembership?.role === 'MODERATOR';
  const isOrgAdminOrModerator = isOrgAdmin || isOrgModerator;

  // Function to determine if a menu item should be shown based on user role
  const shouldShowItem = (itemText: string) => {
    // Super admins can see everything
    if (isSuperAdmin) return true;

    // Regular members cannot see Users
    if (itemText === 'Users') {
      return isOrgAdminOrModerator; // Only organization admins and moderators can see Users
    }

    // Members can see Settings (for light/dark mode toggle)
    if (itemText === 'Settings') {
      return true; // All organization users can see Settings
    }

    // Everyone can see Dashboard and Organizations (if superadmin)
    return true;
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Tools Demo', icon: <DashboardIcon />, path: '/admin/tools-demo' },
    { text: 'Image Gen Demo', icon: <DashboardIcon />, path: '/admin/image-gen-demo' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  // Add Organizations menu item for superadmins
  if (isSuperAdmin) {
    menuItems.splice(1, 0, { text: 'Organizations', icon: <HolidayVillage />, path: '/admin/organizations' });
    menuItems.splice(2, 1, { text: 'System Users', icon: <PeopleIcon />, path: '/admin/system-users' });
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => shouldShowItem(item.text));


  const drawerContent = (
    <Box sx={{ 
      width, 
      marginTop: '64px', // Height of AppBar
    }}>

      <List>
        {filteredMenuItems.map((item) => {
          const isSelected = pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) onClose();
                }}
                selected={isSelected}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: isSelected ? theme.palette.primary.main : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    color: isSelected ? theme.palette.primary.main : 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: width }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        // Mobile drawer - temporary
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop drawer - permanent
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}
