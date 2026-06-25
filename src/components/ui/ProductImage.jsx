'use client'

import { useState } from 'react'
import Image from 'next/image'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function getPublicImageUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
}

export default function ProductImage({ images, name }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const primary = images?.find(i => i.is_primary) ?? images?.[0]

  if (!primary) {
    return (
      <div className="w-full aspect-square bg-[#FAF6F0] flex items-center justify-center rounded-3xl border border-[#F3EDE4]">
        <span className="text-[#9A8D82] text-sm font-medium">No Image Available</span>
      </div>
    )
  }

  const imageUrl = getPublicImageUrl(primary.storage_path)

  return (
    <>
      {/* Product Image Container */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-full aspect-square bg-[#FAF6F0] rounded-3xl border border-[#F3EDE4] overflow-hidden cursor-zoom-in group"
      >
        <Image
          src={imageUrl}
          alt={name || "Product Image"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority
        />
        
        {/* Zoom Overlay Button */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#2D2219] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
          Click to zoom
        </div>
      </div>

      {/* Full-screen Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#2D2219]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 text-white hover:bg-white/20 transition rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Lightbox Image Box */}
          <div 
            className="relative w-full max-w-3xl aspect-square rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Stop closing when clicking image
          >
            <Image
              src={imageUrl}
              alt={name || "Product Image Zoomed"}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}