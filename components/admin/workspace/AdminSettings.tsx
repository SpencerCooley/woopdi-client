'use client';

import { Box, Switch, FormControlLabel, TextField, Button, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useApp } from '../../../context/app-context';
import { useTheme } from '../../../context/theme-context';

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

export default function AdminSettings() {
  const { user } = useApp();
  const { mode, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkModeDefault, setDarkModeDefault] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [systemMaintenanceMode, setSystemMaintenanceMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const isSuperAdmin = user?.role === 'superadmin';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <FormControlLabel
        control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
        label="Dark Mode"
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin settings tabs">
          <Tab label="General" />
          <Tab label="Account" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '500px', mt: 3 }}>
          {isSuperAdmin && (
            <FormControlLabel
              control={
                <Switch 
                  checked={systemMaintenanceMode} 
                  onChange={(e) => setSystemMaintenanceMode(e.target.checked)}
                />
              }
              label="System Maintenance Mode"
            />
          )}
          
          <FormControlLabel
            control={
              <Switch 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            }
            label="Email Notifications"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={darkModeDefault} 
                onChange={(e) => setDarkModeDefault(e.target.checked)}
              />
            }
            label="Use Dark Mode by Default"
          />
          
          <TextField
            label="Session Timeout (minutes)"
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            InputProps={{ inputProps: { min: 5, max: 120 } }}
            fullWidth
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '500px', mt: 3 }}>
          <TextField
            label="Change Password"
            type="password"
            placeholder="Enter new password"
            fullWidth
          />
          
          <TextField
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            fullWidth
          />
          
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2, alignSelf: 'flex-start' }}
          >
            Save Changes
          </Button>
        </Box>
      </TabPanel>
    </Box>
  );
}
