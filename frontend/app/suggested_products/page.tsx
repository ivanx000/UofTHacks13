"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecommendationResponse } from "@/lib/api";

export default function SuggestionsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [goal, setGoal] = useState<string>("");

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem("recommendations");
    const storedGoal = localStorage.getItem("originalGoal");

    if (!storedData || !storedGoal) {
      router.push("/");
      return;
    }

    setData(JSON.parse(storedData));
    setGoal(storedGoal);

    // Clean up localStorage after reading
    localStorage.removeItem("recommendations");
    localStorage.removeItem("originalGoal");
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-blue-500 hover:text-blue-700 underline"
        >
          ← Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Recommendations</h1>
          <p className="text-lg text-gray-600 mb-2">
            <span className="font-semibold">Your goal:</span> {goal}
          </p>
          <p className="text-lg text-gray-700">{data.vibe_analysis}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold mb-4">Suggested Products</h2>
          {data.products.map((product, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-2xl font-bold">{product.name}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{product.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
