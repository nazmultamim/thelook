
import { getCachedProduct } from '@/lib/data/products'
import ProductImage from '@/components/ui/ProductImage'
import { notFound } from 'next/navigation'
export const revalidate = 60

async function getProductSlugs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=slug&is_active=eq.true`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return []
  return res.json()
}

export async function generateStaticParams() {
  const data = await getProductSlugs()
  return (data ?? []).map(p => ({ slug: p.slug }))
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    notFound()
  }

  // Calculate discount percentage
  const hasDiscount = product.discount_price && product.discount_price < product.base_price
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#2D2219] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-[#F3EDE4]">

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column: Image Area */}
          <div className="w-full">
            <ProductImage images={product.images} name={product.name} />
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Brand and Status Tag */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#C17A4A]">
                  {product.brand || 'Premium Quality'}
                </span>
                {hasDiscount && (
                  <span className="bg-[#E25C3D] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Sale
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2219] leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-extrabold text-[#E25C3D]">
                  ৳ {hasDiscount ? product.discount_price : product.base_price}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#9A8D82] line-through">
                      ৳ {product.base_price}
                    </span>
                    <span className="text-xs font-bold bg-[#FCEEEB] text-[#E25C3D] px-2 py-0.5 rounded">
                      {discountPercentage}% Off
                    </span>
                  </>
                )}
              </div>

              <hr className="border-[#F3EDE4] my-6" />

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#2D2219] mb-3">Select Size:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.id}
                        disabled={size.stock_quantity === 0 || size.status === 'out_of_stock'}
                        className="min-w-[48px] h-10 px-3 flex items-center justify-center text-sm font-medium rounded-xl border border-[#DCD0C4] hover:border-[#C17A4A] hover:bg-[#FAF6F0] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-[#DCD0C4]"
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#2D2219] mb-3">Available Colors:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        title={color.name}
                        className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-[#DCD0C4] hover:ring-[#C17A4A] transition p-0.5"
                        style={{ backgroundColor: color.hex_code }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart button */}
              <div className="flex items-center gap-4 mt-8">
                <div className="flex items-center border border-[#DCD0C4] rounded-xl h-12 bg-[#FAF6F0]">
                  <button className="px-4 text-lg font-bold text-[#6D5D50] hover:text-[#2D2219]">-</button>
                  <span className="w-10 text-center font-semibold text-sm">1</span>
                  <button className="px-4 text-lg font-bold text-[#6D5D50] hover:text-[#2D2219]">+</button>
                </div>
                <button className="flex-1 h-12 bg-[#2D2219] hover:bg-[#403225] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
                  <span>+</span> Add To Cart
                </button>
              </div>
            </div>

            {/* Product Short Description & Details */}
            <div className="mt-8 border-t border-[#F3EDE4] pt-6">
              <p className="text-sm text-[#6D5D50] leading-relaxed mb-4">
                {product.description}
              </p>
              {product.details && (
                <div className="text-xs text-[#8A796B] space-y-1 bg-[#FAF6F0] p-4 rounded-2xl border border-[#F3EDE4]">
                  <span className="font-bold block text-[#2D2219] mb-1">Specifications:</span>
                  <p className="whitespace-pre-line">{product.details}</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} | TheLook`,
    description: product.description,
  }
}