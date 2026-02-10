"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Order } from "@/types/order";

export default function UserOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?callbackUrl=/orders");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/orders/history", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Please log in to view your orders.");
            return;
          }
          throw new Error("Failed to fetch order history");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setIsFetching(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      fetchOrders();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || isFetching) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/"
            className="text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#556B2F] hover:text-[#4a5c2a] font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">You have no orders yet.</p>
            <Link
              href="/"
              className="inline-block bg-[#556B2F] hover:bg-[#4a5c2a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">
                    {order.orderId || order._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Date</p>
                  <p className="text-gray-900">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-[#556B2F]">{order.status}</p>
                  <p className="text-sm text-gray-500 mt-2">Total</p>
                  <p className="text-gray-900 font-semibold">
                    GHS {(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  {order.items?.slice(0, 2).map((item) => (
                    <p key={`${order._id}-${item.name}`}>
                      {item.quantity} × {item.name}
                    </p>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-gray-500">
                      +{order.items.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
