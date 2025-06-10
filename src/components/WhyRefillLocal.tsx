import { BENEFITS } from '../lib/constants';

const WhyRefillLocal = () => (
  <section className="py-20 bg-gradient-to-b from-sage-50 to-warm-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why RefillLocal?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          More than just a directory—we're building a sustainable community
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((benefit, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:transform hover:scale-105 border border-white/50"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center mb-4">
              <benefit.icon className="w-6 h-6 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyRefillLocal;