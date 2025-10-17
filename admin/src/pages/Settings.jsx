import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    streamNotifications: true,
    systemAlerts: false,
    weeklyReports: true
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              {user?.avatar_url ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.avatar_url}
                  alt={user.displayName || user.email}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {user?.displayName || 'Admin User'}
                </h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Administrator
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue={user?.displayName || ''}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  Managed through OAuth provider
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue={user?.email || ''}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  Managed through OAuth provider
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">OAuth Provider</h3>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Authentication Method
              </p>
              <p className="text-sm text-gray-500">
                You are authenticated via {user?.oauthProvider || 'email'}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user?.oauthProvider === 'google' ? 'bg-blue-100 text-blue-800' :
              user?.oauthProvider === 'twitch' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user?.oauthProvider?.charAt(0).toUpperCase() + user?.oauthProvider?.slice(1) || 'Email'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Plane API URL
              </label>
              <input
                type="url"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                placeholder="https://api.neustream.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PostHog API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.posthog ? "text" : "password"}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  defaultValue="phc_..." // Would come from environment
                  placeholder="Your PostHog API key"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowApiKeys(prev => ({ ...prev, posthog: !prev.posthog }))}
                >
                  {showApiKeys.posthog ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Session</p>
              <p className="text-sm text-gray-500">
                Logged in as {user?.email}
              </p>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Information</h3>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Database Type</dt>
                <dd className="mt-1 text-sm text-gray-900">PostgreSQL</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {import.meta.env.MODE || 'development'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">API Version</dt>
                <dd className="mt-1 text-sm text-gray-900">v1.0.0</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Deployment</dt>
                <dd className="mt-1 text-sm text-gray-900">Unknown</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">API Server</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Analytics</span>
                </div>
                <span className="text-sm text-yellow-600">Limited Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-4">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive email notifications for important system events' },
              { key: 'streamNotifications', label: 'Stream Notifications', description: 'Get notified when users start/stop streaming' },
              { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system errors and downtime notifications' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly usage and performance summaries' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key)}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 border-b-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;