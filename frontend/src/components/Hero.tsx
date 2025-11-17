import React from 'react';
import { Leaf, Award, Truck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Scroll to products section
    const productsSection = document.querySelector('#products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = (feature: string) => {
    // Navigate to specific feature pages
    switch(feature) {
      case 'EarthScore Ratings':
        navigate(ROUTES.EARTHSCORE);
        break;
      case 'AI Optimization':
        navigate(ROUTES.AI_OPTIMIZATION);
        break;
      case 'Carbon Tracking':
        navigate(ROUTES.CARBON_TRACKING);
        break;
      default:
        break;
    }
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Shop Sustainably with
            <span className="text-green-600 block">EarthScore Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our AI-powered platform groups your orders by environmental impact, 
            calculates CO2 footprints, and helps you make eco-friendly choices.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Start Shopping Green</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group cursor-pointer" onClick={() => handleLearnMore('EarthScore Ratings')}>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">EarthScore Ratings</h3>
            <p className="text-gray-600">Every product rated for environmental impact with detailed sustainability metrics.</p>
          </div>
          <div className="text-center group cursor-pointer" onClick={() => handleLearnMore('AI Optimization')}>
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">AI Optimization</h3>
            <p className="text-gray-600">Smart algorithms group orders to minimize carbon footprint and maximize efficiency.</p>
          </div>
          <div className="text-center group cursor-pointer" onClick={() => handleLearnMore('Carbon Tracking')}>
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Carbon Tracking</h3>
            <p className="text-gray-600">Real-time CO2 calculations for your purchases and shipping methods.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;