import Link from "next/link";



export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 no-underline text-inherit">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="#2c1a0e" />
        <polygon points="16,8 24,13 24,19 16,24 8,19 8,13" fill="#fdf8f3" />
        <polygon points="16,12 20,14.5 20,17.5 16,20 12,17.5 12,14.5" fill="#2c1a0e" />
      </svg>
      <span className="font-extrabold text-[18px] tracking-[2px] text-[#2c1a0e]">
        THE<span className="font-light">LOOK</span>
      </span>
    </Link>
  );
}