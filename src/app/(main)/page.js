'use client';

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Heart, ShoppingBag,
  Star, ArrowRight, Flame, Sparkles, Tag, Truck, RotateCcw, Shield,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    tag: "New Collection",
    heading: "Summer Vibes\n2026",
    sub: "Light fabrics, bold colours — made for the season.",
    cta: "Shop Now",
    bg: "from-[#d97845] via-[#e8955a] to-[#f5c090]",
    accent: "#fff",
    shapes: ["#f9d9b8", "#f2b870", "#e89040"],
  },
  {
    id: 2,
    tag: "Men's Exclusive",
    heading: "Premium Men's\nFashion",
    sub: "Elevate your wardrobe with curated essentials.",
    cta: "Explore Men",
    bg: "from-[#2c1a0e] via-[#4a2e18] to-[#7a4a28]",
    accent: "#fdf8f3",
    shapes: ["#6a3820", "#8a5030", "#5a2810"],
  },
  {
    id: 3,
    tag: "Women's Edition",
    heading: "Effortless\nElegance",
    sub: "Discover dresses, tops & accessories for every occasion.",
    cta: "Shop Women",
    bg: "from-[#9b4e6a] via-[#b86080] to-[#d49090]",
    accent: "#fff",
    shapes: ["#d4708a", "#e090a0", "#c05070"],
  },
  {
    id: 4,
    tag: "Kids & Teens",
    heading: "Fun Fashion\nFor All Ages",
    sub: "Bright, playful styles that keep up with them.",
    cta: "Shop Kids",
    bg: "from-[#4a7ab8] via-[#6090d0] to-[#90c0e8]",
    accent: "#fff",
    shapes: ["#6090c8", "#80b0e0", "#4070a8"],
  },
];

const CATEGORIES = [
  { label: "Men",    bg: "#2c1a0e", fg: "#fdf8f3", emoji: "👔", count: "240+ items" },
  { label: "Women",  bg: "#9b4e6a", fg: "#fff",    emoji: "👗", count: "380+ items" },
  { label: "Teens",  bg: "#d97845", fg: "#fff",    emoji: "🎒", count: "160+ items" },
  { label: "Kids",   bg: "#4a7ab8", fg: "#fff",    emoji: "🧸", count: "120+ items" },
  { label: "Sports", bg: "#5a8a5a", fg: "#fff",    emoji: "⚡", count: "200+ items" },
];

const NEW_ARRIVALS = [
  { id: 1,  name: "Cotton Linen Shirt",          price: "৳890",  original: "৳1,200", rating: 4.5, reviews: 28,  tag: "New",     palette: ["#d97845","#e8a070","#f5c090"] },
  { id: 2,  name: "Floral Wrap Dress",           price: "৳1,450", original: null,     rating: 4.8, reviews: 42,  tag: "Popular", palette: ["#9b4e6a","#b86080","#d4a0b0"] },
  { id: 3,  name: "Slim Fit Chinos",             price: "৳1,100", original: "৳1,400", rating: 4.3, reviews: 19,  tag: "Sale",    palette: ["#4a7ab8","#6090d0","#90b8e0"] },
  { id: 4,  name: "Kids Graphic Hoodie",         price: "৳750",   original: null,     rating: 4.6, reviews: 33,  tag: "New",     palette: ["#5a8a5a","#78a878","#a0c8a0"] },
  { id: 5,  name: "Sports Performance Tee",      price: "৳620",   original: "৳800",   rating: 4.4, reviews: 56,  tag: "Sale",    palette: ["#2c1a0e","#4a2e18","#7a4a28"] },
  { id: 6,  name: "Boho Maxi Skirt",            price: "৳1,280", original: null,     rating: 4.7, reviews: 24,  tag: "Trending",palette: ["#c06090","#d888a8","#e8a8c0"] },
  { id: 7,  name: "Classic Polo Shirt",          price: "৳980",   original: "৳1,150", rating: 4.2, reviews: 47,  tag: "Sale",    palette: ["#d97845","#c06830","#a84e18"] },
  { id: 8,  name: "Teen Denim Jacket",           price: "৳1,650", original: null,     rating: 4.9, reviews: 61,  tag: "Popular", palette: ["#4a7ab8","#3860a0","#284888"] },
];

const TRENDING = NEW_ARRIVALS.slice(0, 6).sort(() => Math.random() - 0.5);

const PERKS = [
  { icon: Truck,     title: "Free Delivery",     sub: "On orders over ৳999" },
  { icon: RotateCcw, title: "Easy Returns",      sub: "30-day return policy" },
  { icon: Shield,    title: "Secure Payment",    sub: "100% safe & protected" },
  { icon: Tag,       title: "Best Prices",       sub: "Price match guarantee" },
];

/* ─────────────────────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────────────────────── */
function ProductCard({ product = {}, compact = false }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const {
    name = "Untitled product",
    price = "৳0",
    original = null,
    rating = 0,
    reviews = 0,
    tag = "New",
    palette = ["#d97845", "#e8a070", "#f5c090"],
  } = product;
  const discount = original
    ? Math.round((1 - parseFloat(price.replace("৳","")) / parseFloat(original.replace("৳",""))) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#ede4da] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(100,55,20,0.13)] hover:-translate-y-1 ${compact ? "" : ""}`}>
      {/* Image placeholder */}
      <div
        className={`relative overflow-hidden ${compact ? "h-[160px]" : "h-[220px] md:h-[240px]"}`}
        style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})` }}
      >
        {/* Abstract clothing shape */}
        <svg
          viewBox="0 0 100 120"
          className="absolute inset-0 w-full h-full opacity-25"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M35 10 L20 30 L10 25 L5 50 L20 50 L20 110 L80 110 L80 50 L95 50 L90 25 L80 30 L65 10 L55 20 C52 24 48 24 45 20 Z"
            fill="white" />
        </svg>
        {/* Floating circle accents */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 bg-white" />
        <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full opacity-15 bg-white" />

        {/* Tag badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
            tag === "Sale"     ? "bg-red-500 text-white" :
            tag === "Popular"  ? "bg-[#2c1a0e] text-[#fdf8f3]" :
            tag === "Trending" ? "bg-[#d97845] text-white" :
            "bg-white/90 text-[#2c1a0e]"
          }`}>
            {tag}
          </span>
        </div>

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
              -{discount}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setWished(!wished)}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
            wished
              ? "bg-[#d97845] border-[#d97845] text-white scale-110"
              : "bg-white/90 border-white/50 text-[#9b8070] opacity-0 group-hover:opacity-100 hover:scale-110"
          }`}
        >
          <Heart size={14} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[13px] font-semibold text-[#2c1a0e] m-0 mb-1.5 line-clamp-2 leading-snug">{name}</p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              size={11}
              fill={s <= Math.floor(rating) ? "#f59e0b" : "none"}
              className={s <= Math.floor(rating) ? "text-[#f59e0b]" : "text-[#d4c4b8]"}
            />
          ))}
          <span className="text-[10.5px] text-[#9b8070] ml-0.5">({reviews})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold text-[#2c1a0e]">{price}</span>
            {original && <span className="text-[11px] text-[#b8a090] line-through">{original}</span>}
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold border-none cursor-pointer transition-all duration-200 ${
              added
                ? "bg-green-500 text-white scale-95"
                : "bg-[#2c1a0e] hover:bg-[#d97845] text-[#fdf8f3]"
            }`}
          >
            <ShoppingBag size={12} />
            {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HERO SLIDER
───────────────────────────────────────────────────────────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 180);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mx-4 md:mx-0 mt-4 md:mt-0">
      {/* Slide background */}
      <div
        className={`bg-gradient-to-br ${slide.bg} transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}
        style={{ minHeight: "clamp(260px, 40vw, 520px)" }}
      >
        <div className="flex items-center h-full px-8 md:px-16 py-10 md:py-0" style={{ minHeight: "inherit" }}>

          {/* Text side */}
          <div className="flex-1 z-10">
            <span
              className="inline-block text-[11px] font-bold tracking-[2px] uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "rgba(255,255,255,0.2)", color: slide.accent }}
            >
              {slide.tag}
            </span>
            <h1
              className="font-extrabold leading-tight m-0 mb-4 whitespace-pre-line"
              style={{
                color: slide.accent,
                fontSize: "clamp(26px, 4vw, 56px)",
                textShadow: "0 2px 12px rgba(0,0,0,0.15)",
              }}
            >
              {slide.heading}
            </h1>
            <p
              className="text-[14px] md:text-[16px] leading-relaxed m-0 mb-6 max-w-[340px]"
              style={{ color: slide.accent, opacity: 0.88 }}
            >
              {slide.sub}
            </p>
            <button
              className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-[14px] border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
              style={{
                background: slide.accent,
                color: slide.bg.includes("2c1a0e") ? "#2c1a0e" : "#2c1a0e",
                borderColor: slide.accent,
              }}
            >
              {slide.cta}
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Decorative shapes */}
          <div className="hidden md:flex items-center justify-end flex-1 relative h-full">
            {slide.shapes.map((c, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  background: c,
                  opacity: 0.4 + i * 0.12,
                  width:  `${100 + i * 60}px`,
                  height: `${100 + i * 60}px`,
                  right:  `${i * 40}px`,
                  top:    `${20 + i * -15}px`,
                }}
              />
            ))}
            {/* Clothing silhouette */}
            <svg viewBox="0 0 120 140" className="absolute right-16 w-40 h-40 opacity-30" fill="white">
              <path d="M40 10 L20 35 L5 28 L2 60 L25 60 L25 130 L95 130 L95 60 L118 60 L115 28 L100 35 L80 10 L65 22 C60 28 55 28 50 22 Z" />
            </svg>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Arrows */}
      {[
        { dir: "prev", fn: prev, pos: "left-3 md:left-5" },
        { dir: "next", fn: next, pos: "right-3 md:right-5" },
      ].map(({ dir, fn, pos }) => (
        <button
          key={dir}
          onClick={fn}
          className={`absolute top-1/2 -translate-y-1/2 ${pos} w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/80 backdrop-blur border border-white/50 flex items-center justify-center text-[#2c1a0e] hover:bg-white hover:scale-110 transition-all shadow-lg cursor-pointer z-20`}
        >
          {dir === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full border-none cursor-pointer transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, sub, linkLabel = "View All", href = "#" }) {
  return (
    <div className="flex items-end justify-between mb-5 md:mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={18} className="text-[#d97845]" />}
          <h2 className="text-[18px] md:text-[22px] font-extrabold text-[#2c1a0e] m-0">{title}</h2>
        </div>
        {sub && <p className="text-[12.5px] text-[#9b8070] m-0">{sub}</p>}
      </div>
      <a href={href} className="flex items-center gap-1 text-[13px] font-semibold text-[#d97845] no-underline hover:text-[#b8622f] transition-colors shrink-0">
        {linkLabel} <ArrowRight size={14} />
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-[#fdf8f3] pb-24 md:pb-12">

      {/* Hero slider */}
      <section className="md:px-6 md:pt-5 max-w-[1280px] md:mx-auto">
        <HeroSlider />
      </section>

      {/* Perks strip */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PERKS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#ede4da] px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_4px_rgba(60,30,10,0.05)]">
              <div className="w-9 h-9 rounded-xl bg-[#fdf0e6] flex items-center justify-center shrink-0">
                <Icon size={17} className="text-[#d97845]" />
              </div>
              <div>
                <p className="text-[12.5px] font-bold text-[#2c1a0e] m-0 leading-tight">{title}</p>
                <p className="text-[11px] text-[#9b8070] m-0 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-8 md:mt-10">
        <SectionHeader icon={Sparkles} title="Shop by Category" sub="Find exactly what you're looking for" linkLabel="All Categories" />
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map(({ label, bg, fg, emoji, count }) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="flex flex-col items-center justify-center no-underline rounded-2xl py-5 md:py-7 px-3 gap-2 transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_8px_28px_rgba(60,30,10,0.16)] active:scale-[0.98]"
              style={{ background: bg }}
            >
              <span className="text-[28px] md:text-[36px] leading-none">{emoji}</span>
              <span className="text-[13px] md:text-[15px] font-bold leading-tight" style={{ color: fg }}>{label}</span>
              <span className="text-[10px] md:text-[11px] leading-tight opacity-75" style={{ color: fg }}>{count}</span>
            </a>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-10 md:mt-12">
        <SectionHeader icon={Sparkles} title="New Arrivals" sub="Fresh styles added this week" />

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
               style={{ scrollbarWidth: "none" }}>
            {NEW_ARRIVALS.map((p) => (
              <div key={p.id} className="shrink-0 w-[175px] snap-start">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-4 gap-4 lg:gap-5">
          {NEW_ARRIVALS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Banner — mid-page promo */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-10 md:mt-12">
        <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#2c1a0e] via-[#4a2e18] to-[#7a4a28] px-6 md:px-12 py-8 md:py-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          {/* Decorative blob */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path d="M47.1,-62.3C60.9,-53.2,71.9,-38.7,76.1,-22.6C80.3,-6.4,77.7,11.4,70.5,27.2C63.4,43,51.7,56.8,37.5,65.3C23.4,73.8,6.8,77.1,-9.6,75.5C-26,73.8,-42.2,67.2,-53.6,56.1C-65.1,44.9,-71.8,29.2,-73.1,13.1C-74.5,-3,-70.5,-19.4,-62,-32.2C-53.5,-44.9,-40.5,-54,-27.1,-63.1C-13.7,-72.2,0,-81.4,13.6,-79.8C27.2,-78.2,33.3,-71.4,47.1,-62.3Z"
                fill="white" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="flex-1 z-10 text-center md:text-left">
            <p className="text-[#e8a070] text-[11px] font-bold tracking-[2px] uppercase m-0 mb-2">Limited Time Offer</p>
            <h2 className="text-white text-[22px] md:text-[32px] font-extrabold m-0 mb-2 leading-tight">
              Up to 40% off<br className="hidden md:block" /> on selected items
            </h2>
            <p className="text-[#c8a080] text-[13px] m-0">Hurry — sale ends in 48 hours. Don&apos;t miss out!</p>
          </div>
          <button className="z-10 flex items-center gap-2 bg-[#d97845] hover:bg-[#b8622f] text-white border-none px-8 py-3.5 rounded-full font-bold text-[14px] cursor-pointer transition-all hover:scale-105 hover:shadow-xl shrink-0">
            Shop Sale <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-10 md:mt-12">
        <SectionHeader icon={Flame} title="Trending Now" sub="What everyone's buying this week" />

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory"
               style={{ scrollbarWidth: "none" }}>
            {TRENDING.map((p) => (
              <div key={p.id} className="shrink-0 w-[175px] snap-start">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
          {TRENDING.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-10 md:mt-12 text-center">
        <div className="bg-white rounded-2xl border border-[#ede4da] px-6 py-10 shadow-[0_1px_4px_rgba(60,30,10,0.06)]">
          <p className="text-[12px] font-bold tracking-[2px] uppercase text-[#d97845] m-0 mb-2">Join Fabrilife</p>
          <h2 className="text-[20px] md:text-[26px] font-extrabold text-[#2c1a0e] m-0 mb-2">Get 10% off your first order</h2>
          <p className="text-[13px] text-[#9b8070] m-0 mb-6">Sign up and discover exclusive deals, early access to new arrivals, and more.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-[420px] mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 border border-[#e0cdc0] rounded-xl px-4 py-3 text-[13.5px] text-[#2c1a0e] bg-[#fdf5ee] outline-none focus:border-[#d97845] placeholder:text-[#b8a090] transition-colors"
            />
            <button className="bg-[#d97845] hover:bg-[#b8622f] text-white border-none px-6 py-3 rounded-xl font-semibold text-[13.5px] cursor-pointer transition-colors whitespace-nowrap">
              Get My 10% Off
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
