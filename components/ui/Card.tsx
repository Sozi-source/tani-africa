import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={twMerge(
        'rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200',
        hover && 'hover:shadow-lg hover:border-primary-200 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('border-b border-gray-200 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('border-t border-gray-200 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};