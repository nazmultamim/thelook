const SECTION_META = {
  analytics: {
    title: "Analytics",
    description: "Track traffic, conversions, and channel performance from one place.",
  },
  reports: {
    title: "Reports",
    description: "Export sales, order, and inventory reports for deeper analysis.",
  },
  products: {
    title: "Products",
    description: "Manage product listings, pricing, and availability.",
  },
  orders: {
    title: "Orders",
    description: "Review recent orders, fulfillment status, and exceptions.",
  },
  inventory: {
    title: "Inventory",
    description: "Monitor stock levels and restock signals before they run out.",
  },
  customers: {
    title: "Customers",
    description: "View customer profiles, purchase history, and engagement details.",
  },
  campaigns: {
    title: "Campaigns",
    description: "Coordinate email, social, and promo campaigns from a single screen.",
  },
  promotions: {
    title: "Promotions",
    description: "Create and manage discounts, vouchers, and seasonal offers.",
  },
  settings: {
    title: "Settings",
    description: "Update admin preferences, permissions, and store configuration.",
  },
  support: {
    title: "Support",
    description: "Handle tickets, knowledge base items, and service requests.",
  },
};

export default function DashboardSectionPage({ params }) {
  const section = params.section;
  const meta = SECTION_META[section] || {
    title: section.charAt(0).toUpperCase() + section.slice(1),
    description: "This section is part of the admin dashboard shell.",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ede4da] shadow-[0_1px_8px_rgba(60,30,10,0.06)] p-6 md:p-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#d97845] m-0 mb-3">Admin Section</p>
        <h1 className="text-[28px] md:text-[34px] font-black text-[#2c1a0e] leading-tight m-0">{meta.title}</h1>
        <p className="text-[14px] md:text-[15px] text-[#9b8070] mt-3 mb-0 leading-7">
          {meta.description}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Status", value: "Ready" },
            { label: "Route", value: `/admin/dashboard/${section}` },
            { label: "Mode", value: "In shell" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#f0e8e0] bg-[#fdf8f3] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#9b8070] m-0">{item.label}</p>
              <p className="text-[13px] font-semibold text-[#2c1a0e] mt-1.5 mb-0 break-all">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
