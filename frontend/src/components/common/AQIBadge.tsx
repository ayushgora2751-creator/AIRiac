import React from 'react';
import { NAQICategory } from '../../types/aqi';

export interface NAQIInfo {
  category: NAQICategory;
  bg: string;
  text: string;
  border: string;
  hex: string;
  description: string;
}

export const getNAQIInfo = (aqi: number): NAQIInfo => {
  if (aqi <= 50) {
    return {
      category: 'Good',
      bg: 'bg-[#00B050]',
      text: 'text-white',
      border: 'border-[#00B050]',
      hex: '#00B050',
      description: 'Minimal impact',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      bg: 'bg-[#92D050]',
      text: 'text-gray-900',
      border: 'border-[#92D050]',
      hex: '#92D050',
      description: 'Minor breathing discomfort to sensitive people',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'Moderate',
      bg: 'bg-[#E5B800]',
      text: 'text-gray-900',
      border: 'border-[#E5B800]',
      hex: '#E5B800',
      description: 'Breathing discomfort to people with lung, heart disease, children and older adults',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'Poor',
      bg: 'bg-[#FF7C80]',
      text: 'text-gray-900',
      border: 'border-[#FF7C80]',
      hex: '#FF7C80',
      description: 'Breathing discomfort to most people on prolonged exposure',
    };
  }
  if (aqi <= 400) {
    return {
      category: 'Very Poor',
      bg: 'bg-[#D32F2F]',
      text: 'text-white',
      border: 'border-[#D32F2F]',
      hex: '#D32F2F',
      description: 'Respiratory illness to the people on prolonged exposure',
    };
  }
  return {
    category: 'Severe',
    bg: 'bg-[#7B1FA2]',
    text: 'text-white',
    border: 'border-[#7B1FA2]',
    hex: '#7B1FA2',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
  };
};

export interface AQIBadgeProps {
  aqi: number;
  category?: NAQICategory;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCategory?: boolean;
  className?: string;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({
  aqi,
  category,
  size = 'md',
  showCategory = true,
  className = '',
}) => {
  const info = getNAQIInfo(aqi);
  const displayCategory = category || info.category;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
    lg: 'px-4 py-2 text-base font-bold',
    xl: 'px-6 py-3 text-2xl font-extrabold',
  };

  return (
    <div
      data-testid="aqi-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-transform ${info.bg} ${info.text} ${info.border} ${sizeClasses[size]} ${className}`}
    >
      <span data-testid="aqi-value" className="font-mono">
        {Math.round(aqi)}
      </span>
      {showCategory && (
        <span data-testid="aqi-category" className="opacity-95">
          • {displayCategory}
        </span>
      )}
    </div>
  );
};
