'use client';

import { Home, LayoutGrid, ShoppingCart, MessageSquare, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

const items = [
  { label: "Home",     icon: Home,          href: "/",      active: true },
  { label: "Category", icon: LayoutGrid,    href: "/shop",  active: false },
  { label: "Cart",     icon: ShoppingCart,  href: "/cart",  active: false },
  { label: "Chat",     icon: MessageSquare, href: "/chat",  activeColor: "#d97845" },
];

export default function MobileBottomNav() {
  const { session, loading } = useAuth();

  if(loading) return null;
  
  const authItem = session?.user 
    ? { label: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard", active: false }
    : { label: "Login",     icon: User,            href: "/sign-in",        active: false };

  const allItems = [...items, authItem];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fffaf6] border-t border-[#e8d9cc] flex justify-around items-center pt-2 pb-3 z-[800] shadow-[0_-2px_12px_rgba(100,60,20,0.08)]">
      {allItems.map(({ label, icon: Icon, href, active, activeColor }) => (
        <Link
          key={label}
          href={href}
          className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-[3px] flex-1 no-underline text-inherit"
          style={{ color: active ? "#2c1a0e" : (activeColor || "#a08878") }}
        >
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
}
