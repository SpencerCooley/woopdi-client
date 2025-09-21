'use client';

import { useApp } from '../../../context/app-context';
import OrganizationSettings from './OrganizationSettings';
import AdminSettings from './AdminSettings';

export default function Settings() {
  const { selectedOrganization } = useApp();

  // If an organization is selected, show the organization settings
  if (selectedOrganization) {
    return <OrganizationSettings />;
  }

  // Otherwise, show the admin/superadmin settings
  return <AdminSettings />;
}