import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'md',
}) => {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
