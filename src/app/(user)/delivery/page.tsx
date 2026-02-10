"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import OrderConfirmationCard from "@/components/OrderConfirmationCard";

interface DeliveryFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryInstructions: string;
  deliveryDate: string;
  deliveryTime: string;
}

export default function DeliveryPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const formInitializedRef = useRef(false);
  const [formData, setFormData] = useState<DeliveryFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryInstructions: "",
    deliveryDate: "",
    deliveryTime: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!completedOrder && !isLoading && !isAuthenticated) {
      setRedirectMessage("Please log in to complete your order");
      // Show message for 2 seconds before redirecting
      const timer = setTimeout(() => {
        router.push("/auth/login?callbackUrl=/delivery");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router, completedOrder]);

  // Auto-fill name and email from user session (only once)
  useEffect(() => {
    if (
      !completedOrder &&
      isAuthenticated &&
      user &&
      !isLoading &&
      !formInitializedRef.current
    ) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
      formInitializedRef.current = true;
    }
  }, [isAuthenticated, user?.email, user?.name, isLoading, completedOrder]);

  // Ensure cart is loaded before showing the form
  useEffect(() => {
    if (!completedOrder) {
      // Give cart context time to hydrate from localStorage
      const timer = setTimeout(() => {
        setCartLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCartLoaded(true);
    }
  }, [completedOrder]);

  const subtotal = state.totalPrice;
  const total = subtotal;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.items.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      router.push("/");
      return;
    }

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with delivery details
      const orderData = {
        items: state.items.map((item) => ({
          itemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          type: item.type,
        })),
        subtotal: subtotal,
        total: total,
        status: "pending",
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        deliveryLocation: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        deliveryInstructions: formData.deliveryInstructions,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.details || errorData.error || "Failed to create order";
        throw new Error(errorMsg);
      }

      const order = await response.json();
      console.log("Order created successfully:", order);

      // Clear cart after successful order
      clearCart();

      toast.success("Order placed successfully!");

      // Store completed order to show confirmation card
      setCompletedOrder(order);
    } catch (error) {
      console.error("Order creation error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process order. Please try again.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
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

  // Show order confirmation card FIRST to prevent cart state checks
  if (completedOrder) {
    return <OrderConfirmationCard order={completedOrder} />;
  }

  // Wait for cart to load from localStorage
  if (!cartLoaded) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Cart
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Delivery Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +233 123 456 7890"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g., Apt 123, 456 Main Street"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Accra"
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 00233"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      placeholder="e.g., Leave at front door, ring doorbell twice, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Schedule */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Delivery Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Preferred Delivery Time
                    </label>
                    <select
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    >
                      <option value="">Select a time slot</option>
                      <option value="08:00-10:00">08:00 AM - 10:00 AM</option>
                      <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                      <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                      <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                      <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#556B2F] hover:bg-[#4a5c2a] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Items Preview */}
              <div className="mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {state.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-start mb-4 last:mb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
