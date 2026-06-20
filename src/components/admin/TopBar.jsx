'use client';

import { useState, useRef, useEffect } from "react";
import { Menu, ChevronRight, Search, ShoppingBag, Bell, ChevronDown, User, Shield, Settings, LogOut } from "lucide-react";
import Link from "next/link";


const NOTIFS = [
    { text: "New order #ORD-5892 received", time: "2 min ago", dot: "#d97845" },
    { text: "Product 'Denim Jacket' low in stock", time: "18 min ago", dot: "#e53e3e" },
    { text: "Customer Fatema left a 5-star review", time: "1 hr ago", dot: "#5a8a5a" },
    { text: "Campaign 'Summer Sale' is live", time: "3 hrs ago", dot: "#4a7ab8" },
];

export default function TopBar({ sidebarOpen, sidebarCollapsed, onToggleSidebar, onGoToShop }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const W_FULL = 256;
    const W_MINI = 68;
    const marginLeft = sidebarOpen ? (sidebarCollapsed ? W_MINI : W_FULL) : 0;

    return (
        <header
            className="fixed top-0 right-0 z-30 bg-white border-b border-[#ede4da] flex items-center justify-between px-4 md:px-6 transition-all duration-300"
            style={{ left: marginLeft, height: 70 }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="w-9 h-9 rounded-xl border border-[#ede4da] bg-white hover:bg-[#fdf0e6] flex items-center justify-center cursor-pointer transition-all hover:border-[#d97845] text-[#2c1a0e] hover:text-[#d97845]"
                >
                    <Menu size={17} />
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-[13px]">
                    <span className="text-[#9b8070]">Admin</span>
                    <ChevronRight size={13} className="text-[#c4b0a0]" />
                    <span className="font-semibold text-[#2c1a0e]">Dashboard</span>
                </div>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-[380px] mx-6">
                <div className="relative w-full">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a090]" />
                    <input
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        placeholder="Search orders, products, customers…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e8d9cc] bg-[#fdf8f3] text-[13px] text-[#2c1a0e] placeholder:text-[#b8a090] outline-none focus:border-[#d97845] focus:ring-2 focus:ring-[#d97845]/15 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href='/shop'
                    className="hidden sm:flex items-center gap-1.5 text-[12.5px] font-medium text-[#9b8070] hover:text-[#d97845] border border-[#e8d9cc] hover:border-[#d97845] rounded-xl px-3 py-2 transition-all cursor-pointer bg-transparent"
                >
                    <ShoppingBag size={14} />
                    <span className="hidden md:inline">View Shop</span>
                </Link>

                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                        className="relative w-9 h-9 rounded-xl border border-[#ede4da] bg-white hover:bg-[#fdf0e6] hover:border-[#d97845] flex items-center justify-center cursor-pointer transition-all text-[#2c1a0e] hover:text-[#d97845]"
                    >
                        <Bell size={16} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d97845] rounded-full ring-2 ring-white" />
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-12 w-[320px] bg-white rounded-2xl border border-[#ede4da] shadow-[0_20px_60px_rgba(60,30,10,0.15)] z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0e8e0]">
                                <p className="font-bold text-[14px] text-[#2c1a0e] m-0">Notifications</p>
                                <span className="text-[10.5px] font-bold bg-[#d97845] text-white px-2 py-0.5 rounded-full">4 new</span>
                            </div>
                            {NOTIFS.map((n, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#fdf8f3] cursor-pointer border-b border-[#faf3ec] last:border-b-0 transition-colors">
                                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                                    <div className="flex-1">
                                        <p className="text-[12.5px] text-[#2c1a0e] m-0 leading-snug">{n.text}</p>
                                        <p className="text-[11px] text-[#9b8070] m-0 mt-0.5">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="px-4 py-2.5 text-center">
                                <button className="text-[12.5px] font-semibold text-[#d97845] cursor-pointer bg-transparent border-none hover:underline">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-[#ede4da] bg-white hover:bg-[#fdf0e6] hover:border-[#d97845] cursor-pointer transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d97845] to-[#b8622f] flex items-center justify-center text-white font-bold text-[12px] shadow">
                            A
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-[12.5px] font-semibold text-[#2c1a0e] m-0 leading-tight">Admin User</p>
                            <p className="text-[10.5px] text-[#9b8070] m-0">Super Admin</p>
                        </div>
                        <ChevronDown size={13} className={`text-[#9b8070] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-12 w-[200px] bg-white rounded-2xl border border-[#ede4da] shadow-[0_20px_60px_rgba(60,30,10,0.15)] z-50 overflow-hidden py-1.5">
                            {[
                                { icon: User, label: "My Profile" },
                                { icon: Shield, label: "Permissions" },
                                { icon: Settings, label: "Settings" },
                            ].map(({ icon: Icon, label }) => (
                                <button key={label}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#2c1a0e] hover:bg-[#fdf0e6] hover:text-[#d97845] transition-colors cursor-pointer bg-transparent border-none text-left"
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                            <div className="mx-3 my-1 border-t border-[#f0e8e0]" />
                            <button
                                onClick={onGoToShop}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none text-left"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}