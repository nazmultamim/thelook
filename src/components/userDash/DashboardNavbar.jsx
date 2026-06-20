'use client';

import { useState, useRef, useEffect } from "react";
import {
    User,
    Settings,
    Truck,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    Users,
    Menu,
    X,
    ArrowLeft,
} from "lucide-react";
import Logo from "../ui/logo";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
    { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "#orders", icon: ShoppingBag },
    { label: "Addresses", href: "#addresses", icon: MapPin },
    { label: "FabriSquad", href: "#fabrisquad", icon: Users },
];

const DROPDOWN_ITEMS = [
    { icon: User, label: "My Profile", href: "#profile" },
    { icon: Settings, label: "Settings", href: "#settings" },
    { icon: Truck, label: "Track Order", href: "#track-order" },
];



/* ── Desktop hover dropdown ─────────────────────────────────────────── */
function UserDropdown({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef(null);

    const show = () => { clearTimeout(timerRef.current); setOpen(true); };
    const hide = () => { timerRef.current = setTimeout(() => setOpen(false), 160); };

    const initial = user?.name?.charAt(0).toUpperCase() ?? "U";
    const firstName = user?.name?.split(" ")[0] ?? "User";

    return (
        <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
            <button className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[#f5f0ea] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#2c1a0e] text-[#fdf8f3] text-[13px] font-bold flex items-center justify-center shrink-0">
                    {initial}
                </div>
                <span className="text-[14px] font-semibold text-[#2c1a0e]">{firstName}</span>
                <ChevronDown size={15} className={`text-[#9b8070] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            <div className={`absolute top-[calc(100%+8px)] right-0 w-[220px] bg-white rounded-xl border border-[#ede4da] shadow-[0_8px_28px_rgba(60,30,10,0.13)] z-[1100] transition-all duration-200 origin-top-right overflow-hidden ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="px-4 py-3.5 border-b border-[#f0e8e0] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2c1a0e] text-[#fdf8f3] text-[14px] font-bold flex items-center justify-center shrink-0">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#2c1a0e] m-0 truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#9b8070] m-0 truncate">{user?.email}</p>
                    </div>
                </div>

                <div className="py-1">
                    {DROPDOWN_ITEMS.map(({ icon: Icon, label, href }) => (
                        <a key={label} href={href} className="flex items-center gap-3 px-4 py-2.5 no-underline text-[#3d2410] text-[13px] font-medium group hover:bg-[#fdf0e6] transition-colors">
                            <Icon size={15} className="text-[#b8a090] group-hover:text-[#d97845] shrink-0 transition-colors" />
                            {label}
                        </a>
                    ))}
                </div>

                <div className="border-t border-[#f0e8e0] py-1">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none cursor-pointer text-[#c0392b] text-[13px] font-semibold hover:bg-red-50 transition-colors">
                        <LogOut size={15} className="shrink-0" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Mobile drawer ──────────────────────────────────────────────────── */
function MobileDrawer({ isOpen, onClose, activeLink, user, onLogout }) {
    const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-[1050] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* Panel */}
            <div className={`fixed top-0 left-0 h-full w-[300px] bg-white z-[1100] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#f0e8e0] shrink-0">
                    <span className="font-bold text-[15px] text-[#2c1a0e]">Menu</span>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#9b8070] p-1 flex">
                        <X size={20} />
                    </button>
                </div>

                {/* User info */}
                {user && (
                    <div className="px-5 py-4 border-b border-[#f5ede4] flex items-center gap-3 bg-[#fdf8f4]">
                        <div className="w-10 h-10 rounded-full bg-[#2c1a0e] text-[#fdf8f3] text-[15px] font-bold flex items-center justify-center shrink-0">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-[#2c1a0e] m-0 truncate">{user.name}</p>
                            <p className="text-[11px] text-[#9b8070] m-0 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Nav section */}
                <div className="flex-1 overflow-y-auto py-2">
                    <p className="text-[10px] font-bold tracking-[1.5px] text-[#b8a090] uppercase px-5 pt-3 pb-1">Navigation</p>
                    {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-5 py-3 no-underline text-[14px] font-medium transition-colors ${activeLink === label
                                ? "text-[#d97845] bg-[#fdf0e6]"
                                : "text-[#3d2410] hover:bg-[#faf4ee]"
                                }`}
                        >
                            <Icon size={16} className={activeLink === label ? "text-[#d97845]" : "text-[#b8a090]"} />
                            {label}
                        </Link>
                    ))}

                    <div className="mx-5 my-3 border-t border-[#f0e8e0]" />

                    <p className="text-[10px] font-bold tracking-[1.5px] text-[#b8a090] uppercase px-5 pb-1">Account</p>
                    {DROPDOWN_ITEMS.map(({ icon: Icon, label, href }) => (
                        <Link key={label} href={href} onClick={onClose} className="flex items-center gap-3 px-5 py-3 no-underline text-[14px] font-medium text-[#3d2410] hover:bg-[#faf4ee] transition-colors">
                            <Icon size={16} className="text-[#b8a090]" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Footer actions */}
                <div className="border-t border-[#f0e8e0] p-4 flex flex-col gap-2.5 shrink-0">
                    <Link
                        href='/shop'
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#d97845] hover:bg-[#b8622f] text-white rounded-xl font-semibold text-[13.5px] border-none cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Go to Shop
                    </Link>
                    <button
                        onClick={() => { onLogout(); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent hover:bg-red-50 text-[#c0392b] rounded-xl font-semibold text-[13.5px] border border-red-200 cursor-pointer transition-colors"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}

/* ── Main export ────────────────────────────────────────────────────── */
export default function DashboardNavbar({ activeLink = "Dashboard" }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();
    const { session, supabase, loading } = useAuth()

    // Build user object from session
    const user = {
        name: session?.user?.user_metadata?.full_name || session?.user?.email || "User",
        email: session?.user?.email || ""
    };

    const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

    const logout = async () => {
        await supabase.auth.signOut();
        setDrawerOpen(false);
        router.push("/sign-in");
    };

    if (loading) return null;


    return (
        <>
            <nav className="sticky top-0 z-[900] bg-white border-b border-[#e8e0d8] shadow-[0_1px_4px_rgba(60,30,10,0.06)]">
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[60px] flex items-center gap-4 md:gap-8">

                    {/* ── Mobile layout ── */}
                    <div className="flex md:hidden items-center justify-between w-full">
                        {/* Hamburger */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="bg-transparent border-none cursor-pointer text-[#2c1a0e] p-1 flex"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Centered logo */}
                        <Logo />

                        {/* Avatar only — tap opens drawer */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="bg-transparent border-none cursor-pointer p-1 flex"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#2c1a0e] text-[#fdf8f3] text-[13px] font-bold flex items-center justify-center">
                                {initial}
                            </div>
                        </button>
                    </div>

                    {/* ── Desktop layout ── */}
                    <div className="hidden md:flex items-center gap-8 w-full">
                        <Logo />

                        {/* Nav links */}
                        <div className="flex items-center gap-1 flex-1">
                            {NAV_LINKS.map(({ label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className={`px-3.5 py-2 rounded-lg text-[13.5px] font-medium no-underline transition-colors duration-150 ${activeLink === label
                                        ? "text-[#2c1a0e] bg-[#f5ede4] font-semibold"
                                        : "text-[#6b5545] hover:text-[#2c1a0e] hover:bg-[#faf4ee]"
                                        }`}
                                >
                                    {label}
                                </a>
                            ))}
                            <Link
                                href="/shop"
                                className="ml-1 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold text-[#d97845] hover:text-[#b8622f] hover:bg-[#fdf0e6] bg-transparent border-none cursor-pointer transition-colors duration-150"
                            >
                                Go to Shop
                            </Link>
                        </div>

                        {/* Desktop user dropdown */}
                        {user && <UserDropdown user={user} onLogout={logout} />}
                    </div>

                </div>
            </nav>

            {/* Mobile drawer */}
            <MobileDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                activeLink={activeLink}
                user={user}
                onLogout={logout}
            />
        </>
    );
}
