import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  FileText,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { UserSession, UserRole } from '../types/analytics';
import { INITIAL_USERS } from '../data/mockDatabase';

interface DjangoAuthManagerProps {
  currentUser: UserSession;
  onSelectUser: (user: UserSession) => void;
}

const ALL_SYSTEM_PERMISSIONS = [
  { codename: 'analytics.execute_ddl', name: 'Execute Database DDL & Schema Migrations', restrictedTo: ['django_admin'] },
  { codename: 'analytics.purge_partitions', name: 'Purge / Truncate Historical Partitions', restrictedTo: ['django_admin'] },
  { codename: 'celery.kill_worker', name: 'Restart / Terminate Celery Workers', restrictedTo: ['django_admin'] },
  { codename: 'celery.trigger_task', name: 'Dispatch Asynchronous Background Tasks', restrictedTo: ['django_admin', 'data_engineer'] },
  { codename: 'analytics.query_raw_logs', name: 'Execute Raw SQL Queries in PostgreSQL', restrictedTo: ['django_admin', 'data_engineer'] },
  { codename: 'flask.retrain_isolation_forest', name: 'Trigger Flask ML Anomaly Retrain', restrictedTo: ['django_admin', 'data_engineer'] },
  { codename: 'audit.view_compliance_logs', name: 'Inspect Security Audit & Session Logs', restrictedTo: ['django_admin', 'security_auditor'] },
  { codename: 'analytics.view_dashboards', name: 'View Real-Time & Historical Dashboards', restrictedTo: ['django_admin', 'data_engineer', 'security_auditor', 'business_analyst'] },
  { codename: 'analytics.export_reports', name: 'Export Telemetry Datasets (CSV/JSON)', restrictedTo: ['django_admin', 'data_engineer', 'security_auditor', 'business_analyst'] }
];

export const DjangoAuthManager: React.FC<DjangoAuthManagerProps> = ({
  currentUser,
  onSelectUser
}) => {
  const [users, setUsers] = useState<UserSession[]>(INITIAL_USERS);
  const [testedPermission, setTestedPermission] = useState<string>('analytics.execute_ddl');
  const [testResult, setTestResult] = useState<{ allowed: boolean; message: string } | null>(null);

  const handleTestPermission = (permCodename: string) => {
    setTestedPermission(permCodename);
    const perm = ALL_SYSTEM_PERMISSIONS.find(p => p.codename === permCodename);
    if (!perm) return;

    const isAllowed = perm.restrictedTo.includes(currentUser.role);
    setTestResult({
      allowed: isAllowed,
      message: isAllowed
        ? `Permission GRANTED: User '${currentUser.username}' (${currentUser.role}) satisfies @permission_required('${permCodename}').`
        : `HTTP 403 FORBIDDEN: User '${currentUser.username}' with role '${currentUser.role}' lacks permission '${permCodename}'. Access rejected by Django RBAC.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">
                Django Administrative Framework & RBAC Authentication Service
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Argon2 Password Hashing
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Provides centralized user identity, token verification, session lifecycle auditing, and fine-grained permissions. 
              Protected with Django's built-in <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">auth_user</code> relational model and group-based authorization rules.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-purple-800/40 text-xs font-mono">
            <div className="text-slate-400">Current Active Session:</div>
            <div className="text-white font-bold">{currentUser.username} ({currentUser.role})</div>
            <div className="text-purple-300 text-[10px] truncate max-w-[200px]">{currentUser.token}</div>
          </div>
        </div>
      </div>

      {/* User Management & RBAC Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Django Auth User Accounts (<code className="text-xs text-cyan-300">auth_user</code>)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch users to test how permissions change dynamically across the application
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">RBAC Role</th>
                  <th className="py-2.5 px-3">MFA Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={isCurrent ? 'bg-purple-950/20 font-bold' : 'hover:bg-slate-800/40'}>
                      <td className="py-2.5 px-3 text-white flex items-center gap-1.5">
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                        {u.username}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === 'django_admin'
                            ? 'bg-purple-900/60 text-purple-200 border border-purple-700'
                            : u.role === 'data_engineer'
                            ? 'bg-blue-900/60 text-blue-200 border border-blue-700'
                            : u.role === 'security_auditor'
                            ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                            : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">Enforced (TOTP)</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">{u.lastLogin.split(' ')[0]}</td>
                      <td className="py-2.5 px-3 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-purple-400 font-bold">Active User</span>
                        ) : (
                          <button
                            onClick={() => onSelectUser(u)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] transition cursor-pointer"
                          >
                            Impersonate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live RBAC Permission Tester (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              RBAC Permission Checker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates Django <code className="text-cyan-400">@permission_required</code> decorator
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block text-slate-300 font-medium">Select Action to Test:</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_SYSTEM_PERMISSIONS.map((p) => (
                <button
                  key={p.codename}
                  onClick={() => handleTestPermission(p.codename)}
                  className={`w-full text-left p-2 rounded-lg border text-[11px] transition cursor-pointer ${
                    testedPermission === p.codename
                      ? 'bg-purple-950/80 border-purple-600 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.codename}</div>
                </button>
              ))}
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs font-mono mt-3 ${
                testResult.allowed
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {testResult.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{testResult.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED (403)'}</span>
                </div>
                <div className="text-[11px] leading-relaxed">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Audit Log View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Django Security Audit Trail (<code className="text-xs text-amber-300">security_audit_log</code>)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks authentication attempts, elevated permission calls, and anomalous queries
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">User Agent</th>
                <th className="py-2 px-3 text-right">Security Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-slate-400">2026-09-29 16:32:10 UTC</td>
                <td className="py-2 px-3 text-white font-bold">alex_admin</td>
                <td className="py-2 px-3 text-cyan-300">AUTH_MFA_VERIFY_SUCCESS</td>
                <td className="py-2 px-3 text-slate-400">198.51.100.24</td>
                <td className="py-2 px-3 text-slate-500">Mozilla/5.0 (Macintosh; Intel...)</td>
                <td className="py-2 px-3 text-right text-emerald-400 font-bold">SUCCESS</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-slate-400">2026-09-29 16:15:42 UTC</td>
                <td className="py-2 px-3 text-white font-bold">priya_dataeng</td>
                <td className="py-2 px-3 text-indigo-300">CELERY_TASK_DISPATCH</td>
                <td className="py-2 px-3 text-slate-400">198.51.100.89</td>
                <td className="py-2 px-3 text-slate-500">FastAPI/AsyncClient 0.27</td>
                <td className="py-2 px-3 text-right text-emerald-400 font-bold">SUCCESS</td>
              </tr>
              <tr className="hover:bg-slate-800/40 bg-rose-950/20">
                <td className="py-2 px-3 text-slate-400">2026-09-29 15:58:01 UTC</td>
                <td className="py-2 px-3 text-white font-bold">elena_analyst</td>
                <td className="py-2 px-3 text-rose-300">UNAUTHORIZED_DDL_ATTEMPT</td>
                <td className="py-2 px-3 text-slate-400">203.0.113.45</td>
                <td className="py-2 px-3 text-slate-500">PostmanRuntime/7.39.0</td>
                <td className="py-2 px-3 text-right text-rose-400 font-bold">BLOCKED (403)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
