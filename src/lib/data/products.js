import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const PRODUCT_TTL = 60          // public product pages: 60 seconds
const LIST_TTL    = 30          // listing pages: 30 seconds
const ADMIN_TTL   = 10          // admin pages: 10 seconds (near-fresh)

function normalizeCachePart(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

async function fetchAdminProductsPage({ page = 1, search = '', categoryId = '', status = '' } = {}) {
  const supabase = await createClient()
  const PAGE_SIZE = 12
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('products')
    .select(`
      id, product_code, name, slug, base_price, discount_price,
      brand, is_active, created_at,
      category:categories(id, name, parent:categories(name)),
      images:product_images(storage_path, is_primary, display_order),
      sizes:product_sizes(stock_quantity, status)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (search) query = query.ilike('name', `%${search}%`)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)

  const { data, error, count } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data ?? [], count: count ?? 0 }
}

// ── Public: get single product by slug (e.g. "10001-classic-oxford-shirt") ───
// Extracts the numeric code prefix so we hit the indexed integer column,
// not a LIKE scan on the slug string — this is the fast path.
export function getCachedProduct(slug) {
  if (!slug) return null
  const slugValue = Array.isArray(slug) ? slug[0] : slug
  const normalizedSlug = String(slugValue).trim().toLowerCase()
  const productCode = parseInt(normalizedSlug.split('-')[0], 10)

  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const baseSelect = `
          id, product_code, name, slug, description, details,
          base_price, discount_price, brand, is_active, created_at,
          category:categories(id, name, parent:categories(id, name, slug)),
          colors:product_colors(id, name, hex_code, display_order),
          sizes:product_sizes(id, label, stock_quantity, price_override, status),
          images:product_images(id, storage_path, display_order, is_primary, color_id)
        `

      const bySlug = await supabase
        .from('products')
        .select(baseSelect)
        .eq('slug', normalizedSlug)
        .eq('is_active', true)
        .single()

      if (bySlug.data) return bySlug.data

      if (!Number.isNaN(productCode)) {
        const byCode = await supabase
          .from('products')
          .select(baseSelect)
          .eq('product_code', productCode)
          .eq('is_active', true)
          .single()

        if (byCode.data) return byCode.data
      }

      return null
    },
    [`product-${normalizedSlug}`],
    {
      tags: Number.isNaN(productCode)
        ? [`product-${normalizedSlug}`, 'products']
        : [`product-${normalizedSlug}`, `product-${productCode}`, 'products'],
      revalidate: PRODUCT_TTL,
    }
  )()
}

// ── Public: product listing with filters ──────────────────────────────────────
export function getCachedProducts({ page = 1, search = '', categorySlug = '', status = '' } = {}) {
  const cacheKey = [
    'products-list',
    page,
    normalizeCachePart(search),
    normalizeCachePart(categorySlug),
    normalizeCachePart(status),
  ]

  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const PAGE_SIZE = 24
      const from = (page - 1) * PAGE_SIZE

      let query = supabase
        .from('products')
        .select(`
          id, product_code, name, slug, base_price, discount_price,
          brand, is_active, created_at,
          category:categories(id, name, slug, parent:categories(name, slug)),
          images:product_images(storage_path, is_primary, display_order),
          sizes:product_sizes(stock_quantity, status)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (search) query = query.ilike('name', `%${search}%`)

      if (categorySlug) {
        // Support both parent slug (men) and child slug (men-tshirt)
        const { data: cat } = await supabase
          .from('categories').select('id').eq('slug', categorySlug).single()

        if (cat) {
          const { data: children } = await supabase
            .from('categories').select('id').eq('parent_id', cat.id)

          const ids = [cat.id, ...(children?.map(c => c.id) || [])]
          query = query.in('category_id', ids)
        }
      }

      const { data, error, count } = await query
      if (error) return { data: [], count: 0 }
      return { data, count }
    },
    cacheKey,
    { tags: ['products'], revalidate: LIST_TTL }
  )()
}

// ── Admin: product list (near-fresh, admins need current stock/status) ────────
export function getAdminCachedProducts({ page = 1, search = '', categoryId = '', status = '' } = {}) {
  const cacheKey = [
    'admin-products',
    page,
    normalizeCachePart(search),
    normalizeCachePart(categoryId),
    normalizeCachePart(status),
  ]

  return unstable_cache(
    () => fetchAdminProductsPage({ page, search, categoryId, status }),
    cacheKey,
    { tags: ['products'], revalidate: ADMIN_TTL }
  )()
}

// ── Admin: product list without shared caching for live dashboard fetches ────
export function getAdminProductsPage(params = {}) {
  return fetchAdminProductsPage(params)
}

// ── Admin: single product for edit form ───────────────────────────────────────
export function getAdminProduct(productId) {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          colors:product_colors(id, name, hex_code, display_order),
          sizes:product_sizes(id, label, sku, stock_quantity, price_override, status),
          images:product_images(id, storage_path, display_order, is_primary, color_id)
        `)
        .eq('id', productId)
        .single()

      if (error) return null
      return data
    },
    [`admin-product-${productId}`],
    { tags: [`product-${productId}`, 'products'], revalidate: ADMIN_TTL }
  )()
}
