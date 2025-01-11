import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/lib/api';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentUsers: Array<{
    username: string;
    email: string;
    createdAt: string;
  }>;
}

interface UserListItem {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const AdminDashboardPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          adminApi.getStats(),
          adminApi.listUsers(page)
        ]);

        setStats(statsResponse.data);
        setUsers(usersResponse.data.users);
        setLoading(false);
      } catch (error: any) {
        addToast(
          error.response?.data?.message || 'Failed to fetch admin data', 
          'error'
        );
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [page]);

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      addToast('User role updated successfully', 'success');
      
      // Update local state
      setUsers(prev => 
        prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
      );
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to update user role', 
        'error'
      );
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await adminApi.deactivateUser(userId);
      addToast('User deactivated successfully', 'success');
      
      // Update local state
      setUsers(prev => 
        prev.map(u => u._id === userId ? { ...u, isActive: false } : u)
      );
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Failed to deactivate user', 
        'error'
      );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Total Users</h2>
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalUsers}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Active Users</h2>
            <p className="text-3xl font-bold text-green-600">{stats?.activeUsers}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Users</h2>
            <p className="text-3xl font-bold text-red-600">{stats?.adminUsers}</p>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b">
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <select 
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                        className="rounded-md border-gray-300"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive && (
                        <button 
                          onClick={() => handleDeactivateUser(u._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
