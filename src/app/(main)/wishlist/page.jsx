import React from 'react'
import Link from "next/link";

function page() {
    return (
         <div className="min-h-[calc(100vh-64px)] bg-[#fdf8f3] pb-20">
      {/* Wishlist Header */}
      <div className="px-6 pt-8 pb-4 text-center border-b border-[#e8d9cc] max-w-[800px] mx-auto">
        <h1 className="text-[22px] font-bold text-[#2c1a0e] mt-0 mb-1.5 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#2c1a0e" stroke="#2c1a0e" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          My Wishlist
        </h1>
        <p className="text-sm text-[#b8a090] m-0">Please log in to access your wishlist</p>
      </div>

      {/* Login Required */}
      <div className="flex flex-col items-center justify-center px-6 py-[60px] gap-4 max-w-[480px] mx-auto text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="5" fill="#e8d0bb" />
          <path d="M20 21a8 8 0 1 0-16 0" fill="#e8d0bb" />
        </svg>

        <div>
          <h2 className="text-xl font-bold text-[#2c1a0e] mt-0 mb-2">Login Required</h2>
          <p className="text-sm text-[#9b8070] leading-relaxed m-0">
            Please log in to view and manage your wishlist.<br />
            Your favorites will be saved to your account.
          </p>
        </div>

        <Link href="/sign-in" className="bg-[#d97845] hover:bg-[#b8622f] text-white border-none px-12 py-3.5 rounded-full text-base font-semibold cursor-pointer mt-2 transition-colors duration-200">
          Log In
        </Link>

        <p className="text-[13px] text-[#9b8070] m-0">
          Don't have an account?{" "}
          <a href="#" className="text-[#d97845] no-underline font-medium hover:text-[#b8622f] transition-colors">Register here</a>
        </p>
      </div>
    </div>
    )
}

export default page