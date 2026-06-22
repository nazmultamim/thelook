'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown, X, Home, LayoutGrid, Heart, FileText, User, LogOut, LayoutDashboard } from "lucide-react";
import { FaStar, FaTruck, FaFire, FaMale, FaFemale, FaChild, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "@/context/AuthProvider";
import { signOut } from "@/app/actions/auth";

const navLinks = [
  {
    label: "Home",
    icon: <Home size={20} className="text-[#8a6a55]" />,
    href: "/"
  },
  {
    label: "Shop All",
    icon: <LayoutGrid size={20} className="text-[#8a6a55]" />,
    href: "/shop"
  },
  {
    label: "New Arrivals",
    icon: <FaStar size={20} className="text-green-500" />,
    href: "/"
  },
  {
    label: "Free Delivery",
    color: "#3b82f6",
    icon: <FaTruck size={20} className="text-blue-500" />,
    href: "/"
  },
  {
    label: "Top Selling",
    icon: <FaFire size={20} className="text-[#d97845]" />,
    href: "/"
  },
];

const categories = [
  {
    label: "Men's Collection",
    icon: <FaMale size={20} className="text-[#8a6a55]" />,
    sub: ["T-Shirts", "Shirts", "Pants", "Jackets"],
  },
  {
    label: "Women's Collection",
    icon: <FaFemale size={20} className="text-[#8a6a55]" />,
    sub: ["Dresses", "Tops", "Pants", "Coats"],
  },
  {
    label: "Kids Collection",
    icon: <FaChild size={20} className="text-[#8a6a55]" />,
    sub: ["Boys", "Girls", "Shoes"],
  },
  {
    label: "Teens Collection",
    icon: <FaGraduationCap size={20} className="text-[#8a6a55]" />,
    sub: ["Hoodies", "T-Shirts", "Jeans"],
  },
];

const getAccountLinks = (isAdmin) => {
  if (isAdmin) {
    return [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={20} className="text-[#8a6a55]" />,
        href: "/admin/dashboard/overview",
      },
      {
        label: "My Profile",
        icon: <User size={20} className="text-[#8a6a55]" />,
        href: "/admin/dashboard/profile",
      },
    ];
  }

  return [
    {
      label: "My Orders",
      icon: <FileText size={20} className="text-[#8a6a55]" />,
      href: "/user/orders",
    },
    {
      label: "My Wishlist",
      icon: <Heart size={20} className="text-[#8a6a55]" />,
      href: "/user/wishlist",
    },
    {
      label: "My Profile",
      icon: <User size={20} className="text-[#8a6a55]" />,
      href: "/user/profile",
    },
  ];
};
export default function MobileSidebar({ isOpen, onClose }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const router = useRouter();
  const { user, loading, setSession, isLoggedIn, isAdmin, isSuperAdmin } = useAuth();

  const accountLinks = getAccountLinks(isAdmin || isSuperAdmin);

  const toggleCat = (label) => {
    setExpandedCat(prev => prev === label ? null : label);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    await setSession(null);
    router.push("/sign-in"); // redirect
  };

  const userName = user?.user_metadata?.full_name || user?.email || "User";

  if (loading) return null;


  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[998] bg-black/40 transition-opacity duration-[250ms] ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[min(320px,85vw)] bg-[#fffaf6] z-[999] flex flex-col overflow-y-auto shadow-[4px_0_24px_rgba(100,60,20,0.15)] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="bg-[#2c1a0e] text-[#fdf8f3] px-[18px] pt-5 pb-[18px] sticky top-0 z-[1]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-base">Welcome to Finelife</span>
            <button
              onClick={onClose}
              className="bg-white/[0.12] border-none cursor-pointer text-[#fdf8f3] w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf8f3]/15 text-[#fdf8f3]">
                <User size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{userName}</p>
                <p className="truncate text-xs text-[#d8c4b3]">Signed in</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Link href="/sign-in" className="flex-1 py-2.5 bg-[#fdf8f3] text-[#2c1a0e] border-none rounded-lg font-bold text-sm text-center hover:bg-[#f0e4d6] transition-colors">
                Login
              </Link>
              <Link href="/sign-up" className="flex-1 py-2.5 bg-[#d97845] text-white border-none rounded-lg font-bold text-sm text-center hover:bg-[#b8622f] transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="py-2">
          {navLinks.map(({ label, icon, color, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-4 px-5 py-[13px] no-underline border-b border-[#f0e4d8] text-[15px] font-medium transition-colors hover:bg-[#fdf0e6]"
              style={{ color: color || "#2c1a0e" }}
            >
              <span className="w-6 flex justify-center">{icon}</span>
              {label}
            </a>
          ))}
        </div>

        <div className="h-px bg-[#e8d9cc] my-1" />

        {/* Categories */}
        <div className="px-5 pt-3.5 pb-1.5">
          <span className="text-[11px] font-bold tracking-[1.5px] text-[#b8a090] uppercase">
            Categories
          </span>
        </div>
        <div>
          {categories.map(({ label, icon, sub }) => (
            <div key={label}>
              <button
                onClick={() => toggleCat(label)}
                className="w-full flex items-center gap-4 px-5 py-[13px] bg-transparent border-none border-b border-[#f0e4d8] cursor-pointer text-left transition-colors hover:bg-[#fdf0e6]"
              >
                <span className="w-6 flex justify-center">{icon}</span>
                <span className="flex-1 text-[15px] font-medium text-[#2c1a0e]">{label}</span>
                {expandedCat === label
                  ? <ChevronDown size={16} className="text-[#b8a090]" />
                  : <ChevronRight size={16} className="text-[#b8a090]" />
                }
              </button>
              {expandedCat === label && (
                <div className="bg-[#fdf5ee] border-b border-[#f0e4d8]">
                  {sub.map(item => (
                    <a
                      key={item}
                      href="#"
                      className="block py-2.5 pl-[60px] pr-5 text-sm text-[#5a3e2e] no-underline border-b border-[#f0e4d8] transition-colors hover:text-[#d97845]"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-px bg-[#e8d9cc] my-1" />

        {/* My Account */}
        <div className="px-5 pt-3.5 pb-1.5">
          <span className="text-[11px] font-bold tracking-[1.5px] text-[#b8a090] uppercase">
            My Account
          </span>
        </div>
        <div className="pb-6">
          {accountLinks.map(({ label, icon, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-4 px-5 py-[13px] no-underline text-[#2c1a0e] text-[15px] font-medium border-b border-[#f0e4d8] transition-colors hover:bg-[#fdf0e6]"
            >
              <span className="w-6 flex justify-center">{icon}</span>
              {label}
            </a>
          ))}
        </div>

        {isLoggedIn && (
          <div className="mt-auto px-4 pb-5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#d97845] text-white rounded-xl font-semibold text-sm hover:bg-[#b8622f] transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
