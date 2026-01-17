import ProductCard from "@/components/suggested_product_card/SuggestedProductCard";

export default function Home() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard
        title="Handmade Knit Scarf"
        description="Cozy, handmade scarf perfect for winter."
        price={45}
      />

      <ProductCard
        title="Crochet Beanie"
        description="Soft and warm beanie made with love."
        price={30}
      />
    </div>
  );
}
