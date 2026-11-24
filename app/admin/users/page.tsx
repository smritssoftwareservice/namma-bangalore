'use client';

import React, { useState } from 'react';
import { Users, Shield, Wrench, User, Mail, CheckCircle2, UserPlus } from 'lucide-react';
import { UserRole } from '@/lib/types/hazard';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  reportsSubmitted: number;
  tasksCompleted: number;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'u-1',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@bbmp.gov.demo',
    role: 'ADMIN',
    department: 'Municipal GIS & Urban Infrastructure',
    reportsSubmitted: 4,
    tasksCompleted: 38,
  },
  {
    id: 'u-2',
    name: 'Ramesh Kumar',
    email: 'ramesh.crew4@bbmp.gov.demo',
    role: 'FIELD_WORKER',
    department: 'Zone 4 Emergency Road Repair Unit',
    reportsSubmitted: 0,
    tasksCompleted: 24,
  },
  {
    id: 'u-3',
    name: 'Santosh Gowda',
    email: 'santosh.crew2@bbmp.gov.demo',
    role: 'FIELD_WORKER',
    department: 'Zone 2 Stormwater & Drain Clearing Crew',
    reportsSubmitted: 1,
    tasksCompleted: 19,
  },
  {
    id: 'u-4',
    name: 'Vikram Sharma',
    email: 'vikram.citizen@floodguard.io',
    role: 'USER',
    department: 'Citizen Commuter (Whitefield RWA)',
    reportsSubmitted: 8,
    tasksCompleted: 0,
  },
  {
    id: 'u-5',
    name: 'Ananya Roy',
    email: 'ananya.roy@floodguard.io',
    role: 'USER',
    department: 'Citizen Commuter (Koramangala)',
    reportsSubmitted: 5,
    tasksCompleted: 0,
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">User & Field Crew Administration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign municipal staff roles, register field emergency units, and manage citizen permissions.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Department / Affiliate</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Reports / Tasks</th>
                <th className="p-4 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-white text-xs">{u.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {u.email}
                    </div>
                  </td>

                  <td className="p-4 text-slate-300">{u.department}</td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : u.role === 'FIELD_WORKER'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4 text-slate-300">
                    <div>Reports: <strong className="text-white">{u.reportsSubmitted}</strong></div>
                    <div>Repairs: <strong className="text-white">{u.tasksCompleted}</strong></div>
                  </td>

                  <td className="p-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="USER">USER (Citizen)</option>
                      <option value="FIELD_WORKER">FIELD_WORKER (Crew)</option>
                      <option value="ADMIN">ADMIN (GIS Command)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
