'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, FileText, Package2, ShoppingCart,
  Layers, Users, Megaphone, Tag, Settings, LifeBuoy
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { id: "dashboard",  icon: LayoutDashboard, label: "Dashboard",   badge: null, href: "/admin/dashboard" },
      { id: "analytics",  icon: BarChart3,       label: "Analytics",   badge: null, href: "/admin/dashboard/analytics" },
      { id: "reports",    icon: FileText,         label: "Reports",     badge: "New", href: "/admin/dashboard/reports" },
    ],
  },
  {
    label: "Store",
    items: [
      { id: "products",   icon: Package2,        label: "Products",    badge: "248", href: "/admin/dashboard/products" },
      { id: "orders",     icon: ShoppingCart,    label: "Orders",      badge: "12", href: "/admin/dashboard/orders" },
      { id: "inventory",  icon: Layers,           label: "Inventory",   badge: null, href: "/admin/dashboard/inventory" },
      { id: "customers",  icon: Users,            label: "Customers",   badge: null, href: "/admin/dashboard/customers" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { id: "campaigns",  icon: Megaphone,        label: "Campaigns",   badge: null, href: "/admin/dashboard/campaigns" },
      { id: "promotions", icon: Tag,              label: "Promotions",  badge: "3", href: "/admin/dashboard/promotions" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings",   icon: Settings,         label: "Settings",    badge: null, href: "/admin/dashboard/settings" },
      { id: "support",    icon: LifeBuoy,         label: "Support",     badge: null, href: "/admin/dashboard/support" },
    ],
  },
];

const normalizePath = (path) => {
  if (!path) return "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
};

const isActiveHref = (pathname, href) => {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target || current.startsWith(`${target}/`);
};

export default function Sidebar({ open, collapsed, onClose }) {
  const pathname = usePathname();
  const W_FULL = 256;
  const W_MINI = 68;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#18120a] border-r border-white/[0.07] overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: open ? (collapsed ? W_MINI : W_FULL) : 0 }}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07] min-h-[70px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97845] to-[#b8622f] flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-white font-black text-[14px]">F</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-extrabold text-[15px] m-0 leading-tight whitespace-nowrap">THELOOK</p>
              <p className="text-white/40 text-[10px] m-0 whitespace-nowrap tracking-wider uppercase">Admin Console</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-1">
              {!collapsed && (
                <p className="text-white/30 text-[9.5px] font-bold tracking-[1.8px] uppercase px-4 pt-3 pb-1.5 m-0 whitespace-nowrap">
                  {section.label}
                </p>
              )}
              {collapsed && <div className="my-2 mx-3 border-t border-white/[0.07]" />}

              {section.items.map(item => {
                const isActive = isActiveHref(pathname, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 mx-1 rounded-xl border-none cursor-pointer transition-all duration-150 text-left group relative mb-0.5
                      ${isActive
                        ? "bg-gradient-to-r from-[#d97845]/20 to-[#d97845]/5 text-[#d97845]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                      }`}
                    style={{ width: "calc(100% - 8px)" }}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#d97845] rounded-r-full" />}

                    <item.icon size={17} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.badge === "New"
                              ? "bg-[#d97845]/20 text-[#d97845]"
                              : "bg-white/10 text-white/60"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <div className={`flex items-center gap-2.5 px-1 py-1.5 rounded-xl ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d97845] to-[#b8622f] flex items-center justify-center shrink-0 text-white font-bold text-[12px] shadow">
              A
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-white/90 text-[12.5px] font-semibold m-0 truncate">Admin User</p>
                <p className="text-white/35 text-[10.5px] m-0 truncate">admin@fabrilife.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
