import { Server, Database, Cpu, HardDrive, Activity, AlertCircle } from 'lucide-react';
import { SystemLog } from '../types';
import { useState } from 'react';

export default function SystemAdmin() {
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  const systemStatus = {
    cpu: { usage: 45, status: 'healthy' },
    memory: { usage: 62, status: 'healthy' },
    disk: { usage: 38, status: 'healthy' },
    database: { status: 'connected', responseTime: 12 },
  };

  const apiIntegrations = [
    { name: 'Payment Gateway', status: 'active', lastSync: '2 menit lalu', uptime: 99.8 },
    { name: 'SMS Gateway', status: 'active', lastSync: '5 menit lalu', uptime: 99.5 },
    { name: 'Email Service', status: 'active', lastSync: '1 menit lalu', uptime: 99.9 },
    { name: 'Document Storage', status: 'warning', lastSync: '15 menit lalu', uptime: 98.2 },
  ];

  const systemLogs: SystemLog[] = [
    { id: '1', timestamp: '2025-10-31 14:35:22', type: 'info', message: 'User admin@baubau logged in', user: 'admin@baubau' },
    { id: '2', timestamp: '2025-10-31 14:30:15', type: 'success', message: 'Backup completed successfully', user: 'system' },
    { id: '3', timestamp: '2025-10-31 14:25:08', type: 'warning', message: 'High memory usage detected (78%)', user: 'system' },
    { id: '4', timestamp: '2025-10-31 14:20:45', type: 'error', message: 'Failed to sync with external API', user: 'system' },
    { id: '5', timestamp: '2025-10-31 14:15:33', type: 'info', message: 'Database backup initiated', user: 'system' },
    { id: '6', timestamp: '2025-10-31 14:10:20', type: 'success', message: 'System health check passed', user: 'system' },
    { id: '7', timestamp: '2025-10-31 14:05:12', type: 'info', message: 'User verifikator@baubau logged out', user: 'verifikator@baubau' },
    { id: '8', timestamp: '2025-10-31 14:00:05', type: 'warning', message: 'Slow query detected (3.2s)', user: 'system' },
  ];

  const filteredLogs = logFilter === 'all' ? systemLogs : systemLogs.filter((log) => log.type === logFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Administration</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor sistem, logs, dan API integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                systemStatus.cpu.status === 'healthy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {systemStatus.cpu.status}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">CPU Usage</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {systemStatus.cpu.usage}%
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${systemStatus.cpu.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                systemStatus.memory.status === 'healthy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {systemStatus.memory.status}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Memory Usage</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {systemStatus.memory.usage}%
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${systemStatus.memory.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                systemStatus.disk.status === 'healthy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {systemStatus.disk.status}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Disk Usage</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {systemStatus.disk.usage}%
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${systemStatus.disk.usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Database className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                systemStatus.database.status === 'connected'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {systemStatus.database.status}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Database</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {systemStatus.database.responseTime}ms
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Response time</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Integrations
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiIntegrations.map((api, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{api.name}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      api.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {api.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Last Sync:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {api.lastSync}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Uptime:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {api.uptime}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Logs</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  logFilter === 'all'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('info')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  logFilter === 'info'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setLogFilter('warning')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  logFilter === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setLogFilter('error')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  logFilter === 'error'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Error
              </button>
              <button
                onClick={() => setLogFilter('success')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  logFilter === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Success
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    log.type === 'error'
                      ? 'text-red-600'
                      : log.type === 'warning'
                      ? 'text-yellow-600'
                      : log.type === 'success'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        log.type === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : log.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : log.type === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                  {log.user && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      User: {log.user}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
