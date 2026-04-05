"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, Check, Clock, Leaf } from "lucide-react";
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
  youtubeUrl?: string;
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

  // Extract YouTube video ID from various URL formats
  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url || typeof url !== "string") return null;

    // Try multiple regex patterns for different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/, // youtube.com/watch?v=ID
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/, // youtu.be/ID
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, // youtube.com/embed/ID
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/, // youtube.com/v/ID
      /^([a-zA-Z0-9_-]{11})$/, // Just the ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // If it's already a valid embed URL, return as-is
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-red-600 mb-6 text-lg font-semibold">
            {error || "Package not found"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#556B2F] hover:bg-[#4a5c2a] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = pkg.price * (1 - (pkg.discount || 0) / 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image/Video Section */}
          <div className="flex flex-col gap-6">
            {/* Show Video if available, otherwise show Image */}
            {pkg.youtubeUrl && getYoutubeEmbedUrl(pkg.youtubeUrl) ? (
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={getYoutubeEmbedUrl(pkg.youtubeUrl)!}
                    title="Package Preview"
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {pkg.image ? (
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      quality={90}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-7xl">
                      🍱
                    </div>
                  )}
                  {pkg.discount && pkg.discount > 0 && (
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-[#00CC4D] to-[#00b340] text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg">
                      Save {pkg.discount}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-8">
            {/* Header Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {pkg.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {pkg.description}
              </p>

              {/* Price Section */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-2">
                      Price
                    </p>
                    <p className="text-5xl font-bold text-[#556B2F]">
                      GHS {discountedPrice.toFixed(2)}
                    </p>
                  </div>
                  {pkg.discount && pkg.discount > 0 && (
                    <div className="mb-2">
                      <p className="text-gray-400 line-through text-lg">
                        GHS {pkg.price.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Included */}
            {pkg.items && pkg.items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Leaf className="text-[#556B2F]" size={28} />
                  Items Included
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {pkg.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border-l-4 border-[#556B2F] hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Check className="text-[#556B2F]" size={20} />
                        <span className="text-gray-800 font-medium text-lg">
                          {item.name}
                        </span>
                      </div>
                      <span className="bg-[#556B2F] text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Quantity Selector */}
              <div className="mb-6">
                <p className="text-gray-700 font-semibold text-sm mb-3">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-600 rounded-lg transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      min="1"
                      className="w-full text-center text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 ${
                  isAdded
                    ? "bg-gradient-to-r from-[#00CC4D] to-[#00b340] text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-[#556B2F] to-[#4a5c2a] hover:from-[#4a5c2a] hover:to-[#3d4821] text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={24} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <Plus size={24} />
                    Add to Cart - GHS {(discountedPrice * quantity).toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-xs mt-4 flex items-center justify-center gap-1">
                <Clock size={16} />
                Free delivery on orders above GHS 100
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
