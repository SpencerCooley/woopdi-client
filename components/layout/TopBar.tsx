'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import { useApp } from '../../context/app-context';
import { useRouter } from 'next/navigation';
import { useTheme as useAppTheme } from '../../context/theme-context';
import { useState } from 'react';
import { useLogo } from '../../hooks/useLogo';

interface TopBarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export default function TopBar({ onMenuClick, isMobile }: TopBarProps) {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const { user, logout, memberships, selectedOrganization, setOrganizationContext } = useApp();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { currentLogoUrl, hasLogo, loading: logoLoading } = useLogo();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleOrganizationChange = (event: SelectChangeEvent<number>) => {
    const organizationId = Number(event.target.value);
    // Use setTimeout to defer the state update to prevent conflicts during navigation
    setTimeout(() => {
      setOrganizationContext(organizationId);
      // Redirect to the admin page to refresh the view
      router.push('/admin');
    }, 0);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: 1,
        width: '100%',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexGrow: 1 
        }}>
          {hasLogo && (
            <Box sx={{
              position: 'relative',
              width: 120,
              height: 40,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Image
                src={currentLogoUrl!}
                alt="Company Logo"
                width={120}
                height={40}
                priority
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </Box>
          )}
          
          {/* Organization Context Indicator */}
          {selectedOrganization && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {memberships.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    labelId="organization-select-label"
                    id="organization-select"
                    value={selectedOrganization.organization_id}
                    onChange={handleOrganizationChange}
                    sx={{ 
                      height: '40px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                      }
                    }}
                  >
                    {memberships.map((membership) => (
                      <MenuItem 
                        key={membership.organization_id}
                        value={membership.organization_id}
                      >
      
                        <ListItemText primary={membership.organization_name} />
                        <ListItemText 
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {memberships.length === 1 && (
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {selectedOrganization.organization_name}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.email}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            variant="text"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
