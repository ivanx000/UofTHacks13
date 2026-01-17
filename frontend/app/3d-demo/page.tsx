"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { RecommendationResponse, searchProducts, SearchProduct, getRecommendations } from "@/lib/api";
import Product3DModel from "@/components/3d/Product3DModel";

// Product 3D Component
function Product3D({ 
  position, 
  productName, 
  isSelected, 
  onClick,
  color,
  modelFile,
  scale,
  offset
}: { 
  position: [number, number, number];
  productName: string;
  isSelected: boolean;
  onClick: () => void;
  color: string;
  modelFile: string;
  scale?: number;
  offset?: [number, number, number];
}) {
  return (
    <group position={position} onClick={onClick}>
      <Product3DModel 
        position={[0, 0, 0]} 
        color={color}
        modelFile={modelFile}
        scale={scale}
        offset={offset}
      />
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        outlineWidth={0.02}
        outlineColor="white"
      >
        {productName}
      </Text>
    </group>
  );
}

// 3D Scene Component
function Scene({ 
  products, 
  selectedIndex, 
  onProductClick 
}: { 
  products: { name: string; category: string }[];
  selectedIndex: number | null;
  onProductClick: (index: number) => void;
}) {
  const positions: [number, number, number][] = [
    [-4, 0, 0],
    [-2, 0, 0],
    [0, 0, 0],
    [2, 0, 0],
    [4, 0, 0],
  ];

  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7"];
  
  // Map product names to their model files
  const modelFiles = ["candle.obj", "diffuser.obj", "journal.obj", "pillow.obj", "tea.obj"];
  
  // Adjust scales for each model
  const scales = [0.007, 0.005, 0.0060, 0.002, 0.005]; // candle, diffuser, journal, pillow, tea  
  // Adjust offsets to center rotation for each model [x, y, z]
  const offsets: [number, number, number][] = [
    [0, 0, 0],     // candle
    [0, 0, 0],     // diffuser
    [0, 0, 0],     // journal
    [0, 0, 0],     // pillow
    [0, 0, 0],     // tea
  ];
  return (
    <Canvas camera={{ position: selectedIndex !== null ? [-2, 0, 5] : [0, 0, 10], fov: selectedIndex !== null ? 60 : 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} />
      
      {products.slice(0, 5).map((product, index) => {
        // Always render all products, but position selected one on the left
        const isSelected = selectedIndex === index;
        const position: [number, number, number] = isSelected 
          ? [-2, 0, 0]  // Move to left side when selected
          : selectedIndex !== null 
            ? [10, 10, 10] // Hide other products far away when one is selected
            : positions[index]; // Original position when nothing selected
        
        return (
          <Product3D
            key={index}
            position={position}
            productName={product.name}
            isSelected={isSelected}
            onClick={() => onProductClick(index)}
            color={colors[index % colors.length]}
            modelFile={modelFiles[index]}
            scale={scales[index]}
            offset={offsets[index]}
          />
        );
      })}
      
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}

function ThreeDDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goal = searchParams.get("goal");
  
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<SearchProduct | null>(null);

  useEffect(() => {
    if (!goal) {
      router.push("/");
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const result = await getRecommendations(goal);
        setData(result);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        router.push("/");
      }
    };

    fetchRecommendations();
  }, [goal, router]);

  const handleProductClick = async (index: number) => {
    if (selectedProductIndex === index) {
      setSelectedProductIndex(null);
      setSearchResults([]);
      return;
    }

    setSelectedProductIndex(index);
    setLoadingProducts(true);

    if (data && data.products[index]) {
      try {
        const results = await searchProducts(data.products[index].name, 6);
        setSearchResults(results.products);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-gray-900">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          ← Back to Home
        </button>
      </div>


      {/* Main Content - Window Layout */}
      <div className="h-screen flex items-center justify-center p-8">
        <div className={`w-full max-w-7xl h-full transition-all duration-300 ${selectedProductIndex !== null ? 'border-4 border-gray-300 rounded-lg shadow-2xl' : 'border-0'} bg-white overflow-hidden`}>
          <div className="flex h-full">
            {/* Left Side - 3D Scene */}
            <div className={`transition-all duration-500 ${selectedProductIndex !== null ? 'w-1/2 border-r-4 border-gray-300' : 'w-full'}`}>
              <div className="h-full">
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-2xl text-gray-900">Loading 3D scene...</div>
                  </div>
                }>
                  <Scene
                    products={data.products}
                    selectedIndex={selectedProductIndex}
                    onProductClick={handleProductClick}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right Side - Product Grid (Horizontal) */}
            {selectedProductIndex !== null && (
              <div className="w-1/2 bg-white p-6 overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Products for: {data.products[selectedProductIndex].name}
                </h3>
                
                {loadingProducts ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-700">Searching for products...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {searchResults.map((product, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedProductDetail(product)}
                        className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-24 object-cover rounded mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-xs mb-1 line-clamp-2 text-gray-900">{product.title}</h4>
                        <p className="text-blue-600 font-bold text-sm">
                          ${product.price.toFixed(2)} {product.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border-4 border-gray-300 shadow-2xl">
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
            >
              ×
            </button>
            
            {selectedProductDetail.image && (
              <img
                src={selectedProductDetail.image}
                alt={selectedProductDetail.title}
                className="w-full h-64 object-cover rounded mb-4 border-2 border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            <h2 className="text-3xl font-bold mb-2 text-gray-900">{selectedProductDetail.title}</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-green-600">
                ${selectedProductDetail.price.toFixed(2)} {selectedProductDetail.currency}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                {selectedProductDetail.platform}
              </span>
            </div>
            
            {selectedProductDetail.rating && (
              <p className="text-yellow-600 mb-2">⭐ {selectedProductDetail.rating}</p>
            )}
            
            {selectedProductDetail.condition && (
              <p className="text-gray-600 mb-2">Condition: {selectedProductDetail.condition}</p>
            )}
            
            <a
              href={selectedProductDetail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center font-semibold"
            >
              View on {selectedProductDetail.platform} →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThreeDDemo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-gray-900">Loading...</div>
      </div>
    }>
      <ThreeDDemoContent />
    </Suspense>
  );
}
