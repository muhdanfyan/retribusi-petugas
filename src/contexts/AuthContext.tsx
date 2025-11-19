import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@baubau',
    password: 'superadmin123',
    role: 'super_admin' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Admin Dinas',
    email: 'dinas@baubau',
    password: 'admin123',
    role: 'admin_dinas' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
    department: 'Dishub',
  },
  {
    id: '6',
    name: 'Admin DPMPTSP',
    email: 'dpmptsp@baubau',
    password: 'admin123',
    role: 'admin_dinas' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
    department: 'DPMPTSP',
  },
  {
    id: '3',
    name: 'Verifikator',
    email: 'verifikator@baubau',
    password: 'ver123',
    role: 'verifikator' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Kasir',
    email: 'kasir@baubau',
    password: 'kasir123',
    role: 'kasir' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Viewer',
    email: 'viewer@baubau',
    password: 'view123',
    role: 'viewer' as UserRole,
    status: 'active' as const,
    createdAt: '2024-01-01',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = demoUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
