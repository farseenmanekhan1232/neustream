import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Users as UsersIcon,
  Search,
  Filter,
  Mail,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProvider = filterProvider === 'all' || user.oauth_provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar_url}
                alt={user.display_name || user.email}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.display_name?.[0] || user.email[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.display_name || 'No Display Name'}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.oauth_provider === 'google' ? 'bg-blue-100 text-blue-800' :
            user.oauth_provider === 'twitch' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.oauth_provider || 'email'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Joined</p>
            <p className="text-sm text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Last Active</p>
            <p className="text-sm text-gray-900">
              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Stream Key: <span className="font-mono">{user.stream_key?.substring(0, 8)}...</span>
          </div>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              View Streams
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all registered users.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Active Today</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">OAuth Users</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">New This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
            >
              <option value="all">All Providers</option>
              <option value="google">Google</option>
              <option value="twitch">Twitch</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>{filteredUsers.length} of {users.length} users</span>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm || filterProvider !== 'all' ? 'No matching users' : 'No users found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterProvider !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by inviting some users to your platform.'}
            </p>
          </div>
        </div>
      )}

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Admin Access Required
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                User management requires admin-level API endpoints. Please implement the following endpoints in your control-plane:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>GET /api/admin/users - Get all users</li>
                <li>GET /api/admin/users/:id - Get user details</li>
                <li>PUT /api/admin/users/:id - Update user</li>
                <li>DELETE /api/admin/users/:id - Delete user</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;