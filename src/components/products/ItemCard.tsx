'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ItemCardProps {
  _id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  discount?: number;
  status?: string;
  type?: 'item' | 'package';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  _id,
  name,
  price,
  unit,
  image,
  discount = 0,
  status = 'In Stock',
  type = 'item',
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const discountedPrice = price * (1 - discount / 100);
  const isOutOfStock = status === 'Out of Stock';

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
    <div className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
      <div className="flex flex-col flex-1 p-3">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 h-10">
          {name}
        </h3>

        {/* Unit */}
        <p className="text-xs text-gray-500 mb-3">{unit}</p>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">GHS {discountedPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">GHS {price.toFixed(2)}</span>
          )}
        </div>

        {/* Quantity Selector & Add to Cart Button */}
        {!isOutOfStock && (
          <div className="flex gap-2 items-center">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-1.5 hover:bg-gray-100 disabled:hover:bg-transparent text-gray-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#556B2F] hover:bg-[#4a5c2a] text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
