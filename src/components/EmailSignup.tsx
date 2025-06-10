import { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here you would integrate with your email service
      console.log('Email submitted:', email);
    }
  };

  return (
    <section id="signup" className="py-20 bg-gradient-to-br from-sage-500 to-sage-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Be the First to Know When We Launch
        </h2>
        <p className="text-xl text-sage-100 mb-12 leading-relaxed">
          Get early access and help us build the ultimate zero-waste shopping directory
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/25"
                required
              />
              <Button
                type="submit"
                className="px-8 py-4 bg-white text-sage-600 font-semibold rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join Waitlist
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Thanks for joining!</h3>
            <p className="text-sage-100">
              We'll send you launch updates—no spam, promise.
            </p>
          </div>
        )}

        <p className="text-sage-200 text-sm mt-6">
          We'll only send launch updates — no spam.
        </p>
      </div>
    </section>
  );
};

export default EmailSignup;