"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl");

  // Redirect to callback URL or home if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const redirectUrl = callbackUrl || "/";
      router.push(redirectUrl);
    }
  }, [status, session, router, callbackUrl]);

  if (status === "loading") {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <LoginForm isAdmin={false} />
    </AuthLayout>
  );
}
