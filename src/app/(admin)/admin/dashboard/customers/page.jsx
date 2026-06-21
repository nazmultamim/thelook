'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, ChevronDown, ChevronUp, Shield,
  Trash2, Mail, Phone, Calendar, MoreHorizontal, UserCheck,
  UserX, Crown, User, RefreshCw, Filter,
  AlertTriangle, X, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useIsSuperAdmin } from '@/context/AuthProvider';
import { updateUserRole } from '@/app/actions/auth';

const ROLE_META = {
  super_admin: { label: 'Super Admin', color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  admin:       { label: 'Admin',       color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  user:        { label: 'Customer',    color: 'text-slate-600  bg-slate-50  border-slate-200',  dot: 'bg-slate-400'  },
};
const PAGE_SIZE = 10;

function Avatar({ name, email, size = 'md' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (email?.[0] ?? '?').toUpperCase();
  const dim = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#d97845] to-[#b8622f] text-white font-bold flex items-center justify-center shrink-0 shadow-sm select-none`}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] ?? ROLE_META.user;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ banned }) {
  return banned ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Banned
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
    </span>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#ede4da] w-full max-w-sm p-6 z-10">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-orange-100'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-orange-600'} />
        </div>
        <h3 className="text-[15px] font-bold text-[#2c1a0e] text-center mb-2">{title}</h3>
        <p className="text-[13px] text-[#9b8070] text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-[#e8d9cc] text-[#6b5244] text-[13px] font-semibold bg-white hover:bg-[#fdf5ee] transition-colors cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors cursor-pointer border-none ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#d97845] hover:bg-[#b8622f]'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-medium pointer-events-auto ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {t.type === 'error' ? <X size={15} /> : <Check size={15} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function ActionMenu({ user, isSuperAdmin, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isProtected = user.role === 'super_admin';
  const canAct = isSuperAdmin && !isProtected;

  const baseBtn = "w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors border-none bg-transparent text-left";
  const enabledBtn = `${baseBtn} cursor-pointer hover:bg-[#fdf0e6] text-[#3d2410]`;
  const disabledBtn = `${baseBtn} cursor-not-allowed text-[#c8b4a4]`;

  const act = (type) => { if (canAct) { onAction(type, user); setOpen(false); } };

  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f5ede4] text-[#9b8070] hover:text-[#d97845] transition-colors border-none bg-transparent cursor-pointer">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-[220px] bg-white rounded-xl border border-[#ede4da] shadow-[0_8px_30px_rgba(100,55,20,0.12)] z-20 overflow-hidden py-1">
          {isProtected ? (
            <p className="px-4 py-2.5 text-[12px] text-[#9b8070]">Super admins can't be modified here</p>
          ) : (
            <>
              {user.role !== 'admin' ? (
                <button disabled={!canAct} onClick={() => act('promote')} className={canAct ? enabledBtn : disabledBtn}>
                  <Crown size={14} className={canAct ? 'text-orange-500' : 'text-[#d4c4b8]'} /> Promote to Admin
                </button>
              ) : (
                <button disabled={!canAct} onClick={() => act('demote')} className={canAct ? enabledBtn : disabledBtn}>
                  <User size={14} className={canAct ? 'text-slate-500' : 'text-[#d4c4b8]'} /> Demote to Customer
                </button>
              )}
              <button disabled={!canAct} onClick={() => act(user.banned ? 'unban' : 'ban')} className={canAct ? enabledBtn : disabledBtn}>
                {user.banned
                  ? <><UserCheck size={14} className={canAct ? 'text-emerald-500' : 'text-[#d4c4b8]'} /> Unban User</>
                  : <><UserX size={14} className={canAct ? 'text-amber-500' : 'text-[#d4c4b8]'} /> Ban User</>}
              </button>
              <div className="border-t border-[#f0e8e0] my-1" />
              <button disabled={!canAct} onClick={() => act('delete')} className={canAct ? `${enabledBtn} text-red-600 hover:bg-red-50` : disabledBtn}>
                <Trash2 size={14} /> Delete User
              </button>
              {!isSuperAdmin && (
                <p className="px-4 pt-1.5 pb-0.5 text-[10.5px] text-[#b8a090]">Super admin only</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ExpandedRow({ user }) {
  return (
    <div className="px-6 pb-5 pt-2 bg-[#fdf8f3] border-t border-[#f0e8e0]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Email',   icon: Mail,     value: user.email },
          { label: 'Phone',   icon: Phone,    value: user.phone },
          { label: 'Joined',  icon: Calendar, value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
          { label: 'User ID', icon: null,     value: user.id, mono: true },
        ].map(({ label, icon: Icon, value, mono }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#ede4da]">
            <p className="text-[10px] text-[#9b8070] font-semibold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-center gap-2">
              {Icon && <Icon size={13} className="text-[#d97845] shrink-0" />}
              <p className={`text-[12px] text-[#2c1a0e] font-medium truncate ${mono ? 'font-mono text-[11px] text-[#9b8070]' : ''}`}>{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const supabase     = createClient();
  const isSuperAdmin = useIsSuperAdmin();

  const [users, setUsers]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [globalStats, setGlobalStats] = useState({ total: 0, admins: 0, active: 0, banned: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage]               = useState(1);
  const [expandedId, setExpandedId]   = useState(null);
  const [toasts, setToasts]           = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [dialog, setDialog]           = useState({ open: false });

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  // ── Fetch via the admin_list_users RPC (super_admin AND admin can read) ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_list_users');
      if (error) throw error;
      // RPC returns is_banned — normalize to `banned` once, here, so the
      // rest of the component doesn't need to know about the rename.
      const all = (data || []).map(u => ({ ...u, banned: u.is_banned }));

      setGlobalStats({
        total: all.length,
        admins: all.filter(u => u.role === 'admin').length,
        active: all.filter(u => !u.banned).length,
        banned: all.filter(u => u.banned).length,
      });

      let filtered = all;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(u => (u.full_name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s));
      }
      if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter);
      if (statusFilter === 'banned') filtered = filtered.filter(u => u.banned === true);
      if (statusFilter === 'active') filtered = filtered.filter(u => !u.banned);

      setTotal(filtered.length);
      const start = (page - 1) * PAGE_SIZE;
      const paged = filtered.slice(start, start + PAGE_SIZE);
      setUsers(paged);
    } catch (e) {
      toast(e.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, toast, supabase]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const handleAction = (type, user) => {
    if (!isSuperAdmin) return; // belt and suspenders — UI shouldn't even call this, but don't trust it blindly
    if (type === 'view') { setExpandedId(id => id === user.id ? null : user.id); return; }
    const configs = {
      promote: { title: 'Promote to Admin',    message: `Give ${user.full_name || user.email} admin access?`,              confirmLabel: 'Promote', danger: false, onConfirm: () => execAction('promote', user) },
      demote:  { title: 'Demote to Customer',  message: `Remove admin access from ${user.full_name || user.email}?`,        confirmLabel: 'Demote',  danger: false, onConfirm: () => execAction('demote', user)  },
      ban:     { title: 'Ban User',            message: `Ban ${user.full_name || user.email}? They won't be able to sign in.`, confirmLabel: 'Ban',   danger: true,  onConfirm: () => execAction('ban', user)     },
      unban:   { title: 'Unban User',          message: `Restore access for ${user.full_name || user.email}?`,              confirmLabel: 'Unban',   danger: false, onConfirm: () => execAction('unban', user)   },
      delete:  { title: 'Delete User',         message: `Permanently delete ${user.full_name || user.email}? Cannot be undone.`, confirmLabel: 'Delete', danger: true, onConfirm: () => execAction('delete', user) },
    };
    setDialog({ open: true, ...configs[type] });
  };

  const execAction = async (type, user) => {
    setDialog({ open: false });
    setActionLoading(user.id);
    try {
      if (type === 'promote') {
        const r = await updateUserRole(user.id, 'admin');
        if (r?.error) throw new Error(r.error);
        toast(`${user.full_name || 'User'} promoted to Admin`);
      }
      if (type === 'demote') {
        const r = await updateUserRole(user.id, 'user');
        if (r?.error) throw new Error(r.error);
        toast(`${user.full_name || 'User'} demoted to Customer`);
      }
      if (type === 'ban' || type === 'unban') {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: type }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'Action failed');
        toast(`${user.full_name || 'User'} ${type === 'ban' ? 'banned' : 'unbanned'}`);
      }
      if (type === 'delete') {
        const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'Delete failed');
        toast('User deleted');
      }
      await fetchUsers();
    } catch (e) {
      toast(e.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2c1a0e]">Customers</h1>
          <p className="text-[13px] text-[#9b8070] mt-0.5">{globalStats.total} registered user{globalStats.total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { fetchUsers(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e8d9cc] text-[#6b5244] text-[13px] font-medium hover:bg-white transition-colors bg-transparent cursor-pointer">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: globalStats.total,  icon: Users,     color: 'text-[#d97845] bg-orange-50' },
          { label: 'Admins',      value: globalStats.admins, icon: Shield,    color: 'text-purple-600 bg-purple-50' },
          { label: 'Active',      value: globalStats.active, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Banned',      value: globalStats.banned, icon: UserX,     color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#ede4da] p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
            <div>
              <p className="text-[22px] font-bold text-[#2c1a0e] leading-none">{value}</p>
              <p className="text-[11px] text-[#9b8070] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#ede4da] mb-4 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
          <Search size={14} className="text-[#b8a090] shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] placeholder:text-[#c8b4a4] w-full" />
          {search && <button onClick={() => setSearch('')} className="text-[#b8a090] hover:text-[#d97845] border-none bg-transparent cursor-pointer p-0"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-1.5 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
          <Filter size={13} className="text-[#b8a090]" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] cursor-pointer">
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">Customer</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#ede4da] overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_48px] gap-4 px-6 py-3 bg-[#fdf8f3] border-b border-[#f0e8e0]">
          {['User', 'Email', 'Role', 'Status', ''].map((h, i) => (
            <p key={i} className="text-[11px] font-semibold text-[#9b8070] uppercase tracking-wider m-0">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="text-[#d97845] animate-spin" />
              <p className="text-[13px] text-[#9b8070]">Loading users…</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f5ede4] flex items-center justify-center">
              <Users size={24} className="text-[#c8a080]" />
            </div>
            <p className="text-[14px] font-semibold text-[#2c1a0e]">No users found</p>
            <p className="text-[13px] text-[#9b8070]">Try adjusting your search or filters</p>
          </div>
        ) : users.map((u) => (
          <div key={u.id} className="border-b border-[#f5ede4] last:border-0">
            <div
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_48px] gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${expandedId === u.id ? 'bg-[#fdf5ee]' : 'hover:bg-[#fdfaf7]'} ${actionLoading === u.id ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => setExpandedId(id => id === u.id ? null : u.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.full_name} email={u.email} />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#2c1a0e] truncate">{u.full_name || 'No name'}</p>
                  <p className="text-[11px] text-[#9b8070] mt-0.5">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                {expandedId === u.id ? <ChevronUp size={14} className="text-[#d97845] shrink-0 ml-1" /> : <ChevronDown size={14} className="text-[#c8b4a4] shrink-0 ml-1" />}
              </div>
              <p className="text-[13px] text-[#6b5244] truncate">{u.email ?? '—'}</p>
              <div><RoleBadge role={u.role} /></div>
              <div><StatusBadge banned={u.banned} /></div>
              <div onClick={e => e.stopPropagation()}>
                <ActionMenu user={u} isSuperAdmin={isSuperAdmin} onAction={handleAction} />
              </div>
            </div>
            {expandedId === u.id && <ExpandedRow user={u} />}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-[13px] text-[#9b8070]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8d9cc] text-[#6b5244] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1).map((n, idx, arr) => (
              <span key={n} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== n - 1 && <span className="text-[#c8b4a4] text-[13px]">…</span>}
                <button onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors cursor-pointer border ${page === n ? 'bg-[#d97845] text-white border-[#d97845]' : 'border-[#e8d9cc] text-[#6b5244] bg-transparent hover:bg-white'}`}>
                  {n}
                </button>
              </span>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8d9cc] text-[#6b5244] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog open={dialog.open} title={dialog.title} message={dialog.message} confirmLabel={dialog.confirmLabel} danger={dialog.danger} onConfirm={dialog.onConfirm} onCancel={() => setDialog({ open: false })} />
      <Toast toasts={toasts} />
    </div>
  );
}