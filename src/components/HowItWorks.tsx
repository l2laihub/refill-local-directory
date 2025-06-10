import { HOW_IT_WORKS_STEPS } from '../lib/constants';

const HowItWorks = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Shopping sustainably has never been easier
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <div key={index} className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-sage-100 to-sage-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-sage-200 group-hover:to-sage-300 transition-all duration-200 shadow-lg">
              <step.icon className="w-10 h-10 text-sage-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;