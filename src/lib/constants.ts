import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Leaf, 
  Globe, 
  Store, 
  Users, 
  Recycle 
} from 'lucide-react';
import type { Benefit, HowItWorksStep } from './types';

// Launch cities based on PRD
export const CITIES = [
  'Portland',
  'Austin',
  'San Francisco',
  'New York',
  'Seattle',
  'Denver',
  'Boulder',
  'Asheville',
  'Burlington',
  'Minneapolis'
];

// Color theme (extended from Tailwind config)
export const COLORS = {
  sage: {
    50: '#f4f7f4',
    100: '#e6ede6',
    200: '#d1ddd0',
    300: '#afc3ad',
    400: '#87a485',
    500: '#678a65',
    600: '#506f4e',
    700: '#405940',
    800: '#374b37',
    900: '#2e3e2e',
  },
  warm: {
    50: '#faf8f2',
    100: '#f2edd8',
    200: '#e6d9b0',
    300: '#d8c188',
    400: '#cba96b',
    500: '#c2985d',
    600: '#ad7c4c',
    700: '#8f6241',
    800: '#76503d',
    900: '#624337',
  }
};

// How It Works steps for the homepage
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Search,
    title: "Find Stores Near You",
    description: "Search for refill and zero-waste stores in your city. We're starting with 10 eco-friendly cities and growing."
  },
  {
    icon: ShoppingBag,
    title: "Know What to Bring",
    description: "Each store listing tells you exactly what containers to bring and what products are available for refill."
  },
  {
    icon: Leaf,
    title: "Shop Package-Free",
    description: "Visit the store, refill your containers, and enjoy products without the single-use packaging waste."
  }
];

// Benefits of using RefillLocal for the homepage
export const BENEFITS: Benefit[] = [
  {
    icon: Globe,
    title: "Reduce Plastic Waste",
    description: "By shopping at refill stores, you help keep single-use plastics out of our oceans and landfills."
  },
  {
    icon: Store,
    title: "Support Local Businesses",
    description: "Refill stores are often small, locally-owned businesses that contribute to the local economy."
  },
  {
    icon: Users,
    title: "Join a Community",
    description: "Connect with other environmentally conscious shoppers and share your sustainable journey."
  },
  {
    icon: Recycle,
    title: "Verified Information",
    description: "Our directory is maintained and verified by our team and community contributions."
  }
];
