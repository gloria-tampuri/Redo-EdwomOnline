import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fresh Groceries Delivered to Your Doorstep
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Shop from the comfort of your home and get fresh, quality groceries delivered fast. 
              Browse categories, discover meal packages, and enjoy convenient home delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition text-center"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg h-96 flex items-center justify-center">
              <div className="text-6xl">🛒🥗🥕🍎</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Edwom Online?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Fresh groceries delivered right to your doorstep</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wide Selection</h3>
              <p className="text-gray-600">Browse thousands of fresh products daily</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Meal Packages</h3>
              <p className="text-gray-600">Pre-curated ingredients with cooking guides</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Fresh products and exceptional service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['Fruits', 'Vegetables', 'Meats', 'Dairy', 'Spices', 'Grains', 'Beverages', 'Snacks'].map((category) => (
            <div
              key={category}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center cursor-pointer"
            >
              <div className="text-3xl mb-2">
                {category === 'Fruits' && '🍎'}
                {category === 'Vegetables' && '🥕'}
                {category === 'Meats' && '🍗'}
                {category === 'Dairy' && '🥛'}
                {category === 'Spices' && '🌶️'}
                {category === 'Grains' && '🌾'}
                {category === 'Beverages' && '☕'}
                {category === 'Snacks' && '🍿'}
              </div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of customers already enjoying fresh groceries delivered to their homes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Are you an admin?</p>
          <Link
            href="/auth/admin-login"
            className="inline-block px-6 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Admin Login
          </Link>
        </div>
      </section>
    </main>
  );
}
