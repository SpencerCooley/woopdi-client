'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext, themeSettings } from '../../context/theme-context';
import { AppContext, AppMode } from '../../context/app-context';
import { User, authService,  OrganizationMembership } from '../../services/api';
import dynamic from 'next/dynamic';

const EmotionRegistry = dynamic(() => import('./EmotionRegistry'), {
  ssr: true
});

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationMembership | null>(null);
  const [appMode, setAppMode] = useState<AppMode>(null);

  const refreshUserMemberships = useCallback(async () => {
    if (user && selectedOrganization) {
      try {
        const userMemberships = await authService.getUserMemberships();
        setMemberships(userMemberships.memberships);
        
        // Find the updated membership and update the selected organization state
        const updatedSelected = userMemberships.memberships.find(
          m => m.organization_id === selectedOrganization.organization_id
        );
        if (updatedSelected) {
          setSelectedOrganization(updatedSelected);
        }

      } catch (error) {
        console.error("Failed to refresh user memberships:", error);
      }
    }
  }, [user, selectedOrganization]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          const userMemberships = await authService.getUserMemberships();
          setMemberships(userMemberships.memberships);
          
          // Auto-select organization if user has only one non-solo organization
          const nonSoloMemberships = userMemberships.memberships.filter(m => !m.is_solo);
          if (nonSoloMemberships.length === 1) {
            setSelectedOrganization(nonSoloMemberships[0]);
            setAppMode('ORGANIZATION');
          } else if (nonSoloMemberships.length === 0 && userMemberships.memberships.length > 0) {
            // If user has solo organizations but no non-solo organizations, 
            // we still want to set the app mode to ORGANIZATION
            // And set the first membership as selected
            setSelectedOrganization(userMemberships.memberships[0]);
            setAppMode('ORGANIZATION');
          }
          // If user is admin or superadmin, skip organization selection entirely
          else if (userMemberships.memberships.length === 0 && (userData.role === 'admin' || userData.role === 'superadmin')) {
            setAppMode('ORGANIZATION');
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          setUser(null);
          setMemberships([]);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = createTheme(themeSettings(mode));

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const login = useCallback(async (token: string) => {
    localStorage.setItem('accessToken', token);
    setLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      const userMemberships = await authService.getUserMemberships();
      setMemberships(userMemberships.memberships);
      
      // Auto-select organization if user has only one non-solo organization
      const nonSoloMemberships = userMemberships.memberships.filter(m => !m.is_solo);
      if (nonSoloMemberships.length === 1) {
        setSelectedOrganization(nonSoloMemberships[0]);
        setAppMode('ORGANIZATION');
      }
      
      return userData;
    } catch (error) {
      localStorage.removeItem('accessToken');
      setUser(null);
      setMemberships([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setMemberships([]);
    setSelectedOrganization(null);
    setAppMode(null);
  }, []);

  const setOrganizationContext = (organizationId: number) => {
    // Check if we're in a valid state before updating
    if (!memberships || memberships.length === 0) {
      return;
    }
    
    const organization = memberships.find(m => m.organization_id === organizationId);
    if (organization) {
      // Use a setTimeout to defer the state update to next tick
      // This helps prevent issues with concurrent state updates during navigation
      setTimeout(() => {
        setSelectedOrganization(organization);
        setAppMode('ORGANIZATION');
      }, 0);
    }
  };

  const clearOrganizationContext = () => {
    setSelectedOrganization(null);
    setAppMode(null);
  };

  const clearAppContext = () => {
    logout();
  };

  return (
    <EmotionRegistry>
      <ThemeContext.Provider value={{ mode, toggleTheme }}>
        <MUIThemeProvider theme={theme}>
          <CssBaseline />
          <AppContext.Provider
            value={{
              user,
              isAuthenticated: !!user,
              loading,
              login,
              logout,
              setUser,
              memberships,
              selectedOrganization,
              appMode,
              setOrganizationContext,
              clearOrganizationContext,
              refreshUserMemberships,
              clearAppContext,
            }}
          >
            {children}
          </AppContext.Provider>
        </MUIThemeProvider>
      </ThemeContext.Provider>
    </EmotionRegistry>
  );
}
