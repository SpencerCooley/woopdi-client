'use client';

import { Box, Typography, TextField, Tabs, Tab, FormControlLabel, Switch, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useApp } from '../../../context/app-context';
import { useTheme } from '../../../context/theme-context';
import { organizationsService } from '../../../services/api';

// Placeholder components for different roles
function AdminOtherManagement() {
  return <Typography>Other settings for ADMIN role.</Typography>;
}

function ModeratorUserManagement() {
  return <Typography>Limited other management for Moderators.</Typography>;
}

function MemberUserManagement() {
  return <Typography>No user management permissions.</Typography>;
}


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function OrganizationSettings() {
  const { selectedOrganization, refreshUserMemberships } = useApp();
  const { mode, toggleTheme } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    if (selectedOrganization) {
      setOrganizationName(selectedOrganization.organization_name);
    }
  }, [selectedOrganization]);

  if (!selectedOrganization) {
    return (
      <Box>
        <Typography>No organization selected.</Typography>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    if (selectedOrganization) {
      try {
        await organizationsService.updateOrganization(selectedOrganization.organization_id, organizationName);
        // Refresh memberships to get the updated organization name
        await refreshUserMemberships();
      } catch (error) {
        console.error('Failed to update organization name:', error);
      }
    }
  };

  const renderUserManagement = () => {
    switch (selectedOrganization.role) {
      case 'ADMIN':
        return <AdminOtherManagement />;
      case 'MODERATOR':
        return <ModeratorUserManagement />;
      case 'MEMBER':
        return <MemberUserManagement />;
      default:
        return <Typography>Unknown role.</Typography>;
    }
  };

  const isSolo = selectedOrganization.is_solo;
  const isAdmin = selectedOrganization.role === 'ADMIN';

  return (
    <Box sx={{ mt: 2 }}>
      <FormControlLabel
        control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
        label="Dark Mode"
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="organization settings tabs">
          <Tab label="General" />
          <Tab label="Other" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '500px', mt: 3 }}>
          <TextField
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            disabled={isSolo || !isAdmin}
            fullWidth
          />
          {!isSolo && isAdmin && (
            <Button variant="contained" onClick={handleSave} sx={{ mt: 2, alignSelf: 'flex-start' }}>
              Save
            </Button>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderUserManagement()}
      </TabPanel>
    </Box>
  );
}
