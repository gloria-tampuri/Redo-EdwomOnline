"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoriesTable from "@/components/admin/CategoriesTable";
import UnitsTable from "@/components/admin/UnitsTable";

export default function CategoriesAndUnitsPage() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Categories & Units
          </h1>
          <p className="text-gray-600 mt-2">
            Manage product categories and measurement units
          </p>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-8">
            <CategoriesTable />
          </TabsContent>

          <TabsContent value="units" className="mt-8">
            <UnitsTable />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
