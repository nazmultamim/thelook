'use client';

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import DashboardContent from "@/components/admin/DashboardContent";

export default function AdminDash({ onGoToShop }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
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
    } else {
      if (!sidebarOpen) {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(!sidebarCollapsed);
      }
    }
  };

  const W_FULL = 256;
  const W_MINI = 68;
  const marginLeft = sidebarOpen ? (sidebarCollapsed ? W_MINI : W_FULL) : 0;

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-sans">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
        active={activePage}
        setActive={setActivePage}
      />

      <TopBar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onGoToShop={onGoToShop}
      />

      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft, paddingTop: 70 }}
      >
        <div className="p-4 md:p-6 max-w-[1400px]">
          {activePage === "dashboard" && <DashboardContent />}

          {activePage !== "dashboard" && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#fdf0e6] flex items-center justify-center mb-4">
                <Zap size={28} className="text-[#d97845]" />
              </div>
              <h2 className="text-[20px] font-extrabold text-[#2c1a0e] m-0 mb-2 capitalize">{activePage}</h2>
              <p className="text-[13px] text-[#9b8070] m-0">This section is coming soon. Stay tuned!</p>
              <button
                onClick={() => setActivePage("dashboard")}
                className="mt-5 px-5 py-2.5 bg-[#d97845] hover:bg-[#b8622f] text-white rounded-xl border-none cursor-pointer text-[13px] font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}