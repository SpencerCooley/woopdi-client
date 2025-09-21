'use client';

import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import AdminLayout from '../../../components/layout/AdminLayout';
import WorkSpace from '../../../components/admin/workspace/WorkSpace';

export default function OrganizationsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <WorkSpace title="Organizations" />
      </AdminLayout>
    </ProtectedRoute>
  );
} 