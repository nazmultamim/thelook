import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/layout/mobile/MobileBottomNav";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <MobileBottomNav />
    </>
  );
}