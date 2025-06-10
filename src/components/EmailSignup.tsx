import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { waitlistServices } from '../lib/services';
import { CITIES } from '../lib/constants';
import analytics from '../lib/analytics';
import emailService from '../lib/email';

const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    setError('');

    if (value.trim()) {
      const filteredCities = CITIES.filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredCities);
      setShowSuggestions(filteredCities.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (selectedCity: string) => {
    setCity(selectedCity);
    setShowSuggestions(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!city.trim()) {
      setError('Please enter your city');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await waitlistServices.addToWaitlist(email, city);
      
      if (success) {
        // Track the waitlist signup with analytics
        analytics.trackWaitlistSignup(city);
        
        // Send confirmation email
        await emailService.sendWaitlistConfirmationEmail(email, city);
        
        setIsSubmitted(true);
        // Reset the form
        setEmail('');
        setCity('');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting to waitlist:', err);
      setError('Failed to join the waitlist. Please try again later.');
    } finally {
      setIsSubmitting(false);
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
          <form onSubmit={handleEmailSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/25"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="relative">
                <Input
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  placeholder="Your city (e.g., Portland, San Francisco)"
                  className="w-full px-6 py-4 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/25"
                  required
                  disabled={isSubmitting}
                />
                
                {showSuggestions && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-4 py-2 cursor-pointer hover:bg-sage-50 text-left text-gray-700"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-white bg-red-500/20 rounded-full px-4 py-2 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button
                type="submit"
                className="px-8 py-4 bg-white text-sage-600 font-semibold rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-70 disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Join Waitlist'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Thanks for joining our waitlist!</h3>
            <p className="text-sage-100 mb-4">
              We'll notify you when RefillLocal launches in your area.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="text-sage-600 bg-white/90 hover:bg-white px-6 py-2 rounded-full text-sm font-medium"
            >
              Add another email
            </Button>
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
