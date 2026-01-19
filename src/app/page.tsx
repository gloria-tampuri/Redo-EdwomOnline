"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { usePackages } from "@/hooks/usePackages";
import { ItemCard } from "@/components/products/ItemCard";
import { CategoryCard } from "@/components/products/CategoryCard";
import { PackageCard } from "@/components/products/PackageCard";
import { Carousel } from "@/components/products/Carousel";
import { HeroSlider } from "@/components/products/HeroSlider";

const heroSlides = [
  {
    image: "/assets/Hero2.jpg",
    title: "Fresh Groceries, Delivered to Your Doorstep",
    subtitle:
      "Shop your local essentials from the comfort of your home and get them delivered fast.",
    primaryCta: { text: "Start Shopping", href: "/auth/signup" },
    secondaryCta: { text: "View Meal Packages", href: "/packages" },
  },
  {
    image: "/assets/Hero1.jpg",
    title: "Quality Products from Local Markets",
    subtitle:
      "We source the freshest produce and essentials from trusted local vendors.",
    primaryCta: { text: "Explore Categories", href: "/categories" },
    secondaryCta: { text: "Learn More", href: "/about" },
  },
  {
    image: "/assets/Hero3.jpg",
    title: "Convenient & Fast Delivery",
    subtitle:
      "Get your groceries delivered right to your door. Fresh, fast, and reliable.",
    primaryCta: { text: "Order Now", href: "/auth/signup" },
    secondaryCta: { text: "Sign In", href: "/auth/login" },
  },
];

export default function Home() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { items, isLoading: itemsLoading } = useItems();
  const { packages, isLoading: packagesLoading } = usePackages();

  // Filter active categories and items
  const activeCategories = categories; // Show all categories on landing page
  const inStockItems = items.filter((item) => item.status !== "Out of Stock");
  const activePackages = packages.filter((pkg) => pkg.status === "active");

  console.log("Active categories on homepage:", activeCategories);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Slider Section */}
      <HeroSlider slides={heroSlides} autoSlideInterval={6000} />

      {/* Categories Section */}
      {!categoriesLoading && activeCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Categories
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {activeCategories.map(
              (category) =>
                category._id && (
                  <CategoryCard
                    key={category._id}
                    _id={category._id}
                    name={category.name}
                    image={category.image}
                    icon={category.icon}
                    color={category.color}
                  />
                )
            )}
          </div>
        </section>
      )}

      {/* Promotional Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Carousel itemsPerView={2}>
          <div className="h-40 md:h-48 rounded-lg bg-gradient-to-r from-[#556B2F] to-[#7CB342] flex items-center justify-center text-white text-center p-6 cursor-pointer hover:shadow-lg transition">
            <div>
              <h3 className="text-2xl font-bold mb-2">Special Offers</h3>
              <p className="text-sm">Check out exclusive deals this week</p>
            </div>
          </div>
          <div className="h-40 md:h-48 rounded-lg bg-gradient-to-r from-[#00CC4D] to-[#00b340] flex items-center justify-center text-gray-900 text-center p-6 cursor-pointer hover:shadow-lg transition">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free Delivery</h3>
              <p className="text-sm">On orders above GHS 100</p>
            </div>
          </div>
        </Carousel>
      </section>

      {/* Popular Groceries Section */}
      {!itemsLoading && inStockItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Popular Groceries
            </h2>
            <Link
              href="#"
              className="text-[#556B2F] font-semibold hover:text-[#4a5c2a] transition flex items-center gap-2"
            >
              View All Groceries →
            </Link>
          </div>

          <Carousel itemsPerView={4}>
            {inStockItems.map((item) => (
              <ItemCard
                key={item._id}
                _id={item._id}
                name={item.name}
                price={item.price}
                unit={item.unit}
                image={item.image}
                discount={item.discount}
                status={item.status}
                type="item"
              />
            ))}
          </Carousel>
        </section>
      )}

      {/* Meal Packages Section */}
      {!packagesLoading && activePackages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Meal Packages
            </h2>
            <Link
              href="#"
              className="text-[#556B2F] font-semibold hover:text-[#4a5c2a] transition flex items-center gap-2"
            >
              View All Packages →
            </Link>
          </div>

          <Carousel itemsPerView={4}>
            {activePackages.map((pkg) => (
              <PackageCard
                key={pkg._id || ""}
                _id={pkg._id || ""}
                name={pkg.name}
                description={pkg.description}
                price={pkg.price}
                discount={pkg.discount}
                image={pkg.image}
                items={pkg.items as any}
              />
            ))}
          </Carousel>
        </section>
      )}

      {/* CTA Section */}
      <section className=" bg-[#556B2F33] py-16 md:py-24 my-12 md:my-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg mb-8 text-[#12170AB2]">
            Join thousands of satisfied customers who trust us for their
            groceries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-[#00b340] transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
