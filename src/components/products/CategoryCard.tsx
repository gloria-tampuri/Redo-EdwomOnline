'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  _id: string;
  name: string;
  image?: string;
  icon?: string;
  color?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ _id, name, image, icon, color }) => {
  return (
    <Link href={`/categories/${_id}`}>
      <div className="flex flex-col items-center text-center group cursor-pointer">
        {/* Category Image/Icon Container */}
        <div
          className="relative w-full aspect-square rounded-lg mb-3 flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow duration-200 bg-gray-100"
          style={{ backgroundColor: color ? `${color}20` : undefined }}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <span className="text-4xl">{icon || '🍎'}</span>
          )}
        </div>

        {/* Category Name */}
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#556B2F] transition-colors line-clamp-2">
          {name}
        </h3>
      </div>
    </Link>
  );
};
