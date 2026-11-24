'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/lib/types/hazard';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  switchRole: (newRole: UserRole) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  USER: {
    id: 'user-01',
    name: 'Vikram Sharma (Citizen)',
    email: 'vikram.citizen@floodguard.io',
    role: 'USER',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  ADMIN: {
    id: 'admin-01',
    name: 'Dr. Priya Nair (GIS Municipal Officer)',
    email: 'priya.nair@bbmp.gov.demo',
    role: 'ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  FIELD_WORKER: {
    id: 'worker-01',
    name: 'Ramesh Kumar (Emergency Road Crew #4)',
    email: 'ramesh.crew4@bbmp.gov.demo',
    role: 'FIELD_WORKER',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('USER');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USERS.USER);

  useEffect(() => {
    const saved = localStorage.getItem('floodguard_role') as UserRole;
    if (saved && DEFAULT_USERS[saved]) {
      setRole(saved);
      setUser(DEFAULT_USERS[saved]);
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(DEFAULT_USERS[newRole]);
    localStorage.setItem('floodguard_role', newRole);
  };

  const logout = () => {
    switchRole('USER');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        isAuthenticated: true,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
