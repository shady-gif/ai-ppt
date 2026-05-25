import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 24 }) => {
  // Safe lookup with robust fallback
  const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '');
  
  // Try direct lookup with exact case
  let IconComponent = (Icons as any)[name];
  
  // Try case-insensitive lookup if direct fails
  if (!IconComponent) {
    const keys = Object.keys(Icons);
    const matchedKey = keys.find(key => key.toLowerCase() === normalizedName.toLowerCase());
    if (matchedKey) {
      IconComponent = (Icons as any)[matchedKey];
    }
  }

  // Fallback icon if not found
  if (!IconComponent) {
    IconComponent = Icons.Sparkles; // beautiful defaults
  }

  return <IconComponent className={className} size={size} />;
};

export default LucideIcon;
