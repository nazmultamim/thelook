'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, GripVertical, Star } from 'lucide-react'

export default function ImageUploader({ images = [], onChange = () => {}, productId = 'temp' }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const upload = async (files) => {
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })
      if (!error) uploaded.push({ storage_path: path, preview: URL.createObjectURL(file) })
    }
    onChange([...images, ...uploaded])
    setUploading(false)
  }

  const remove = async (index) => {
    const img = images[index]
    if (!img) return
    // delete from storage
    await supabase.storage.from('product-images').remove([img.storage_path])
    onChange(images.filter((_, i) => i !== index))
  }

  const moveUp = (index) => {
    if (index === 0) return
    const next = [...images]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  const getUrl = (img) => {
    if (img.preview) return img.preview
    const { data } = supabase.storage.from('product-images').getPublicUrl(img.storage_path)
    return data.publicUrl
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Upload zone */}
      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors
        ${uploading ? 'border-[#d97845] bg-orange-50' : 'border-[#e8d9cc] hover:border-[#d97845] hover:bg-[#fdf8f3]'}`}>
        <input type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => upload(Array.from(e.target.files))} disabled={uploading} />
        <ImagePlus size={24} className="text-[#b8a090]" />
        <p className="text-[13px] text-[#9b8070]">
          {uploading ? 'Uploading…' : 'Click to upload images'}
        </p>
        <p className="text-[11px] text-[#b8a090]">First image is the main banner. Drag order to reorder.</p>
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={img.storage_path} className="relative group rounded-xl overflow-hidden border border-[#e8d9cc] aspect-square bg-[#fdf8f3]">
              <img src={getUrl(img)} alt="" className="w-full h-full object-cover" />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#d97845] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  <Star size={9} fill="white" /> Main
                </span>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button type="button" onClick={() => moveUp(i)} title="Move to front"
                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-[#2c1a0e] border-none cursor-pointer hover:bg-white">
                    <GripVertical size={13} />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white border-none cursor-pointer hover:bg-red-600">
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}