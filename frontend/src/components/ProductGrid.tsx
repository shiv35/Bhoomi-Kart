import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Filter, Loader } from 'lucide-react';
import ProductDetailDialog from './ProductDetailDialog';

const ProductGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('earthscore');
  const { products, loading, error } = useProducts();
  const [selected, setSelected] = useState<any | null>(null);

  const categories = ['all', 'electronics', 'clothing', 'home', 'beauty'];

  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'earthscore':
          return b.earthScore - a.earthScore;
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <section className="py-16 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading sustainable products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading products: {error}</p>
            <p className="text-gray-600">Showing cached products instead.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">Sustainable Products</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              <option value="earthscore">Best EarthScore</option>
              <option value="price">Price: Low to High</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => setSelected(product)}
              style={{ cursor: 'pointer' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found for the selected category.</p>
          </div>
        )}

        {selected && (
          <ProductDetailDialog
            open={!!selected}
            onClose={() => setSelected(null)}
            product={{
              product_name: selected.product_name || selected.name,
              category: selected.category,
              price: selected.price,
              manufacturing_emissions_gco2e: selected.manufacturing_emissions_gco2e ?? 5000,
              transport_distance_km: selected.transport_distance_km ?? 100,
              recyclability_percent: selected.recyclability_percent ?? 50,
              biodegradability_score: selected.biodegradability_score ?? 3,
              is_fair_trade: selected.is_fair_trade ?? true,
              supply_chain_transparency_score: selected.supply_chain_transparency_score ?? 3,
              durability_rating: selected.durability_rating ?? 3,
              repairability_index: selected.repairability_index ?? 3,
              earth_score: selected.earth_score ?? selected.earthScore ?? 70,
            }}
          />
        )}
      </div>
    </section>
  );
};

export default ProductGrid;