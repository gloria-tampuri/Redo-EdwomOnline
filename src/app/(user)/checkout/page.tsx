"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutPage() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setRedirectMessage("Please log in to continue with your order");
      // Show message for 2 seconds before redirecting
      const timer = setTimeout(() => {
        router.push("/auth/login?callbackUrl=/checkout");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  // Calculate totals
  const subtotal = state.totalPrice;
  const total = subtotal;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Navigate to delivery details page
    // Cart items are stored in context, so they'll be available on the next page
    router.push("/delivery");
  };

  // Show redirect message or loading state
  if (isLoading || redirectMessage) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            {redirectMessage ? (
              <div className="space-y-4">
                <div className="bg-[#556B2F] text-white px-6 py-4 rounded-lg shadow-lg max-w-md mx-auto">
                  <p className="text-lg font-semibold mb-2">
                    {redirectMessage}
                  </p>
                  <p className="text-sm opacity-90">
                    Redirecting you to login...
                  </p>
                </div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto"></div>
              </div>
            ) : (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto"></div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold mb-8"
          >
            <ChevronLeft size={20} />
            Continue Shopping
          </Link>

          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-[#556B2F] hover:bg-[#4a5c2a] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
          >
            <ChevronLeft size={20} />
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 border-2 border-[#556B2F] text-[#556B2F] hover:bg-[#F1F5F9] font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            View Order History
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header Row - Desktop only */}
              <div className="hidden md:grid bg-[#F0A500] text-gray-900 grid-cols-4 gap-4 p-4 font-bold text-sm">
                <div>Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Subtotal</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {state.items.map((item) => (
                  <div key={item._id} className="p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                      {/* Product */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              quality={80}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🛒
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.unit}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          GHS {item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex justify-center">
                        <div className="flex items-center gap-1 border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 disabled:hover:bg-transparent text-gray-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          GHS {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex gap-3 items-start mb-3">
                        {/* Image */}
                        <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              quality={80}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🛒
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {item.unit}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            GHS {item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Qty:</span>
                          <div className="flex items-center gap-1 border border-gray-300 rounded">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="p-0.5 hover:bg-gray-100 disabled:hover:bg-transparent text-gray-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              className="p-0.5 hover:bg-gray-100 text-gray-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          GHS {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    GHS {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    GHS {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#556B2F] hover:bg-[#4a5c2a] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
