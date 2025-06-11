import { Globe } from 'lucide-react';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div 
      className={`bg-sage-400 rounded-full flex items-center justify-center ${
        size === 'small' 
          ? 'w-8 h-8' 
          : size === 'large' 
            ? 'w-16 h-16' 
            : 'w-12 h-12'
      }`}
    >
      <Globe 
        className={`text-white ${
          size === 'small' 
            ? 'w-4 h-4' 
            : size === 'large' 
              ? 'w-8 h-8' 
              : 'w-6 h-6'
        }`} 
      />
    </div>
    <span 
      className={`font-bold text-gray-800 ${
        size === 'small' 
          ? 'text-lg' 
          : size === 'large' 
            ? 'text-3xl' 
            : 'text-2xl'
      }`}
    >
      RefillLocal
    </span>
  </div>
);

export default Logo;
