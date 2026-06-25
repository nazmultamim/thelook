'use client';

import { useRef, useState } from "react";
import {
    User,
    LayoutDashboard,
    Package,
    MapPin,
    LogOut,
    ChevronRight,
    ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";

function Avatar({ name, size = "sm" }) {
    const initials = name
        ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";
    const dim = size === "sm"
        ? "w-8 h-8 text-[13px]"
        : "w-12 h-12 text-[17px]";

    return (
        <div className={`${dim} rounded-full bg-gradient-to-br from-[#d97845] to-[#b8622f] text-white font-bold flex items-center justify-center shrink-0 shadow-sm`}>
            {initials}
        </div>
    );
}

export default function ProfileDropdown({ onNavigateLogin, onNavigateSignup }) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef(null);
    const router = useRouter();

    const { user, setSession, isLoggedIn, isAdmin, isSuperAdmin, loading } = useAuth();

    if (loading) return null;

    const menuItems = [
        {
            icon: LayoutDashboard, label: "Dashboard",
            href: isAdmin ? "/admin/dashboard/overview" : "/user/dashboard"
        },
        { icon: Package, label: "My Orders", href: "/orders" },
        { icon: MapPin, label: "Track Order", href: "/track-order" },
    ];

    const displayName = user?.user_metadata?.full_name || user?.email || "User";
    const firstName = displayName.split(" ")[0];

    const show = () => { clearTimeout(timerRef.current); setOpen(true); };
    const hide = () => { timerRef.current = setTimeout(() => setOpen(false), 160); };

    const handleSignOut = async () => {
        await signOut();
        await setSession(null);
        router.replace("/sign-in");
    };

    return (
        <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
            {/* Trigger */}
            <button className={`bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5 p-1 transition-colors duration-150 ${open || isLoggedIn ? "text-[#d97845]" : "text-[#2c1a0e] hover:text-[#d97845]"
                }`}>
                {isLoggedIn ? (
                    <Avatar name={displayName} size="sm" />
                ) : (
                    <User size={20} />
                )}
                <span className="text-[10px] font-medium tracking-[0.3px]">Profile</span>
            </button>

            {/* Dropdown */}
            <div className={`absolute top-[calc(100%+8px)] right-0 w-[256px] bg-white rounded-2xl border border-[#ede4da] shadow-[0_12px_40px_rgba(100,55,20,0.14)] z-[1100] transition-all duration-200 origin-top-right overflow-hidden ${open
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
                }`}>
                {/* Accent strip */}
                <div className="h-[3px] w-full bg-gradient-to-r from-[#d97845] via-[#e8a070] to-[#c86830]" />

                {isLoggedIn ? (
                    <>
                        {/* User info */}
                        <div className="px-5 py-4 flex items-center gap-3 border-b border-[#f0e8e0]">
                            <Avatar name={displayName} size="lg" />
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-[#2c1a0e] m-0 truncate">
                                    Hello, {firstName}
                                </p>
                                <p className="text-[11px] text-[#9b8070] m-0 truncate">
                                    {user?.email}
                                </p>
                                {/* Role badge — only renders for admins now */}
                                {isAdmin && (
                                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSuperAdmin
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {isSuperAdmin ? 'Super Admin' : 'Admin'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Menu */}
                        <div className="py-1.5">
                            {menuItems
                                .filter(item => !(isAdmin && ["My Orders", "Track Order"].includes(item.label)))
                                .map(({ icon: Icon, label, href }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        className="flex items-center gap-3 px-5 py-2.5 no-underline text-[#3d2410] text-[13.5px] font-medium group hover:bg-[#fdf0e6] transition-colors"
                                    >
                                        <Icon size={15} className="text-[#b8a090] group-hover:text-[#d97845] transition-colors shrink-0" />
                                        <span className="flex-1">{label}</span>
                                        <ChevronRight size={13} className="text-[#d4c4b8] group-hover:text-[#d97845] transition-colors" />
                                    </Link>
                                ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-[#f0e8e0] py-1.5">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-5 py-2.5 bg-transparent border-none cursor-pointer text-[#c0392b] text-[13.5px] font-semibold hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={15} className="shrink-0" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Guest state */}
                        <div className="px-5 pt-5 pb-4 text-center border-b border-[#f0e8e0]">
                            <div className="w-12 h-12 rounded-full bg-[#f5ede4] flex items-center justify-center mx-auto mb-3">
                                <User size={22} className="text-[#c8a080]" />
                            </div>
                            <p className="font-bold text-[#2c1a0e] text-[14px] m-0 mb-1">
                                Welcome to TheLook
                            </p>
                            <p className="text-[11.5px] text-[#9b8070] m-0 leading-snug">
                                Sign in for orders, wishlist &amp; more
                            </p>
                        </div>

                        {/* Auth buttons */}
                        <div className="px-5 py-4 flex flex-col gap-2.5">
                            <Link
                                href="/sign-in"
                                onClick={onNavigateLogin}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#d97845] hover:bg-[#b8622f] text-white rounded-xl font-semibold text-[13.5px] border-none cursor-pointer transition-colors shadow-[0_3px_10px_rgba(217,120,69,0.28)] no-underline"
                            >
                                Sign In <ArrowRight size={15} />
                            </Link>
                            <Link
                                href="/sign-up"
                                onClick={onNavigateSignup}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent hover:bg-[#fdf0e6] text-[#d97845] rounded-xl font-semibold text-[13.5px] border border-[#e8cdb8] cursor-pointer transition-colors no-underline"
                            >
                                Create Account
                            </Link>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#fdf5ee] border-t border-[#f0e8e0] px-5 py-2.5">
                            <p className="text-[11px] text-[#b8a090] m-0 text-center">
                                Premium fashion, delivered to your door.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}