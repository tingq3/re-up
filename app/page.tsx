import { supabase } from "@/lib/supabase";
import FridgeTestClient from "@/app/components/FridgeTestClient";

export default async function Home() {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select(
      "id, name, category, quantity, unit, average_expiry_days, expiry_date, caution"
    )
    .order("expiry_date", { ascending: true });

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="mb-8 text-4xl font-bold">🥦 Fridge Recipe AI</h1>

      <section className="mb-10 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Test Fridge Scan</h2>
        <FridgeTestClient />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Ingredients</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ingredients?.map((item) => (
            <div key={item.id} className="rounded-lg bg-white p-4 shadow">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p>Category: {item.category}</p>
              <p>
                Quantity: {item.quantity} {item.unit}
              </p>
              <p>Average Expiry: {item.average_expiry_days} days</p>
              <p className="font-semibold text-red-600">
                Expires: {item.expiry_date}
              </p>
              <p className="mt-2 text-sm text-gray-500">{item.caution}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}