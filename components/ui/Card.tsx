import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'subtle' | 'success' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  variant = 'default',
  ...props
}) => {
  const base =
    'rounded-xl bg-white transition-all duration-200';

  const borders: Record<string, string> = {
    default: 'border border-gray-200',
    subtle: 'border border-gray-100',
    success: 'border border-green-200',
    danger: 'border border-red-200',
  };

  const hoverStyles =
    'hover:shadow-md';

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
        'px-6 py-4 border-b border-gray-200',
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
        'px-6 py-4 text-gray-800',
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
        'px-6 py-4 border-t border-gray-200 bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};