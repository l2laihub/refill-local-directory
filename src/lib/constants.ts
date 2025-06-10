import {
  Leaf,
  Search,
  MapPin,
  ShoppingBag,
  Recycle,
  Users,
  Heart,
  Plus,
  Mail,
  Instagram,
  Globe,
} from 'lucide-react';
import type { Benefit, HowItWorksStep } from './types';

export const CITIES: readonly string[] = [
  'Portland, OR',
  'Austin, TX',
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Denver, CO',
  'Boulder, CO',
  'Asheville, NC',
  'Burlington, VT',
  'Minneapolis, MN',
];

export const BENEFITS: readonly Benefit[] = [
  {
    icon: Recycle,
    title: 'Reduce Plastic Waste',
    description: 'Find stores that help you shop without single-use packaging',
  },
  {
    icon: Heart,
    title: 'Support Local Businesses',
    description: 'Discover and support eco-conscious shops in your community',
  },
  {
    icon: Users,
    title: 'Community-Powered',
    description: 'Free directory built by and for conscious consumers',
  },
  {
    icon: Plus,
    title: 'Always Growing',
    description: 'Add your favorite refill shop and help others discover it',
  },
];

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    icon: Search,
    title: 'Search Your City',
    description: 'Enter your location to find nearby refill and zero-waste stores',
  },
  {
    icon: MapPin,
    title: 'Explore Stores',
    description: 'Browse detailed listings with hours, specialties, and what to bring',
  },
  {
    icon: ShoppingBag,
    title: 'Shop Consciously',
    description: 'Visit with your own containers and shop plastic-free',
  },
];

export { Leaf, Search, MapPin, ShoppingBag, Recycle, Users, Heart, Plus, Mail, Instagram, Globe };