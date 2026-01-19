"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Clock } from "lucide-react";

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  type: "item" | "package";
}

interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  status: string;
  createdAt: string;
  deliveryEstimate?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00CC4D] rounded-full mb-6">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We're preparing it now.
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Number & Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-gray-900">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-[#556B2F]" />
                <span className="text-xl font-bold text-[#556B2F]">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Package size={24} className="text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    GHS {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × GHS {item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-700">
              <span>Subtotal</span>
              <span className="font-semibold">
                GHS {order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                GHS {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-[#E8F5E9] border-l-4 border-[#00CC4D] rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Delivery Details</h3>
          <p className="text-gray-700">
            Our team will contact you shortly with delivery details and an
            estimated delivery time. Please ensure your phone number is correct
            and that you're available to receive the call.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-[#F1F5F9] rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-[#556B2F] font-bold">1.</span>
              <span>
                We'll confirm your order and start preparing your items
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#556B2F] font-bold">2.</span>
              <span>
                You'll receive a notification when your order is ready for
                delivery
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#556B2F] font-bold">3.</span>
              <span>
                Our delivery partner will contact you to arrange delivery
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex-1 bg-[#556B2F] hover:bg-[#4a5c2a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 border-2 border-[#556B2F] text-[#556B2F] hover:bg-[#F1F5F9] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
