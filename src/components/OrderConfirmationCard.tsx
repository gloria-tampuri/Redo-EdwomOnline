"use client";

import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  type: "item" | "package";
}

interface OrderConfirmationCardProps {
  order: {
    _id: string;
    orderId?: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    notes?: string;
    status: string;
    createdAt: string;
    deliveryEstimate?: string;
    customer?: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
    deliveryLocation?: string;
    deliveryInstructions?: string;
    deliveryTime?: string;
    deliveryDate?: string;
  };
}

export default function OrderConfirmationCard({
  order,
}: OrderConfirmationCardProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00CC4D] rounded-full mb-6">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All set!
          </h1>
          <p className="text-gray-600 text-lg">
            Your groceries are being prepared and our team will reach out soon.
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
                #{order.orderId || order._id.slice(-8).toUpperCase()}
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

        {/* Customer Information */}
        {order.customer && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-gray-900 font-medium">
                  {order.customer.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-gray-900 font-medium">
                  {order.customer.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900 font-medium">
                  {order.customer.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="text-gray-900 font-medium">
                  {order.customer.address || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Instructions */}
        {(order.deliveryTime ||
          order.deliveryInstructions ||
          order.deliveryDate) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Instructions
            </h2>
            <div className="space-y-4">
              {order.deliveryTime && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Preferred Delivery Time
                  </p>
                  <p className="text-gray-900 font-medium">
                    {order.deliveryTime}
                  </p>
                </div>
              )}
              {order.deliveryDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.deliveryInstructions && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Special Instructions
                  </p>
                  <p className="text-gray-900 font-medium">
                    {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="bg-[#E8F5E9] border-l-4 border-[#00CC4D] rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Delivery Details</h3>
          <p className="text-gray-700">
            Our team will contact you shortly with delivery details and an
            estimated delivery fee and time. Please ensure your phone number is
            correct and that you're available to receive the call.
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
            View Order History
          </Link>
        </div>
      </div>
    </main>
  );
}
