import { Globe } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-12 h-12 bg-sage-400 rounded-full flex items-center justify-center">
      <Globe className="w-6 h-6 text-white" />
    </div>
    <span className="text-2xl font-bold text-gray-800">RefillLocal</span>
  </div>
);

export default Logo;