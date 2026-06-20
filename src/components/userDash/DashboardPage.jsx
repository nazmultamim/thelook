'use client';
import { useState } from "react";
import DashboardNavbar from "./DashboardNavbar";

import {
    ShoppingBag,
    MapPin,
    Users,
    Package,
    Wallet,
    Heart,
    ChevronRight,
    TrendingUp,
    Clock,
} from "lucide-react";
import Link from "next/link";

const STAT_CARDS = [
    { icon: ShoppingBag, label: "Total Orders", value: "12", sub: "3 active", color: "#d97845" },
    { icon: Package, label: "Delivered", value: "9", sub: "All time", color: "#5a8a5a" },
    { icon: Wallet, label: "Total Spent", value: "৳4,200", sub: "This year", color: "#4a7ab8" },
    { icon: Heart, label: "Wishlist", value: "7", sub: "Saved items", color: "#c06090" },
];

const RECENT_ORDERS = [
    { id: "#FL-2041", item: "Men's Cotton T-Shirt (XL, Navy)", date: "Jun 12, 2026", status: "Delivered", statusColor: "text-green-600 bg-green-50" },
    { id: "#FL-2039", item: "Women's Floral Dress (M)", date: "Jun 8, 2026", status: "Shipped", statusColor: "text-blue-600  bg-blue-50" },
    { id: "#FL-2031", item: "Kids Sneakers (Size 32)", date: "May 29, 2026", status: "Delivered", statusColor: "text-green-600 bg-green-50" },
    { id: "#FL-2028", item: "Sports Running Shorts (L)", date: "May 20, 2026", status: "Delivered", statusColor: "text-green-600 bg-green-50" },
];

const QUICK_LINKS = [
    { icon: ShoppingBag, label: "My Orders", href: "#orders" },
    { icon: MapPin, label: "Saved Addresses", href: "#addresses" },
    { icon: Users, label: "FabriSquad Referrals", href: "#fabrisquad" },
    { icon: Wallet, label: "Payout", href: "#payout" },
    { icon: TrendingUp, label: "Track Order", href: "#track" },
    { icon: Clock, label: "Order History", href: "#history" },
];

const user = {
    name: "tamim molla"
}

export default function DashboardPage({ onGoToShop }) {

    const [activeLink] = useState("Dashboard");

    return (
        <div className="min-h-screen bg-[#f8f3ee]">
            <DashboardNavbar activeLink={activeLink} onGoToShop={onGoToShop} />

            <div className="max-w-[1140px] mx-auto px-4 md:px-6 py-6 md:py-8">

                {/* Welcome header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-[22px] md:text-[26px] font-bold text-[#2c1a0e] m-0 mb-1">
                        Welcome back, {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-[13px] md:text-[14px] text-[#9b8070] m-0">
                        Here's what's happening with your account today.
                    </p>
                </div>

                {/* Stat Cards — 2-col on mobile, 4-col on md+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {STAT_CARDS.map(({ icon: Icon, label, value, sub, color }) => (
                        <div
                            key={label}
                            className="bg-white rounded-2xl border border-[#ede4da] p-4 md:p-5 flex flex-col gap-2.5 md:gap-3 shadow-[0_1px_4px_rgba(60,30,10,0.06)]"
                        >
                            <div
                                className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${color}18` }}
                            >
                                <Icon size={16} style={{ color }} />
                            </div>
                            <div>
                                <div className="text-[20px] md:text-[22px] font-bold text-[#2c1a0e] leading-tight">{value}</div>
                                <div className="text-[11.5px] md:text-[12px] text-[#9b8070] mt-0.5">{label}</div>
                                <div className="text-[10.5px] md:text-[11px] text-[#b8a090] mt-0.5">{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main grid — stacked on mobile, 3-col on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

                    {/* Recent Orders */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_4px_rgba(60,30,10,0.06)] overflow-hidden">
                        <div className="px-4 md:px-5 py-3.5 md:py-4 border-b border-[#f0e8e0] flex items-center justify-between">
                            <h2 className="text-[14.5px] md:text-[15px] font-bold text-[#2c1a0e] m-0">Recent Orders</h2>
                            <Link href="#orders" className="text-[12px] md:text-[12.5px] text-[#d97845] font-medium no-underline hover:text-[#b8622f]">
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y divide-[#f5ede4]">
                            {RECENT_ORDERS.map((order) => (
                                <div key={order.id} className="px-4 md:px-5 py-3 md:py-3.5 flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-[11.5px] md:text-[12px] font-bold text-[#8a6a55]">{order.id}</span>
                                            <span className={`text-[10.5px] md:text-[11px] font-semibold px-2 py-0.5 rounded-full ${order.statusColor}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-[12.5px] md:text-[13px] text-[#2c1a0e] m-0 truncate">{order.item}</p>
                                        <p className="text-[11px] md:text-[11.5px] text-[#b8a090] m-0 mt-0.5">{order.date}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-[#d4c4b8] shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_4px_rgba(60,30,10,0.06)] overflow-hidden">
                        <div className="px-4 md:px-5 py-3.5 md:py-4 border-b border-[#f0e8e0]">
                            <h2 className="text-[14.5px] md:text-[15px] font-bold text-[#2c1a0e] m-0">Quick Links</h2>
                        </div>
                        {/* On mobile: 2-col grid of links; on desktop: single column list */}
                        <div className="py-1 grid grid-cols-2 md:grid-cols-1">
                            {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="flex items-center gap-3 px-4 md:px-5 py-3 no-underline text-[#3d2410] text-[12.5px] md:text-[13px] font-medium group hover:bg-[#fdf0e6] transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-[#f5ede4] group-hover:bg-[#e8d0bb] flex items-center justify-center transition-colors shrink-0">
                                        <Icon size={13} className="text-[#b8905a]" />
                                    </div>
                                    <span className="flex-1 leading-tight">{label}</span>
                                    <ChevronRight size={12} className="text-[#d4c4b8] hidden md:block" />
                                </a>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
