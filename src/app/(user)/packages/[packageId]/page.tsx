"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface PackageItem {
  name: string;
  quantity: number;
  unit: string;
}

interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  image?: string;
  items?: PackageItem[];
  status?: string;
}

export default function PackageDetailsPage() {
  const params = useParams();
  const packageId = params.packageId as string;
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch package details");
        }
        const data = await response.json();
        setPkg(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleAddToCart = () => {
    if (!pkg) return;

    const discountedPrice = pkg.price * (1 - (pkg.discount || 0) / 100);
    addItem({
      _id: pkg._id,
      name: pkg.name,
      price: discountedPrice,
      quantity,
      unit: "package",
      image: pkg.image,
      discount: pkg.discount,
      type: "package",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading package details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Package not found"}</p>
          <Link
            href="/"
            className="text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = pkg.price * (1 - (pkg.discount || 0) / 100);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      {/* Package Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-8">
          {/* Image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {pkg.image ? (
              <Image
                src={pkg.image}
                alt={pkg.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                quality={90}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                🍱
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </h1>
              <p className="text-gray-600 text-lg mb-6">{pkg.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    GHS {discountedPrice.toFixed(2)}
                  </span>
                  {pkg.discount && pkg.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        GHS {pkg.price.toFixed(2)}
                      </span>
                      <span className="bg-[#00CC4D] text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        Save {pkg.discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Items Included */}
              {pkg.items && pkg.items.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Items Included
                  </h3>
                  <div className="space-y-3">
                    {pkg.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <span className="text-gray-700 font-medium">
                          {item.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="mt-8 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Quantity:</span>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:hover:bg-transparent text-gray-600 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-lg ${
                  isAdded
                    ? "bg-[#00CC4D] text-gray-900"
                    : "bg-[#556B2F] hover:bg-[#4a5c2a] text-white"
                }`}
              >
                {isAdded
                  ? "✓ Added to Cart"
                  : `Add ${
                      quantity > 1 ? quantity + " x " : ""
                    }to Cart - GHS ${(discountedPrice * quantity).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
