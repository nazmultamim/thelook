'use client';


import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Heart, ShoppingBag, Menu } from "lucide-react";
import MobileSidebar from "./layout/mobile/MobileSidebar";
import ProfileDropdown from "./ui/ProfileDropdown";
import Logo from "./ui/logo";
import { useAuth } from "@/context/AuthProvider";


const categories = [
  {
    label: "MEN",
    items: [
      { section: "Clothing", links: ["T-Shirts", "Shirts", "Pants", "Shorts", "Jackets", "Sweaters"] },
      { section: "Accessories", links: ["Belts", "Wallets", "Watches", "Sunglasses"] },
      { section: "Footwear", links: ["Sneakers", "Loafers", "Boots", "Sandals"] },
    ],
  },
  {
    label: "WOMEN",
    items: [
      { section: "Clothing", links: ["Dresses", "Tops", "Pants", "Skirts", "Blouses", "Coats"] },
      { section: "Accessories", links: ["Bags", "Jewelry", "Scarves", "Sunglasses"] },
      { section: "Footwear", links: ["Heels", "Flats", "Sneakers", "Boots"] },
    ],
  },
  {
    label: "TEENS",
    items: [
      { section: "Clothing", links: ["Hoodies", "T-Shirts", "Jeans", "Shorts"] },
      { section: "Accessories", links: ["Caps", "Bags", "Bracelets"] },
      { section: "Footwear", links: ["Sneakers", "Slides", "Boots"] },
    ],
  },
  {
    label: "KIDS",
    items: [
      { section: "Boys", links: ["T-Shirts", "Pants", "Jackets", "Shorts"] },
      { section: "Girls", links: ["Dresses", "Tops", "Leggings", "Skirts"] },
      { section: "Shoes", links: ["Sneakers", "Sandals", "Boots"] },
    ],
  },
  {
    label: "SPORTS",
    items: [
      { section: "Men Sports", links: ["Running", "Training", "Swimming", "Cycling"] },
      { section: "Women Sports", links: ["Yoga", "Running", "Training", "Pilates"] },
      { section: "Equipment", links: ["Bags", "Socks", "Caps", "Gloves"] },
    ],
  },
];



function DropdownMenu({ items }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-[#fffaf6] border border-[#e8d9cc] shadow-[0_8px_32px_rgba(100,60,20,0.10)] rounded p-6 min-w-[480px] flex gap-8 z-[1000]">
      {items.map((group) => (
        <div key={group.section}>
          <div className="font-bold text-[11px] tracking-[1.5px] text-[#b8a090] mb-2.5 uppercase">
            {group.section}
          </div>
          <ul className="list-none m-0 p-0 flex flex-col gap-2">
            {group.links.map((link) => (
              <li key={link}>
                <a href="#" className="no-underline text-[#2c1a0e] text-sm transition-colors duration-150 hover:text-[#d97845]">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function NavItem({ category }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => { clearTimeout(timerRef.current); setOpen(true); };
  const handleMouseLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150); };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={`bg-transparent border-x-0 border-t-0 border-b-2 cursor-pointer font-semibold text-[13px] tracking-[1px] px-1 h-16 transition-colors duration-150 ${open ? "text-[#d97845] border-[#d97845]" : "text-[#2c1a0e] border-transparent"
          }`}
      >
        {category.label}
      </button>
      {open && <DropdownMenu items={category.items} />}
    </div>
  );
}

function IconBtn({ icon, label, href = "#" }) {
  return (
    <a
      href={href}
      className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5 text-[#2c1a0e] p-1 hover:text-[#d97845] transition-colors duration-150 no-underline"
    >
      {icon}
      <span className="text-[10px] font-medium tracking-[0.3px]">{label}</span>
    </a>
  );
}

export default function Navbar({ onNavigateLogin, onNavigateSignup }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { isAdmin, loading } = useAuth();



  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);


  return (
    <>
      <nav className="sticky top-0 z-[900] bg-[#fffaf6] border-b border-[#e8d9cc]">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center h-16">

          {/* Desktop Logo */}
          <div className="hidden md:block shrink-0 mr-8">
            <Logo />
          </div>

          {/* Desktop Category Links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {categories.map((cat) => (
              <NavItem key={cat.label} category={cat} />
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center border border-[#e0cdc0] rounded px-3 py-1.5 gap-2 bg-[#fdf5ee] mr-5 w-[220px] shrink-0">
            <Search size={16} className="text-[#b8a090] shrink-0" />
            <input
              type="search"
              placeholder="Search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-[#2c1a0e] w-full placeholder:text-[#b8a090]"
            />
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-5">

            <IconBtn icon={<MapPin size={20} />} label="Stores" href="/stores" />

            <ProfileDropdown
              onNavigateLogin={onNavigateLogin}
              onNavigateSignup={onNavigateSignup}
            />

            {!loading && !isAdmin && (
              <>
                <IconBtn icon={<Heart size={20} />} label="Wishlist" href="/wishlist" />
                <IconBtn icon={<ShoppingBag size={20} />} label="Bag" href="/bag" />
              </>
            )}


          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center justify-between w-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border-none cursor-pointer text-[#2c1a0e] p-1 flex"
            >
              <Menu size={22} />
            </button>
            <Logo />
            <div className="flex gap-3.5 items-center">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="bg-transparent border-none cursor-pointer text-[#2c1a0e] flex"
              >
                <Search size={20} />
              </button>
              <button className="bg-transparent border-none cursor-pointer text-[#2c1a0e] flex">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Expand */}
        {searchOpen && (
          <div className="md:hidden px-4 py-2.5 border-t border-[#e8d9cc] bg-[#fffaf6]">
            <div className="flex items-center border border-[#e0cdc0] rounded px-3 py-2 gap-2 bg-[#fdf5ee]">
              <Search size={16} className="text-[#b8a090] shrink-0" />
              <input
                autoFocus
                type="search"
                placeholder="Search for products..."
                className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#b8a090]"
              />
            </div>
          </div>
        )}
      </nav>

      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
