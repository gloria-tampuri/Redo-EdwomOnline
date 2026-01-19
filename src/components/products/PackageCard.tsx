"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface PackageCardProps {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  image?: string;
  items?: Array<{ name: string; quantity: number; unit: string }>;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  _id,
  name,
  description,
  price,
  discount = 0,
  image,
  items = [],
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const discountedPrice = price * (1 - discount / 100);

  const handleAddPackage = () => {
    addItem({
      _id,
      name,
      price: discountedPrice,
      quantity: 1,
      unit: "package",
      image,
      discount,
      type: "package",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Image Container */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            placeholder="empty"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            🍱
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-[#00CC4D] text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
            Save {discount}%
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 h-80">
        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

        {/* Items Tags - Fixed Height */}
        <div className="mb-4 h-8 flex flex-wrap gap-2 items-start content-start">
          {items.length > 0 ? (
            <>
              {items.slice(0, 2).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md whitespace-nowrap"
                >
                  {item.name}
                </span>
              ))}
              {items.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
                  +{items.length - 2} More
                </span>
              )}
            </>
          ) : null}
        </div>

        {/* Price Section */}
        <div className="mb-4 mt-auto">
          <span className="text-2xl font-bold text-gray-900">
            GHS {discountedPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through ml-2">
              GHS {price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href={`/packages/${_id}`} className="flex-1">
            <button className="w-full bg-[#F1F5F9] hover:border-gray-400  font-semibold py-2 px-2 rounded transition-colors duration-200">
              See Details
            </button>
          </Link>
          <button
            onClick={handleAddPackage}
            className="flex-1 bg-[#556B2F] hover:bg-[#4a5c2a] text-white font-semibold py-2 px-2 rounded transition-colors duration-200"
          >
            {isAdded ? "✓ Added" : "Add Package"}
          </button>
        </div>
      </div>
    </div>
  );
};
