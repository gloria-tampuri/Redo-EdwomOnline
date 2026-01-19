"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import ItemsTable from "@/components/admin/ItemsTable";

export default function ItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/admin-login");
      return;
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "super-admin") {
      router.push("/");
      return;
    }

    setIsChecking(false);
  }, [session, status, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className=" mx-auto px-6 py-8">
        <ItemsTable />
      </div>
    </AdminLayout>
  );
}
