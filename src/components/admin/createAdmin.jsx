'use client';

import { useState } from 'react';
import { useIsSuperAdmin } from '@/context/AuthProvider';
import { createAdmin } from '@/app/actions/auth';
import {
  User, Mail, Lock, Shield, Eye, EyeOff,
  X, Check, AlertTriangle, UserPlus
} from 'lucide-react';

// ── Input Field ───────────────────────────────────────────────────────────────
function InputField({ label, type = 'text', icon: Icon, value, onChange, placeholder, rightElement, error }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value?.length > 0;

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 bg-white transition-all duration-200 ${error
        ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
        : focused
          ? 'border-[#d97845] shadow-[0_0_0_3px_rgba(217,120,69,0.14)]'
          : hasValue
            ? 'border-[#c8a990]'
            : 'border-[#e8d9cc]'
        }`}>
        {Icon && (
          <Icon size={17} className={`shrink-0 transition-colors duration-200 ${focused ? 'text-[#d97845]' : 'text-[#b8a090]'}`} />
        )}
        <div className="flex-1 relative">
          <label className={`absolute left-0 transition-all duration-200 pointer-events-none select-none ${focused || hasValue
            ? 'text-[10px] top-0 text-[#d97845] font-semibold tracking-wide'
            : 'text-sm top-[9px] text-[#b8a090]'
            }`}>
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? placeholder : ''}
            className="w-full bg-transparent outline-none border-none text-[#2c1a0e] text-sm pt-4 pb-0 placeholder:text-[#c8b4a4]"
          />
        </div>
        {rightElement}
      </div>
      {error && <p className="text-red-500 text-[11px] mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ── Password Field ────────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      type={show ? 'text' : 'password'}
      icon={Lock}
      value={value}
      onChange={onChange}
      placeholder="••••••••"
      error={error}
      rightElement={
        <button type="button" onClick={() => setShow(p => !p)} tabIndex={-1}
          className="bg-transparent border-none cursor-pointer text-[#b8a090] hover:text-[#d97845] transition-colors p-0 flex">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}

// ── Role Selector ─────────────────────────────────────────────────────────────
function RoleSelector({ value, onChange }) {
  const options = [
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage products, categories, and view orders.',
      color: 'border-orange-300 bg-orange-50',
      activeColor: 'border-[#d97845] bg-orange-50 shadow-[0_0_0_3px_rgba(217,120,69,0.14)]',
      dot: 'bg-orange-500',
      icon: Shield,
      iconColor: 'text-orange-500',
    },
    {
      value: 'user',
      label: 'Customer',
      description: 'Regular account with shopping access only.',
      color: 'border-[#e8d9cc] bg-white',
      activeColor: 'border-[#d97845] bg-[#fdf8f3] shadow-[0_0_0_3px_rgba(217,120,69,0.14)]',
      dot: 'bg-slate-400',
      icon: User,
      iconColor: 'text-slate-500',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-[#9b8070] uppercase tracking-wider mb-1">Role</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${isActive ? opt.activeColor : opt.color + ' hover:border-[#c8a990]'}`}>
              {isActive && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#d97845] flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className="flex items-center gap-2">
                <Icon size={16} className={opt.iconColor} />
                <span className="text-[13px] font-bold text-[#2c1a0e]">{opt.label}</span>
              </div>
              <p className="text-[11px] text-[#9b8070] leading-snug">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
// ── Modal Component হিসেবে ব্যবহার করার জন্য ──────────────────────────────────
export function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const isSuperAdmin = useIsSuperAdmin();

  const [form, setForm] = useState({ fullName: '', email: '', phone: "", password: '', role: 'admin' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/[^0-9+]/g, '');

    setForm(p => ({ ...p, phone: cleanedValue }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone.trim() || form.phone.length < 7) errs.phone = "Valid phone number is required";
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      const result = await createAdmin({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      if (result?.error) setServerError(result.error);
      else {
        setSuccess(true);
        if (onSuccess) onSuccess(); // লিস্ট রিফ্রেশ করার জন্য
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) return null; // সুপার এডমিন না হলে রেন্ডার হবে না

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl border border-[#ede4da] shadow-2xl overflow-hidden w-full max-w-lg z-10">
        <div className="h-1 w-full bg-gradient-to-r from-[#d97845] via-[#e8a070] to-[#c86830]" />

        {success ? (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#d97845] flex items-center justify-center">
              <Check size={30} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="font-bold text-[#2c1a0e] text-[17px] mb-1">User Created!</p>
              <p className="text-[13px] text-[#9b8070]">
                <span className="font-semibold text-[#2c1a0e]">{form.email}</span> has been added.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setForm({ fullName: '', email: '', password: '', role: 'admin' }); setSuccess(false); }}
                className="px-5 py-2.5 rounded-xl border border-[#e8d9cc] text-[#6b5244] text-[13px] font-semibold bg-white hover:bg-[#fdf5ee] transition-colors cursor-pointer">
                Create Another
              </button>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#d97845] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b8622f] transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-[#2c1a0e]">Create New User</h2>
              <button type="button" onClick={onClose} className="text-[#b8a090] hover:text-[#d97845] bg-transparent border-none cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <InputField label="Full Name" icon={User} value={form.fullName} onChange={set('fullName')} placeholder="Jane Doe" error={errors.fullName} />
            <InputField label="Email Address" type="email" icon={Mail} value={form.email} onChange={set('email')} placeholder="jane@example.com" error={errors.email} />
            <InputField label="Phone" type="tel" icon={Mail} value={form.phone} onChange={handlePhoneChange} placeholder="+880 1234 567890" error={errors.phone} />
            <PasswordField label="Password" value={form.password} onChange={set('password')} error={errors.password} />
            <RoleSelector value={form.role} onChange={(role) => setForm(p => ({ ...p, role }))} />

            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-[13px]">{serverError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#e8d9cc] text-[#6b5244] text-[13px] font-semibold bg-white hover:bg-[#fdf5ee] transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={loading} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-bold border-none transition-all duration-200 ${loading ? 'bg-[#e8a070] cursor-not-allowed' : 'bg-[#d97845] hover:bg-[#b8622f] cursor-pointer shadow-[0_4px_14px_rgba(217,120,69,0.35)]'}`}>
                {loading ? 'Creating…' : <><UserPlus size={15} /> Create User</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}