import { supabase } from "./lib/supabase";

export default async function Home() {
  // Fetch categories
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  // Fetch products
  const { data: products, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      categories(name),
      conditions(name)
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">
        Electronics Marketplace
      </h1>

      {/* Errors */}
      {categoryError && (
        <p className="text-red-500">
          Categories Error: {categoryError.message}
        </p>
      )}

      {productError && (
        <p className="text-red-500">
          Products Error: {productError.message}
        </p>
      )}

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Categories
        </h2>

        <ul className="space-y-2">
          {categories?.map((category) => (
            <li
              key={category.id}
              className="border rounded p-3"
            >
              {category.id}. {category.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Products
        </h2>

        {products?.length === 0 && (
          <p>No products found.</p>
        )}

        <div className="grid gap-4">
          {products?.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-5 shadow-sm"
            >
              <h3 className="text-xl font-bold">
                {product.title}
              </h3>

              <p className="text-gray-600">
                {product.brand} {product.model}
              </p>

              <p className="mt-2">
                ${product.price}
              </p>

              <p>
                Category: {product.categories?.name}
              </p>

              <p>
                Condition: {product.conditions?.name}
              </p>

              <p className="mt-2">
                {product.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {product.suburb}, {product.state}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
