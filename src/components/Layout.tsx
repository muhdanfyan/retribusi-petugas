import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  Database,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'verifikator', 'kasir', 'viewer'],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin', 'opd'],
  },
  {
    label: 'Wajib Pajak',
    path: '/taxpayers',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin', 'opd'],
  },
  {
    label: 'Billing & Tagihan',
    path: '/billing',
    icon: <FileText className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'kasir'],
  },
  {
    label: 'Verifikasi',
    path: '/verification',
    icon: <CheckSquare className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'verifikator'],
  },
  {
    label: 'Reporting',
    path: '/reporting',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'viewer'],
  },
  {
    label: 'Master Data',
    path: '/master-data',
    icon: <Database className="w-5 h-5" />,
    roles: ['super_admin', 'opd'],
  },
  {
    label: 'Kelola OPD',
    path: '/opds',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['super_admin'],
  },
  {
    label: 'System Admin',
    path: '/system',
    icon: <Settings className="w-5 h-5" />,
    roles: ['super_admin'],
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-30 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <img src="/logo-baubau.png" alt="Logo Kota Baubau" className="w-10 h-10" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Admin Retribusi & Pajak
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Kota Baubau</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-45" />
                    <span className="hidden md:inline text-sm font-medium text-gray-700">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-blue-400 transition-transform group-hover:rotate-12" />
                    <span className="hidden md:inline text-sm font-medium text-gray-300">Dark</span>
                  </>
                )}
              </button>
            </div>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden sm:flex items-center gap-3 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-20 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="sm:hidden w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="pt-16 lg:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
