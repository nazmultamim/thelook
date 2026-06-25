'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminStore } from '@/store/adminStore'
import {
    fetchAdminProducts, fetchCategories,
    deleteProduct, toggleProductStatus, markOutOfStock, markInStock
} from '@/app/actions/products'
import {
    Plus, Search, Filter, RefreshCw, MoreHorizontal,
    Pencil, Trash2, Eye, EyeOff, PackageX, X, Check,
    AlertTriangle, ChevronLeft, ChevronRight, Package
} from 'lucide-react'
import Link from 'next/link'

const PAGE_SIZE = 12

// ── Derived stock status from sizes array ─────────────────────────────────────
function getStockStatus(sizes) {
    if (!sizes?.length) return 'out_of_stock'
    const total = sizes.reduce((sum, s) => sum + (s.stock_quantity ?? 0), 0)
    if (total === 0) return 'out_of_stock'
    if (sizes.some(s => s.status === 'in_stock')) return 'in_stock'
    return 'low_stock'
}

// ── Badge components ──────────────────────────────────────────────────────────
function StockBadge({ sizes }) {
    const status = getStockStatus(sizes)
    const map = {
        in_stock: { label: 'In Stock', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
        low_stock: { label: 'Low Stock', cls: 'bg-amber-50  text-amber-700  border-amber-200', dot: 'bg-amber-500' },
        out_of_stock: { label: 'Out of Stock', cls: 'bg-red-50    text-red-700    border-red-200', dot: 'bg-red-500' },
    }
    const m = map[status]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${m.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {m.label}
        </span>
    )
}

function ActiveBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye size={10} /> Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <EyeOff size={10} /> Hidden
        </span>
    )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-[13px] font-medium pointer-events-auto transition-all
          ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    {t.type === 'error' ? <X size={14} /> : <Check size={14} />}
                    {t.message}
                </div>
            ))}
        </div>
    )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-[#ede4da] w-full max-w-sm p-6 z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-orange-600'} />
                </div>
                <h3 className="text-[15px] font-bold text-[#2c1a0e] text-center mb-2">{title}</h3>
                <p className="text-[13px] text-[#9b8070] text-center mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-[#e8d9cc] text-[#6b5244] text-[13px] font-semibold bg-white hover:bg-[#fdf5ee] transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold border-none cursor-pointer transition-colors
              ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#d97845] hover:bg-[#b8622f]'}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Action menu per product ───────────────────────────────────────────────────
function ActionMenu({ product, onAction }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const act = (type) => { onAction(type, product); setOpen(false) }
    const isOOS = getStockStatus(product.sizes) === 'out_of_stock'

    return (
        <div ref={ref} className="relative">
            <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f5ede4] text-[#9b8070] hover:text-[#d97845] transition-colors border-none bg-transparent cursor-pointer">
                <MoreHorizontal size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-9 w-[210px] bg-white rounded-xl border border-[#ede4da] shadow-[0_8px_30px_rgba(100,55,20,0.12)] z-20 py-1 overflow-hidden">

                    {/* Edit */}
                    <button onClick={() => act('edit')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3d2410] hover:bg-[#fdf0e6] transition-colors border-none bg-transparent cursor-pointer text-left">
                        <Pencil size={14} className="text-[#d97845]" /> Edit Product
                    </button>

                    {/* Toggle active */}
                    <button onClick={() => act('toggle_active')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3d2410] hover:bg-[#fdf0e6] transition-colors border-none bg-transparent cursor-pointer text-left">
                        {product.is_active
                            ? <><EyeOff size={14} className="text-slate-500" /> Set as Hidden</>
                            : <><Eye size={14} className="text-blue-500" /> Set as Active</>}
                    </button>

                    {/* Stock status */}
                    {isOOS ? (
                        <button onClick={() => act('mark_in_stock')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3d2410] hover:bg-[#fdf0e6] transition-colors border-none bg-transparent cursor-pointer text-left">
                            <Package size={14} className="text-emerald-500" /> Mark In Stock
                        </button>
                    ) : (
                        <button onClick={() => act('mark_oos')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3d2410] hover:bg-[#fdf0e6] transition-colors border-none bg-transparent cursor-pointer text-left">
                            <PackageX size={14} className="text-amber-500" /> Mark Out of Stock
                        </button>
                    )}

                    <div className="border-t border-[#f0e8e0] my-1" />

                    {/* Delete */}
                    <button onClick={() => act('delete')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left">
                        <Trash2 size={14} /> Delete Product
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Product image helper ──────────────────────────────────────────────────────
function ProductThumb({ images }) {
    const supabase = createClient()
    const primary = images?.find(i => i.is_primary) ?? images?.[0]
    if (!primary) return (
        <div className="w-14 h-14 rounded-xl bg-[#f5ede4] flex items-center justify-center shrink-0">
            <Package size={20} className="text-[#c8a080]" />
        </div>
    )
    const { data } = supabase.storage.from('product-images').getPublicUrl(primary.storage_path)
    // eslint-disable-next-line @next/next/no-img-element
    const image = <img src={data.publicUrl} alt=""
        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#f0e8e0]" />
    return image
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
    const router = useRouter()
    const loadRequestId = useRef(0)

    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [categories, setCategories] = useState([])
    const [toasts, setToasts] = useState([])
    const [dialog, setDialog] = useState({ open: false })

    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)

    const setProductTotal = useAdminStore((state) => state.setProductTotal)

    const toast = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
    }, [])

    const load = useCallback(async () => {
        const requestId = ++loadRequestId.current
        setLoading(true)
        try {
            const result = await fetchAdminProducts({ page, search, categoryId, status: statusFilter })

            if (loadRequestId.current !== requestId) return

            if (result?.error) {
                setProducts([])
                setTotal(0)
                toast(result.error, 'error')
                return
            }

            const count = result?.count || 0

            setProducts(result?.data || [])
            setTotal(count)
            setProductTotal(count)
        } catch (error) {
            if (loadRequestId.current !== requestId) return
            setProducts([])
            setTotal(0)
            toast(error?.message || 'Failed to load products', 'error')
        } finally {
            if (loadRequestId.current === requestId) {
                setLoading(false)
            }
        }
    }, [page, search, categoryId, statusFilter, toast, setProductTotal])

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load() }, [load])
    useEffect(() => {
        let mounted = true
        fetchCategories()
            .then(data => {
                if (mounted) setCategories(Array.isArray(data) ? data : [])
            })
            .catch(error => {
                if (mounted) toast(error?.message || 'Failed to load categories', 'error')
            })
        return () => { mounted = false }
    }, [toast])

    const handleAction = (type, product) => {
        if (type === 'edit') {
            router.push(`/admin/dashboard/product/create?productId=${product.id}`)
            return
        }

        const configs = {
            toggle_active: {
                title: product.is_active ? 'Hide Product' : 'Activate Product',
                message: product.is_active
                    ? `"${product.name}" will be hidden from the storefront.`
                    : `"${product.name}" will be visible to customers.`,
                confirmLabel: product.is_active ? 'Hide' : 'Activate',
                danger: false,
                onConfirm: () => execAction('toggle_active', product),
            },
            mark_oos: {
                title: 'Mark Out of Stock',
                message: `Set all sizes of "${product.name}" to 0 stock? You can restock from the edit page.`,
                confirmLabel: 'Mark OOS',
                danger: false,
                onConfirm: () => execAction('mark_oos', product),
            },
            mark_in_stock: {
                title: 'Mark In Stock',
                message: `Set all sizes of "${product.name}" back to 1 in stock?`,
                confirmLabel: 'Mark In Stock',
                danger: false,
                onConfirm: () => execAction('mark_in_stock', product),
            },
            delete: {
                title: 'Delete Product',
                message: `Permanently delete "${product.name}"? All images, sizes, and colors will be removed.`,
                confirmLabel: 'Delete',
                danger: true,
                onConfirm: () => execAction('delete', product),
            },
        }

        const cfg = configs[type]
        if (cfg) setDialog({ open: true, ...cfg })
    }

    const execAction = async (type, product) => {
        setDialog({ open: false })
        setActionLoading(product.id)

        try {
            let result

            if (type === 'toggle_active') {
                result = await toggleProductStatus(product.id, !product.is_active)
                if (!result?.error) toast(`"${product.name}" ${!product.is_active ? 'activated' : 'hidden'}`)
            }
            if (type === 'mark_oos') {
                result = await markOutOfStock(product.id)
                if (!result?.error) toast(`"${product.name}" marked as out of stock`)
            }
            if (type === 'mark_in_stock') {
                result = await markInStock(product.id)
                if (!result?.error) toast(`"${product.name}" marked as in stock`)
            }
            if (type === 'delete') {
                result = await deleteProduct(product.id)
                if (!result?.error) toast(`"${product.name}" deleted`)
            }

            if (result?.error) toast(result.error, 'error')
            else await load()
        } catch {
            toast('Something went wrong', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)
    const parentCats = categories.filter(c => !c.parent_id)
    const childCats = categories.filter(c => !!c.parent_id)

    return (
        <div className="min-h-screen bg-[#f5f0eb] p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[22px] font-bold text-[#2c1a0e]">Products</h1>
                    <p className="text-[13px] text-[#9b8070] mt-0.5">
                        {total} product{total !== 1 ? 's' : ''} total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={load}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e8d9cc] text-[#6b5244] text-[13px] font-medium hover:bg-white transition-colors bg-transparent cursor-pointer">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={() => router.push('/admin/dashboard/product/create')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d97845] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b8622f] transition-colors shadow-[0_3px_10px_rgba(217,120,69,0.28)]">
                        <Plus size={14} /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[#ede4da] mb-4 p-4 flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
                    <Search size={14} className="text-[#b8a090] shrink-0" />
                    <input type="text" value={search} onChange={e => { setPage(1); setSearch(e.target.value) }}
                        placeholder="Search products…"
                        className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] placeholder:text-[#c8b4a4] w-full" />
                    {search && (
                        <button onClick={() => { setPage(1); setSearch('') }}
                            className="text-[#b8a090] hover:text-[#d97845] border-none bg-transparent cursor-pointer p-0 flex">
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-1.5 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
                    <Filter size={13} className="text-[#b8a090]" />
                    <select value={categoryId} onChange={e => { setPage(1); setCategoryId(e.target.value) }}
                        className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] cursor-pointer">
                        <option value="">All Categories</option>
                        {parentCats.map(p => (
                            <optgroup key={p.id} label={p.name}>
                                {childCats.filter(c => c.parent_id === p.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5 bg-[#fdf8f3] border border-[#e8d9cc] rounded-xl px-3 py-2">
                    <select value={statusFilter} onChange={e => { setPage(1); setStatusFilter(e.target.value) }}
                        className="bg-transparent border-none outline-none text-[13px] text-[#2c1a0e] cursor-pointer">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Hidden</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#ede4da] overflow-visible">

                {/* Header row */}
                <div className="grid grid-cols-[56px_1fr_140px_120px_100px_100px_48px] gap-4 px-5 py-3 bg-[#fdf8f3] border-b border-[#f0e8e0]">
                    {['', 'Product', 'Category', 'Price', 'Stock', 'Visibility', ''].map((h, i) => (
                        <p key={i} className="text-[11px] font-semibold text-[#9b8070] uppercase tracking-wider m-0">{h}</p>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw size={24} className="text-[#d97845] animate-spin" />
                            <p className="text-[13px] text-[#9b8070]">Loading products…</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#f5ede4] flex items-center justify-center">
                            <Package size={24} className="text-[#c8a080]" />
                        </div>
                        <p className="text-[14px] font-semibold text-[#2c1a0e]">No products found</p>
                        <p className="text-[13px] text-[#9b8070]">Try adjusting your search or filters</p>
                        <button onClick={() => router.push('/admin/dashboard/product/create')}
                            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d97845] text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b8622f] transition-colors">
                            <Plus size={14} /> Add First Product
                        </button>
                    </div>
                ) : products.map(product => {
                    const price = product.discount_price ?? product.base_price
                    const hasDiscount = !!product.discount_price && product.discount_price < product.base_price
                    const discountPct = hasDiscount
                        ? Math.round((1 - product.discount_price / product.base_price) * 100)
                        : 0

                    return (
                        <div key={product.id}
                            className={`grid grid-cols-[56px_1fr_140px_120px_100px_100px_48px] gap-4 px-5 py-4 items-center border-b border-[#f5ede4] last:border-0 hover:bg-[#fdfaf7] transition-colors
                ${actionLoading === product.id ? 'opacity-50 pointer-events-none' : ''}`}>

                            {/* Thumbnail */}

                            <ProductThumb images={product.images} />
                            <Link href={`/product/${product.slug}`}>
                                {/* Name + meta */}
                                <div className="min-w-0">
                                    <p className="text-[13.5px] font-semibold text-[#2c1a0e] truncate">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {product.brand && (
                                            <span className="text-[11px] text-[#b8a090]">{product.brand}</span>
                                        )}
                                        <span className="text-[10px] text-[#c8b4a4]">#{product.product_code}</span>
                                    </div>
                                </div>
                            </Link>
                            {/* Category */}
                            <div className="min-w-0">
                                {product.category ? (
                                    <div>
                                        {product.category.parent && (
                                            <p className="text-[10px] text-[#b8a090] truncate">{product.category.parent.name}</p>
                                        )}
                                        <p className="text-[12px] text-[#6b5244] font-medium truncate">{product.category.name}</p>
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-[#c8b4a4]">—</span>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <p className="text-[13px] font-bold text-[#2c1a0e]">
                                    ৳{Number(price).toLocaleString()}
                                </p>
                                {hasDiscount && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-[11px] text-[#b8a090] line-through">৳{Number(product.base_price).toLocaleString()}</p>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                            -{discountPct}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Stock */}
                            <StockBadge sizes={product.sizes} />

                            {/* Active status */}
                            <ActiveBadge active={product.is_active} />

                            {/* Action menu */}
                            <div onClick={e => e.stopPropagation()}>
                                <ActionMenu product={product} onAction={handleAction} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-[13px] text-[#9b8070]">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8d9cc] text-[#6b5244] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer">
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                            .map((n, idx, arr) => (
                                <span key={n} className="flex items-center gap-2">
                                    {idx > 0 && arr[idx - 1] !== n - 1 && (
                                        <span className="text-[#c8b4a4] text-[13px]">…</span>
                                    )}
                                    <button onClick={() => setPage(n)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors cursor-pointer border
                      ${page === n
                                                ? 'bg-[#d97845] text-white border-[#d97845]'
                                                : 'border-[#e8d9cc] text-[#6b5244] bg-transparent hover:bg-white'}`}>
                                        {n}
                                    </button>
                                </span>
                            ))}

                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e8d9cc] text-[#6b5244] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog {...dialog} onCancel={() => setDialog({ open: false })} />
            <Toast toasts={toasts} />
        </div>
    )
}
