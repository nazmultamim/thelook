import { getCachedProduct } from '@/lib/data/products'


export async function generateMetadata({ params }) {
  const product = await getCachedProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} | TheLook`,
    description: product.description,
  }
}

export default async function ProductPage({ params }) {
  const product = await getCachedProduct(params.slug)
  if (!product){
    return(
      <>
      <h1>product is not found</h1>
      </>
    )
  }

  // Your product detail UI here
  return <div>{product.name}</div>
}