'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import ImageGenDemo from '@/components/admin/workspace/ImageGenDemo';

export default function ImageGenDemoPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ImageGenDemo />
      </AdminLayout>
    </ProtectedRoute>
  );
}
