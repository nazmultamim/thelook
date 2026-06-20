'use client';

import { useState } from "react";
import {
  DollarSign, ShoppingCart, UserCheck, Percent, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Truck, Clock, XCircle, MoreHorizontal, TrendingUp, Package2,
  Tag, Megaphone, FileText, RefreshCcw
} from "lucide-react";
import SparkBar from "./SparkBar";

const STATS = [
  {
    title: "Total Revenue",   value: "৳4,82,390",  delta: "+18.4%",  up: true,
    icon: DollarSign, color: "#d97845", light: "#fdf0e6",
    spark: [40, 55, 45, 60, 52, 70, 65, 80, 72, 90, 85, 100],
  },
  {
    title: "Total Orders",    value: "3,847",       delta: "+12.1%",  up: true,
    icon: ShoppingCart, color: "#4a7ab8", light: "#e8f0fa",
    spark: [30, 42, 38, 50, 45, 60, 55, 68, 62, 74, 70, 82],
  },
  {
    title: "New Customers",   value: "1,284",       delta: "+7.3%",   up: true,
    icon: UserCheck, color: "#5a8a5a", light: "#e6f4e6",
    spark: [20, 35, 28, 45, 38, 52, 46, 60, 54, 68, 62, 75],
  },
  {
    title: "Conversion Rate", value: "3.68%",       delta: "-0.5%",   up: false,
    icon: Percent, color: "#9b4e6a", light: "#f5e8ef",
    spark: [55, 50, 58, 48, 55, 45, 52, 42, 50, 40, 48, 44],
  },
];

const ORDERS = [
  { id: "#ORD-5892", customer: "Tanvir Ahmed",     product: "Cotton Linen Shirt",    amount: "৳890",  status: "Delivered",  date: "Jun 17" },
  { id: "#ORD-5891", customer: "Fatema Khanam",    product: "Floral Wrap Dress",     amount: "৳1,450", status: "Shipped",    date: "Jun 17" },
  { id: "#ORD-5890", customer: "Rahim Uddin",      product: "Slim Fit Chinos",       amount: "৳1,100", status: "Processing", date: "Jun 16" },
  { id: "#ORD-5889", customer: "Meher Nigar",      product: "Boho Maxi Skirt",       amount: "৳1,280", status: "Delivered",  date: "Jun 16" },
  { id: "#ORD-5888", customer: "Karim Hossain",    product: "Classic Polo Shirt",    amount: "৳980",  status: "Cancelled",  date: "Jun 15" },
  { id: "#ORD-5887", customer: "Riya Chakraborty", product: "Teen Denim Jacket",     amount: "৳1,650", status: "Shipped",    date: "Jun 15" },
  { id: "#ORD-5886", customer: "Arif Billah",      product: "Sports Performance Tee",amount: "৳620",  status: "Processing", date: "Jun 14" },
];

const TOP_PRODUCTS = [
  { name: "Teen Denim Jacket",      sales: 312, revenue: "৳5,14,800", growth: 24 },
  { name: "Floral Wrap Dress",      sales: 278, revenue: "৳4,03,100", growth: 18 },
  { name: "Cotton Linen Shirt",     sales: 254, revenue: "৳2,26,060", growth: 12 },
  { name: "Boho Maxi Skirt",        sales: 201, revenue: "৳2,57,280", growth: 8  },
  { name: "Classic Polo Shirt",     sales: 188, revenue: "৳1,84,240", growth: -3 },
];

const STATUS_CONFIG = {
  Delivered:  { color: "bg-emerald-100 text-emerald-700",  icon: CheckCircle2 },
  Shipped:    { color: "bg-blue-100 text-blue-700",        icon: Truck         },
  Processing: { color: "bg-amber-100 text-amber-700",      icon: Clock         },
  Cancelled:  { color: "bg-red-100 text-red-700",          icon: XCircle       },
};

export default function DashboardContent() {
  const [period, setPeriod] = useState("This Month");
  const periods = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#2c1a0e] m-0 leading-tight">Dashboard</h1>
          <p className="text-[13px] text-[#9b8070] m-0 mt-0.5">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl border border-[#ede4da] p-1 shadow-sm">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border-none cursor-pointer transition-all ${
                period === p
                  ? "bg-[#d97845] text-white shadow-sm"
                  : "bg-transparent text-[#9b8070] hover:text-[#2c1a0e] hover:bg-[#fdf0e6]"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.title} className="bg-white rounded-2xl border border-[#ede4da] p-4 shadow-[0_1px_8px_rgba(60,30,10,0.06)] hover:shadow-[0_4px_20px_rgba(60,30,10,0.1)] transition-all duration-200 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.light }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 text-[11.5px] font-bold px-2 py-1 rounded-full ${
                s.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              }`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.delta}
              </div>
            </div>
            <p className="text-[22px] font-extrabold text-[#2c1a0e] m-0 leading-tight mb-1">{s.value}</p>
            <p className="text-[11.5px] text-[#9b8070] m-0 mb-3">{s.title}</p>
            <SparkBar values={s.spark} color={s.color} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_8px_rgba(60,30,10,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e8e0]">
            <div>
              <p className="font-bold text-[15px] text-[#2c1a0e] m-0">Recent Orders</p>
              <p className="text-[11.5px] text-[#9b8070] m-0">Last 7 days</p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d97845] bg-[#fdf0e6] hover:bg-[#d97845] hover:text-white px-3.5 py-2 rounded-xl border-none cursor-pointer transition-all">
              View All <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#fdf8f3]">
                  {["Order ID", "Customer", "Product", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#9b8070] uppercase tracking-wide whitespace-nowrap border-b border-[#f0e8e0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o, i) => {
                  const cfg = STATUS_CONFIG[o.status];
                  return (
                    <tr key={o.id} className={`border-b border-[#faf3ec] hover:bg-[#fdf8f3] transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-[#fffcfa]"}`}>
                      <td className="px-4 py-3 text-[12.5px] font-mono font-semibold text-[#d97845] whitespace-nowrap">{o.id}</td>
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[#2c1a0e] whitespace-nowrap">{o.customer}</td>
                      <td className="px-4 py-3 text-[12px] text-[#6b5040] max-w-[160px] truncate">{o.product}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#2c1a0e] whitespace-nowrap">{o.amount}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <cfg.icon size={11} />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#9b8070] whitespace-nowrap">{o.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_8px_rgba(60,30,10,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e8e0]">
            <div>
              <p className="font-bold text-[15px] text-[#2c1a0e] m-0">Top Products</p>
              <p className="text-[11.5px] text-[#9b8070] m-0">By revenue</p>
            </div>
            <button className="w-8 h-8 rounded-lg border border-[#ede4da] flex items-center justify-center text-[#9b8070] hover:bg-[#fdf0e6] hover:text-[#d97845] hover:border-[#d97845] cursor-pointer transition-all bg-transparent">
              <MoreHorizontal size={15} />
            </button>
          </div>

          <div className="p-4 space-y-2.5">
            {TOP_PRODUCTS.map((p, i) => {
              const pct = Math.round((p.sales / TOP_PRODUCTS[0].sales) * 100);
              return (
                <div key={p.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-[#fdf0e6] text-[#d97845] text-[10px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[12.5px] font-medium text-[#2c1a0e] m-0 max-w-[140px] truncate">{p.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10.5px] font-bold ${p.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {p.growth >= 0 ? "+" : ""}{p.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-[#f0e8e0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: i === 0 ? "#d97845" : i === 1 ? "#4a7ab8" : i === 2 ? "#5a8a5a" : "#9b4e6a" }}
                      />
                    </div>
                    <span className="text-[11px] text-[#9b8070] shrink-0 font-mono">{p.sales} sold</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-4 mb-4 mt-1 rounded-xl bg-gradient-to-br from-[#fdf0e6] to-[#fdf8f3] border border-[#ede4da] p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#9b8070] m-0">Total Product Revenue</p>
                <p className="text-[17px] font-extrabold text-[#2c1a0e] m-0">৳15,85,480</p>
              </div>
              <div className="flex items-center gap-1 text-[11.5px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full">
                <TrendingUp size={13} />
                +14.2%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_8px_rgba(60,30,10,0.06)] p-5">
        <p className="font-bold text-[15px] text-[#2c1a0e] m-0 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: Package2,    label: "Add Product",   color: "#d97845", bg: "#fdf0e6" },
            { icon: Tag,         label: "New Discount",  color: "#4a7ab8", bg: "#e8f0fa" },
            { icon: Megaphone,   label: "Campaign",      color: "#5a8a5a", bg: "#e6f4e6" },
            { icon: Truck,       label: "Track Orders",  color: "#9b4e6a", bg: "#f5e8ef" },
            { icon: FileText,    label: "Export Report", color: "#7a5a2a", bg: "#f5ede0" },
            { icon: RefreshCcw,  label: "Sync Inventory",color: "#4a6a7a", bg: "#e6eff4" },
          ].map(({ icon: Icon, label, color, bg }) => (
            <button key={label}
              className="flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border border-[#ede4da] hover:border-[#d97845] hover:shadow-[0_4px_16px_rgba(60,30,10,0.1)] cursor-pointer transition-all bg-transparent group hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-[11.5px] font-semibold text-[#2c1a0e] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}