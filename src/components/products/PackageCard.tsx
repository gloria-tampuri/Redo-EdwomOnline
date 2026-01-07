'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

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
      unit: 'package',
      image,
      discount,
      type: 'package',
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Image Container */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
      <div className="flex flex-col flex-1 p-4">
        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>

        {/* Items List */}
        {items.length > 0 && (
          <div className="mb-3 text-xs text-gray-500 space-y-1">
            {items.slice(0, 3).map((item, idx) => (
              <p key={idx} className="line-clamp-1">
                • {item.quantity} {item.unit} {item.name}
              </p>
            ))}
            {items.length > 3 && <p className="text-[10px]">+ {items.length - 3} more items</p>}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-lg font-bold text-gray-900">GHS {discountedPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">GHS {price.toFixed(2)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddPackage}
            className={`flex-1 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
              isAdded
                ? 'bg-[#00CC4D] text-gray-900'
                : 'bg-[#556B2F] hover:bg-[#4a5c2a] text-white'
            }`}
          >
            {isAdded ? '✓ Added' : 'Add Package'}
          </button>
          <button className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm">
            See Details
          </button>
        </div>
      </div>
    </div>
  );
};
