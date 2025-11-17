import React from 'react';
import { BarChart3, TrendingDown, Award, Globe } from 'lucide-react';

const SustainabilityDashboard: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Sustainability Impact</h2>
          <p className="text-gray-600">Track your environmental impact and see how your choices make a difference.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">-23%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">2.4 kg</h3>
            <p className="text-gray-600 text-sm">CO2 Saved This Month</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">Top 10%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">8.7</h3>
            <p className="text-gray-600 text-sm">Avg EarthScore</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-purple-600 font-medium">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-gray-600 text-sm">Sustainable Purchases</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-orange-600 font-medium">5 Trees</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">142</h3>
            <p className="text-gray-600 text-sm">Impact Points</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityDashboard;