'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath, revalidateTag } from 'next/cache'

function getServiceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

async function verifyAdmin(supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
    return ['admin', 'super_admin'].includes(profile?.role) ? user : null
}

function nameToSlugPart(name) {
    return name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createProduct(formData) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    // product_code is assigned by DB sequence; we build the slug after insert
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            name: formData.name,
            slug: `draft-${Date.now()}`,   // temp slug — updated immediately below
            description: formData.description,
            details: formData.details,
            base_price: formData.base_price,
            discount_price: formData.discount_price || null,
            category_id: formData.category_id,
            brand: formData.brand || null,
            is_active: formData.is_active ?? true,
            created_by: caller.id,
        })
        .select('id, product_code')
        .single()

    if (productError) return { error: productError.message }

    const { id: productId, product_code } = product

    // Build final slug: 10001-classic-oxford-shirt
    const slug = `${product_code}-${nameToSlugPart(formData.name)}`
    await supabase.from('products').update({ slug }).eq('id', productId)

    // Colors
    if (formData.colors?.length > 0) {
        const { error } = await supabase.from('product_colors').insert(
            formData.colors.map((c, i) => ({
                product_id: productId, name: c.name,
                hex_code: c.hex_code || null, display_order: i,
            }))
        )
        if (error) return { error: error.message }
    }

    // Sizes
    if (formData.sizes?.length > 0) {
        const { error } = await supabase.from('product_sizes').insert(
            formData.sizes.map(s => ({
                product_id: productId, label: s.label,
                sku: s.sku || null,
                stock_quantity: s.stock_quantity ?? 0,
                price_override: s.price_override || null,
            }))
        )
        if (error) return { error: error.message }
    }

    // Images
    if (formData.images?.length > 0) {
        const { error } = await supabase.from('product_images').insert(
            formData.images.map((img, i) => ({
                product_id: productId, storage_path: img.storage_path,
                display_order: i, is_primary: i === 0,
            }))
        )
        if (error) return { error: error.message }
    }

    // Invalidate all product caches
    revalidateTag('products')
    revalidatePath('/admin/dashboard/products')

    return { success: true, slug }
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateProduct(productId, formData) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    // Get current product_code so we can rebuild the slug correctly
    const { data: current } = await supabase
        .from('products').select('product_code').eq('id', productId).single()

    const slug = `${current.product_code}-${nameToSlugPart(formData.name)}`

    const { error: productError } = await supabase.from('products').update({
        name: formData.name,
        slug,
        description: formData.description,
        details: formData.details,
        base_price: formData.base_price,
        discount_price: formData.discount_price || null,
        category_id: formData.category_id,
        brand: formData.brand || null,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
    }).eq('id', productId)

    if (productError) return { error: productError.message }

    // Replace colors, sizes, images
    await supabase.from('product_colors').delete().eq('product_id', productId)
    if (formData.colors?.length > 0) {
        await supabase.from('product_colors').insert(
            formData.colors.map((c, i) => ({
                product_id: productId, name: c.name,
                hex_code: c.hex_code || null, display_order: i,
            }))
        )
    }

    await supabase.from('product_sizes').delete().eq('product_id', productId)
    if (formData.sizes?.length > 0) {
        await supabase.from('product_sizes').insert(
            formData.sizes.map(s => ({
                product_id: productId, label: s.label,
                sku: s.sku || null, stock_quantity: s.stock_quantity ?? 0,
                price_override: s.price_override || null,
            }))
        )
    }

    if (formData.images !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', productId)
        if (formData.images.length > 0) {
            await supabase.from('product_images').insert(
                formData.images.map((img, i) => ({
                    product_id: productId, storage_path: img.storage_path,
                    display_order: i, is_primary: i === 0,
                }))
            )
        }
    }

    revalidateTag('products')
    revalidateTag(`product-${current.product_code}`)
    revalidatePath('/admin/dashboard/products')

    return { success: true, slug }
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteProduct(productId) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    const { data: images } = await supabase
        .from('product_images').select('storage_path').eq('product_id', productId)

    const { data: product } = await supabase
        .from('products').select('product_code').eq('id', productId).single()

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) return { error: error.message }

    if (images?.length > 0) {
        await supabase.storage.from('product-images').remove(images.map(i => i.storage_path))
    }

    revalidateTag('products')
    revalidateTag(`product-${product?.product_code}`)
    revalidatePath('/admin/dashboard/products')

    return { success: true }
}

// ── Categories (short-lived cache, rarely changes) ────────────────────────────
export async function getCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('parent_id', { nullsFirst: true })
        .order('name')
    if (error) return { error: error.message }
    return { data }
}



// ── Toggle active/inactive from list page ─────────────────────────────────────
export async function toggleProductStatus(productId, isActive) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', productId)

    if (error) return { error: error.message }
    revalidateTag('products')
    return { success: true }
}

// ── Mark all sizes as out of stock ────────────────────────────────────────────
export async function markOutOfStock(productId) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('product_sizes')
        .update({ stock_quantity: 0 })
        .eq('product_id', productId)

    if (error) return { error: error.message }
    revalidateTag('products')
    return { success: true }
}

// ── Mark all sizes as in stock again ─────────────────────────────────────────
export async function markInStock(productId, stockPerSize = 1) {
    const supabase = await createClient()
    const caller = await verifyAdmin(supabase)
    if (!caller) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('product_sizes')
        .update({ stock_quantity: stockPerSize })
        .eq('product_id', productId)

    if (error) return { error: error.message }
    revalidateTag('products')
    return { success: true }
}

// ── Fetch for client components (cache still applies server-side) ─────────────
export async function fetchAdminProducts(params) {
    const { getAdminProductsPage } = await import('@/lib/data/products')
    return getAdminProductsPage(params)
}

export async function fetchAdminProduct(productId) {
    const { getAdminProduct } = await import('@/lib/data/products')
    return getAdminProduct(productId)
}

export async function fetchCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .order('parent_id', { nullsFirst: true })
        .order('name')
    return data || []
}

export async function getProductCount() {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('products')
    .select('*', {
      count: 'exact',
      head: true
    })

  if (error) {
    return 0
  }

  return count || 0
}
