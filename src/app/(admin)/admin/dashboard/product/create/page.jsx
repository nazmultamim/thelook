'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useIsAdmin } from '@/context/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { createProduct, updateProduct, getCategories } from '@/app/actions/products'
import TipTapEditor from '@/components/admin/ui/TipTapEditor'
import ImageUploader from '@/components/admin/ui/ImageUploader'
import {
  ArrowLeft, Plus, X, AlertTriangle, Check, Package
} from 'lucide-react'

// ── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-[#6b5244] uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  )
}

function Input({ error, ...props }) {
  return (
    <input {...props}
      className={`w-full border rounded-xl px-4 py-3 text-[14px] text-[#2c1a0e] outline-none bg-white transition-colors
        placeholder:text-[#c8b4a4]
        ${error ? 'border-red-400' : 'border-[#e8d9cc] focus:border-[#d97845]'}`} />
  )
}

function mapProductToForm(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    details: product.details || '',
    base_price: product.base_price?.toString() || '',
    discount_price: product.discount_price?.toString() || '',
    brand: product.brand || '',
    category_id: product.category_id || '',
    is_active: product.is_active ?? true,
    colors: (product.colors || []).map(color => ({
      name: color.name,
      hex_code: color.hex_code || '#000000',
    })),
    sizes: (product.sizes || []).map(size => ({
      label: size.label,
      stock_quantity: size.stock_quantity ?? 0,
      sku: size.sku || '',
      price_override: size.price_override ?? '',
    })),
    images: product.images || [],
  }
}

// ── Color manager ─────────────────────────────────────────────────────────────
function ColorManager({ colors, onChange }) {
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#000000')

  const add = () => {
    if (!name.trim()) return
    onChange([...colors, { name: name.trim(), hex_code: hex }])
    setName('')
    setHex('#000000')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <input type="color" value={hex} onChange={e => setHex(e.target.value)}
          className="w-10 h-10 rounded-lg border border-[#e8d9cc] cursor-pointer p-0.5 bg-white" />
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Color name (e.g. Navy Blue)"
          className="flex-1 border border-[#e8d9cc] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#d97845] text-[#2c1a0e]" />
        <button type="button" onClick={add}
          className="px-4 py-2.5 bg-[#d97845] text-white rounded-xl text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b8622f] transition-colors">
          <Plus size={15} />
        </button>
      </div>
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e8d9cc] bg-white text-[13px] text-[#2c1a0e]">
              <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ background: c.hex_code }} />
              {c.name}
              <button type="button" onClick={() => onChange(colors.filter((_, j) => j !== i))}
                className="text-[#b8a090] hover:text-red-500 border-none bg-transparent cursor-pointer p-0 flex">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Size manager ──────────────────────────────────────────────────────────────
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36']

function SizeManager({ sizes, onChange }) {
  const [custom, setCustom] = useState('')

  const toggle = (label) => {
    const exists = sizes.find(s => s.label === label)
    if (exists) onChange(sizes.filter(s => s.label !== label))
    else onChange([...sizes, { label, stock_quantity: 0, sku: '', price_override: '' }])
  }

  const addCustom = () => {
    if (!custom.trim() || sizes.find(s => s.label === custom.trim())) return
    onChange([...sizes, { label: custom.trim(), stock_quantity: 0, sku: '', price_override: '' }])
    setCustom('')
  }

  const update = (index, field, value) => {
    const next = [...sizes]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preset quick-add */}
      <div className="flex flex-wrap gap-2">
        {PRESET_SIZES.map(label => {
          const active = !!sizes.find(s => s.label === label)
          return (
            <button key={label} type="button" onClick={() => toggle(label)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border cursor-pointer transition-colors
                ${active ? 'bg-[#d97845] text-white border-[#d97845]' : 'bg-white text-[#6b5244] border-[#e8d9cc] hover:border-[#d97845]'}`}>
              {label}
            </button>
          )
        })}
        {/* Custom size input */}
        <div className="flex gap-1">
          <input value={custom} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="Custom…"
            className="w-24 border border-[#e8d9cc] rounded-xl px-3 py-1.5 text-[12px] outline-none focus:border-[#d97845]" />
          <button type="button" onClick={addCustom}
            className="px-2 py-1.5 bg-[#f5ede4] text-[#d97845] rounded-xl border-none cursor-pointer hover:bg-[#f0e0d0] transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Stock inputs per size */}
      {sizes.length > 0 && (
        <div className="border border-[#e8d9cc] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_1fr_32px] gap-3 px-4 py-2.5 bg-[#fdf8f3] border-b border-[#f0e8e0]">
            {['Size', 'Stock Qty', 'Price Override', ''].map(h => (
              <p key={h} className="text-[10px] font-semibold text-[#9b8070] uppercase tracking-wider m-0">{h}</p>
            ))}
          </div>
          {sizes.map((s, i) => (
            <div key={s.label} className="grid grid-cols-[60px_1fr_1fr_32px] gap-3 px-4 py-3 items-center border-b border-[#f5ede4] last:border-0">
              <span className="text-[13px] font-bold text-[#2c1a0e]">{s.label}</span>
              <input type="number" min="0" value={s.stock_quantity}
                onChange={e => update(i, 'stock_quantity', parseInt(e.target.value) || 0)}
                className="border border-[#e8d9cc] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#d97845] w-full" />
              <input type="number" min="0" step="0.01" value={s.price_override}
                onChange={e => update(i, 'price_override', e.target.value)}
                placeholder="Same as base"
                className="border border-[#e8d9cc] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#d97845] w-full placeholder:text-[#c8b4a4]" />
              <button type="button" onClick={() => onChange(sizes.filter((_, j) => j !== i))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#b8a090] hover:text-red-500 border-none bg-transparent cursor-pointer">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreateProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = useIsAdmin()
  const productId = searchParams.get('productId')
  const isEditMode = !!productId
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditMode)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    description: '',
    details: '',
    base_price: '',
    discount_price: '',
    brand: '',
    category_id: '',
    is_active: true,
    colors: [],
    sizes: [],
    images: [],
  })

  useEffect(() => {
    getCategories().then(r => { if (r.data) setCategories(r.data) })
  }, [])

  useEffect(() => {
    if (!productId) return

    let mounted = true
    const supabase = createClient()

    supabase
      .from('products')
      .select(`
        *,
        colors:product_colors(id, name, hex_code, display_order),
        sizes:product_sizes(id, label, sku, stock_quantity, price_override),
        images:product_images(id, storage_path, display_order, is_primary, color_id)
      `)
      .eq('id', productId)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return
        if (error || !data) {
          setServerError(error?.message || 'Product not found')
          return
        }
        setForm(mapProductToForm(data))
        setServerError('')
      })
      .catch(() => {
        if (mounted) setServerError('Failed to load product')
      })
      .finally(() => {
        if (mounted) setLoadingProduct(false)
      })

    return () => { mounted = false }
  }, [productId])

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim())           errs.name = 'Product name is required'
    if (!form.category_id)           errs.category_id = 'Category is required'
    if (!form.base_price || isNaN(form.base_price) || +form.base_price <= 0)
      errs.base_price = 'Valid price is required'
    if (form.images.length === 0)    errs.images = 'At least one image is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    setLoading(true)

    const payload = {
      ...form,
      base_price: parseFloat(form.base_price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
    }

    const result = isEditMode
      ? await updateProduct(productId, payload)
      : await createProduct(payload)

    setLoading(false)
    if (result?.error) setServerError(result.error)
    else setSuccess(true)
  }

  // Group categories: parents first, then children indented
  const parentCats = categories.filter(c => !c.parent_id)
  const childCats  = categories.filter(c => !!c.parent_id)

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
      <p className="text-[#9b8070]">Access denied.</p>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#ede4da] p-10 flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#d97845] flex items-center justify-center">
          <Check size={30} className="text-white" strokeWidth={3} />
        </div>
        <p className="font-bold text-[#2c1a0e] text-[17px]">
          {isEditMode ? 'Product Updated!' : 'Product Created!'}
        </p>
        <div className="flex gap-3">
          <button onClick={() => {
            if (isEditMode) {
              router.push('/admin/dashboard/product/create')
              return
            }
            setSuccess(false)
            setForm({ name:'',description:'',details:'',base_price:'',discount_price:'',brand:'',category_id:'',is_active:true,colors:[],sizes:[],images:[] })
          }}
            className="px-5 py-2.5 rounded-xl border border-[#e8d9cc] text-[#6b5244] text-[13px] font-semibold bg-white hover:bg-[#fdf5ee] cursor-pointer transition-colors">
            {isEditMode ? 'Edit Another' : 'Add Another'}
          </button>
          <button onClick={() => router.push('/admin/dashboard/products')}
            className="px-5 py-2.5 rounded-xl bg-[#d97845] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b8622f] transition-colors">
            {isEditMode ? 'Back to Products' : 'View Products'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/admin/dashboard/products')}
          className="w-9 h-9 rounded-xl border border-[#e8d9cc] bg-white flex items-center justify-center text-[#6b5244] hover:bg-[#fdf0e6] hover:text-[#d97845] transition-colors cursor-pointer border-solid">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[22px] font-bold text-[#2c1a0e]">
            {isEditMode ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-[13px] text-[#9b8070] mt-0.5">
            {isEditMode ? 'Update an existing product in TheLook' : 'Add a new product to TheLook'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-5">
              <h2 className="text-[15px] font-bold text-[#2c1a0e] flex items-center gap-2">
                <Package size={16} className="text-[#d97845]" /> Basic Info
              </h2>

              <Field label="Product Name" required error={errors.name}>
                <Input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Classic Oxford Shirt" error={errors.name} />
              </Field>

              <Field label="Short Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3} placeholder="Brief summary shown in product cards…"
                  className="w-full border border-[#e8d9cc] rounded-xl px-4 py-3 text-[14px] text-[#2c1a0e] outline-none bg-white focus:border-[#d97845] placeholder:text-[#c8b4a4] resize-none transition-colors" />
              </Field>

              <Field label="Product Details (Rich Text)">
                <TipTapEditor value={form.details} onChange={v => set('details', v)} />
              </Field>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-4">
              <h2 className="text-[15px] font-bold text-[#2c1a0e]">Images</h2>
              <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
              {errors.images && <p className="text-red-500 text-[11px]">{errors.images}</p>}
            </div>

            {/* Colors */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-4">
              <h2 className="text-[15px] font-bold text-[#2c1a0e]">Colors</h2>
              <ColorManager colors={form.colors} onChange={c => set('colors', c)} />
            </div>

            {/* Sizes & Stock */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-4">
              <h2 className="text-[15px] font-bold text-[#2c1a0e]">Sizes & Stock</h2>
              <SizeManager sizes={form.sizes} onChange={s => set('sizes', s)} />
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-5">
              <h2 className="text-[15px] font-bold text-[#2c1a0e]">Pricing</h2>

              <Field label="Base Price (৳)" required error={errors.base_price}>
                <Input type="number" min="0" step="0.01" value={form.base_price}
                  onChange={e => set('base_price', e.target.value)}
                  placeholder="0.00" error={errors.base_price} />
              </Field>

              <Field label="Discount Price (৳)">
                <Input type="number" min="0" step="0.01" value={form.discount_price}
                  onChange={e => set('discount_price', e.target.value)}
                  placeholder="Leave empty for no discount" />
              </Field>

              {form.discount_price && form.base_price && +form.discount_price < +form.base_price && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <span className="text-[12px] text-emerald-700 font-semibold">Discount</span>
                  <span className="text-[13px] font-bold text-emerald-700">
                    {Math.round((1 - form.discount_price / form.base_price) * 100)}% off
                  </span>
                </div>
              )}
            </div>

            {/* Organisation */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6 flex flex-col gap-5">
              <h2 className="text-[15px] font-bold text-[#2c1a0e]">Organisation</h2>

              <Field label="Category" required error={errors.category_id}>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-[14px] text-[#2c1a0e] outline-none bg-white transition-colors
                    ${errors.category_id ? 'border-red-400' : 'border-[#e8d9cc] focus:border-[#d97845]'}`}>
                  <option value="">Select category</option>
                  {parentCats.map(p => (
                    <optgroup key={p.id} label={p.name}>
                      {childCats.filter(c => c.parent_id === p.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>

              <Field label="Brand">
                <Input value={form.brand} onChange={e => set('brand', e.target.value)}
                  placeholder="e.g. TheLook Basics" />
              </Field>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-[#ede4da] p-6">
              <h2 className="text-[15px] font-bold text-[#2c1a0e] mb-4">Status</h2>
              <div className="flex flex-col gap-2">
                {[
                  { value: true,  label: 'Active',  sub: 'Visible to customers', dot: 'bg-emerald-500' },
                  { value: false, label: 'Inactive', sub: 'Hidden from storefront', dot: 'bg-slate-400' },
                ].map(opt => (
                  <button key={String(opt.value)} type="button"
                    onClick={() => set('is_active', opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer
                      ${form.is_active === opt.value
                        ? 'border-[#d97845] bg-[#fdf8f3]'
                        : 'border-[#e8d9cc] bg-white hover:border-[#c8a990]'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#2c1a0e]">{opt.label}</p>
                      <p className="text-[11px] text-[#9b8070]">{opt.sub}</p>
                    </div>
                    {form.is_active === opt.value && (
                      <Check size={14} className="text-[#d97845]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-[13px]">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={loading || loadingProduct}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-[14px] font-bold border-none transition-all
                ${loading || loadingProduct ? 'bg-[#e8a070] cursor-not-allowed' : 'bg-[#d97845] hover:bg-[#b8622f] cursor-pointer shadow-[0_4px_14px_rgba(217,120,69,0.35)]'}`}>
              {loading || loadingProduct ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isEditMode ? 'Updating Product…' : 'Creating Product…'}
                </>
              ) : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
