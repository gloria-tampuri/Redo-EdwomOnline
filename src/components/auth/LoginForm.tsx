"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/app/types/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

interface LoginFormProps {
  isAdmin?: boolean;
}

export function LoginForm({ isAdmin = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Sign in failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Fetch user role from database by email
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userRes = await fetch(
        `/api/user-role?email=${encodeURIComponent(data.email)}`,
      );
      const userData = await userRes.json();

      console.log("User data from API:", userData);

      if (!userRes.ok) {
        console.error("Failed to fetch user role");
        setError("Failed to determine user access level. Please try again.");
        setIsLoading(false);
        return;
      }

      const userRole = userData.role;
      console.log("User role:", userRole);

      // Determine redirect URL based on role and callback
      let redirectUrl = "/";

      if (isAdmin) {
        if (userRole !== "admin" && userRole !== "super-admin") {
          setError("Admin access required. Please contact your administrator.");
          setIsLoading(false);
          return;
        }
        redirectUrl = "/admin/dashboard";
        console.log(
          "Admin/Super-admin accessing admin form, redirecting to:",
          redirectUrl,
        );
      } else {
        // For regular login, check callback URL first
        if (callbackUrl) {
          // If user has admin role but is on regular login with callback, respect the callback
          redirectUrl = callbackUrl;
          console.log("Using callback URL:", redirectUrl);
        } else if (userRole === "super-admin" || userRole === "admin") {
          redirectUrl = "/admin/dashboard";
          console.log(
            "Admin/Super-admin accessing regular form, redirecting to:",
            redirectUrl,
          );
        } else {
          redirectUrl = "/";
          console.log("Regular user, redirecting to:", redirectUrl);
        }
      }

      // Use window.location for more reliable redirect after auth
      console.log("Final redirect to:", redirectUrl);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (isAdmin) {
        setError("Admins must use email and password.");
        setIsLoading(false);
        return;
      }

      const result = await signIn("google", {
        redirect: false,
      });

      if (!result?.ok) {
        setError("Google sign in failed. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo - Click to go home */}
      <div className="text-center">
        <Logo href="/" />
      </div>
      <h2 className="text-[32px] font-bold text-card-foreground text-center">
        Login
      </h2>

      {/* Form Title */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isAdmin
            ? "Login to your admin account"
            : "Login in to your account or create a new one"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            disabled={isLoading}
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isAdmin && (
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary/90"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      {/* Divider */}
      {!isAdmin && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:text-primary/90"
            >
              Sign up here
            </Link>
          </p>
        </>
      )}

      {/* Admin Sign Up Note */}
      {isAdmin && (
        <p className="text-center text-xs text-gray-500">
          If you need admin access, please contact your administrator.
        </p>
      )}
    </div>
  );
}
