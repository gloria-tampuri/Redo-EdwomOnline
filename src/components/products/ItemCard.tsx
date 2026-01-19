"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ItemCardProps {
  _id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  discount?: number;
  status?: string;
  type?: "item" | "package";
}

export const ItemCard: React.FC<ItemCardProps> = ({
  _id,
  name,
  price,
  unit,
  image,
  discount = 0,
  status = "In Stock",
  type = "item",
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const discountedPrice = price * (1 - discount / 100);
  const isOutOfStock = status === "Out of Stock";

  const handleAddToCart = () => {
    addItem({
      _id,
      name,
      price: discountedPrice,
      quantity,
      unit,
      image,
      discount,
      type,
    });
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="flex flex-col bg-white transition-shadow duration-200 overflow-hidden group">
      {/* Image Container */}
      <div className="relative h-[200px] w-full aspect-square bg-gray-100 overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            🥗
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-[#556B2F] text-white px-3 py-1 rounded-full text-sm font-semibold">
            Save {discount}%
          </div>
        )}

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 text-[#12170AB2]">
        {/* Product Name */}
        <h3 className="text-base font-semibold text-[#12170AB2] mb-1">{name}</h3>

        {/* Description/Unit */}
        <p className="text-sm text-gray-500 mb-4">per {unit}</p>

        {/* Price Section */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-[#12170AB2]">
            GHS {discountedPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through ml-2">
              GHS {price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quantity Selector & Add to Cart Button */}
        {!isOutOfStock && (
          <div className="flex gap-3 items-center mt-auto justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:hover:bg-transparent text-gray-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center text-base font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-[#4a5c2a] text-white font-semibold py-2 px-2 rounded-md transition-colors duration-200 "
            >
              Add ₵{(discountedPrice * quantity).toFixed(0)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
