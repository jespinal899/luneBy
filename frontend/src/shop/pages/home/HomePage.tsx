import { CustomPagination } from "@/components/Cutom/CustomPagination"
import { products } from "@/mocks/products.mock"
import { CustomJumbotron } from "@/shop/components/CustomJumbotron"
import { ProductsGrid } from "@/shop/components/ProductsGrid"



export const HomePage = () => {
  return (
    <>
      <CustomJumbotron title="LuneBy Kelin" />

      <ProductsGrid products={products} />
      <CustomPagination totalPages={5} />


    </>
  )
}