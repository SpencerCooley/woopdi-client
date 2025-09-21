'use client';

import { createContext, useContext } from 'react';
import { User, OrganizationMembership } from '../services/schema_definitions';

export type AppMode = 'ORGANIZATION' | 'FACILITY' | null;

export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  memberships: OrganizationMembership[];
  selectedOrganization: OrganizationMembership | null;
  appMode: AppMode;
  setOrganizationContext: (organizationId: number) => void;
  clearOrganizationContext: () => void;
  refreshUserMemberships: () => Promise<void>;
  clearAppContext: () => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => { throw new Error('Not implemented') },
  logout: () => {},
  setUser: () => {},
  memberships: [],
  selectedOrganization: null,
  appMode: null,
  setOrganizationContext: () => {},
  clearOrganizationContext: () => {},
  refreshUserMemberships: async () => {},
  clearAppContext: () => {},
});

export const useApp = () => useContext(AppContext); 