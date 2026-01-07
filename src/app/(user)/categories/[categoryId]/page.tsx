'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ItemCard } from '@/components/products/ItemCard';
import { ArrowLeft } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  discount?: number;
  status: string;
  category?: {
    name: string;
    color?: string;
  };
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching items for categoryId:', categoryId);
        const response = await fetch(`/api/items/by-category?categoryId=${categoryId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        setItems(data.items);
        
        // Set category name from first item if available
        if (data.items.length > 0 && data.items[0].category) {
          setCategoryName(data.items[0].category.name);
        }
      } catch (err) {
        console.error('Error fetching category items:', err);
        setError('Failed to load items for this category');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryItems();
    }
  }, [categoryId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading items...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/" className="text-[#556B2F] font-semibold hover:text-[#4a5c2a]">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const inStockItems = items.filter((item) => item.status !== 'Out of Stock');

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#556B2F] font-semibold hover:text-[#4a5c2a] transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Category Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {categoryName || 'Category Items'}
          </h1>
          <p className="text-gray-600">
            {inStockItems.length} {inStockItems.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {/* Items Grid */}
        {inStockItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No items available in this category</p>
              <Link href="/" className="text-[#556B2F] font-semibold hover:text-[#4a5c2a]">
                Browse Other Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
