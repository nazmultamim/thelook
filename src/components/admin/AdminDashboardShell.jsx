'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

const SECTION_LABELS = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  reports: "Reports",
  products: "Products",
  orders: "Orders",
  inventory: "Inventory",
  customers: "Customers",
  campaigns: "Campaigns",
  promotions: "Promotions",
  settings: "Settings",
  support: "Support",
};

const getSectionLabel = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[2] || "dashboard";
  return SECTION_LABELS[section] || section.charAt(0).toUpperCase() + section.slice(1);
};

export default function AdminDashboardShell({ children, onGoToShop }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
      setSidebarCollapsed(false);
      return;
    }

    if (!sidebarOpen) {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
      return;
    }

    setSidebarCollapsed(!sidebarCollapsed);
  };

  const W_FULL = 256;
  const W_MINI = 68;
  const marginLeft = sidebarOpen ? (sidebarCollapsed ? W_MINI : W_FULL) : 0;
  const sectionLabel = getSectionLabel(pathname);

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-sans">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      <TopBar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onGoToShop={onGoToShop || (() => router.push("/sign-in"))}
        sectionLabel={sectionLabel}
      />

      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft, paddingTop: 70 }}
      >
        <div className="p-4 md:p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
