import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Database,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Settings,
  Search,
  QrCode
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
    label: 'Wajib Pajak',
    path: '/taxpayers',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'kasir'],
  },
  {
    label: 'Billing & Tagihan',
    path: '/billing',
    icon: <FileText className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'kasir'],
  },
  {
    label: 'Reporting',
    path: '/reporting',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'viewer', 'kasir'],
  },
  {
    label: 'Master Data',
    path: '/master-data',
    icon: <Database className="w-5 h-5" />,
    roles: ['super_admin', 'opd', 'kasir'],
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-[#2d5cd5]/10 selection:text-[#2d5cd5]">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-[40] px-4 lg:px-8">
        <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-8">
          
          {/* Left: Brand & Toggle */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
            >
              {sidebarOpen ? <X size={22} className="text-slate-600" /> : <Menu size={22} className="text-slate-600" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#2d5cd5] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <img src="/logo-baubau.png" alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-0.5">
                  SIPANDA <span className="text-[#2d5cd5]">PETUGAS</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Kota Baubau</p>
              </div>
            </Link>
          </div>

          {/* Center: Search (Desktop Only) */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2d5cd5] transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Cari transaksi, WP, atau tagihan..." 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#2d5cd5]/20 focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all group"
                title="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Sun size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                ) : (
                  <Moon size={20} className="text-blue-400 group-hover:-rotate-12 transition-transform" />
                )}
              </button>
              <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all relative group">
                <Bell size={20} className="text-slate-500 group-hover:shake transition-transform" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50 ring-2 ring-rose-500/20"></span>
              </button>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>

            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 p-1.5 pr-4 pl-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-[#2d5cd5]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-[#2d5cd5]/10 group-hover:text-[#2d5cd5] transition-colors font-black overflow-hidden relative">
                {user?.name?.charAt(0) || <Users size={20} />}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2d5cd5]/10 to-transparent"></div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1 line-clamp-1">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user?.role.replace('_', ' ')}</p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="hidden lg:flex p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all active:scale-95"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-20 bottom-0 w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 z-[35] transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/10' : '-translate-x-full shadow-none'
        }`}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          
          <div className="flex-1 space-y-2">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Main Navigation</p>
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all relative group overflow-hidden ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-800 shadow-none'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d5cd5] to-blue-400 z-0"></div>
                  )}
                  <span className={`relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 font-bold text-sm tracking-tight">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full z-10 shadow-[0_0_8px_white]"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Account Card */}
          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-slate-400 group-hover:text-rose-600" />
                <span className="font-bold text-sm text-slate-600 group-hover:text-rose-600">Sign Out</span>
              </div>
              <ChevronLeft size={16} className="text-slate-300 transform rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-6 mt-6 px-4">
              <button className="text-slate-300 hover:text-slate-900 transition-colors"><Settings size={18} /></button>
              <button className="text-slate-300 hover:text-slate-900 transition-colors"><Bell size={18} /></button>
              <button className="text-slate-300 hover:text-slate-900 transition-colors"><Users size={18} /></button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[30] lg:hidden transition-opacity duration-500"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main 
        className={`pt-20 lg:pl-72 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}
      >
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-8 right-6 lg:hidden z-50">
        <button 
          onClick={() => navigate('/scanner')}
          className="w-16 h-16 bg-[#2d5cd5] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all border-4 border-white dark:border-slate-900"
        >
          <QrCode size={28} />
        </button>
      </div>
    </div>
  );
}
