import { CITIES } from '../lib/constants';
import Button from './Button';

const ComingSoon = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Coming Soon</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're launching in these cities first
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CITIES.map((city, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-br from-warm-100 to-warm-200 p-4 rounded-xl text-center group hover:from-warm-200 hover:to-warm-300 transition-all duration-200 cursor-pointer"
          >
            <div className="absolute -top-2 -right-2 bg-sage-400 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              Soon
            </div>
            <p className="font-medium text-gray-700 text-sm">{city}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">Don't see your city?</p>
        <Button className="text-sage-600 font-semibold hover:text-sage-700 transition-colors">
          Request My City →
        </Button>
      </div>
    </div>
  </section>
);

export default ComingSoon;