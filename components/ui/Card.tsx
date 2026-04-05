import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'subtle' | 'success' | 'danger' | 'maroon' | 'teal';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  variant = 'default',
  ...props
}) => {
  const base = 'rounded-xl bg-white transition-all duration-200';

  const borders: Record<string, string> = {
    default: 'border border-gray-200',
    subtle: 'border border-gray-100',
    success: 'border-l-4 border-l-green-500 border border-gray-200',
    danger: 'border-l-4 border-l-red-500 border border-gray-200',
    maroon: 'border-l-4 border-l-maroon-600 border border-gray-200',
    teal: 'border-l-4 border-l-teal-600 border border-gray-200',
  };

  const hoverStyles = 'hover:shadow-lg hover:-translate-y-0.5';

  return (
    <div
      className={twMerge(
        base,
        borders[variant],
        hover && hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardSectionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardSectionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4 text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardSectionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4 border-t border-gray-200 bg-maroon-50/30 rounded-b-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};