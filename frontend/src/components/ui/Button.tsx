import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

type CustomVariant = 'primary' | 'secondary' | 'outlined' | 'text';
type CustomSize = 'small' | 'medium' | 'large';

// Completely omit the 'variant' and 'size' props from MuiButtonProps
export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  isLoading?: boolean;
  size?: CustomSize;
  variant?: CustomVariant;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  size = 'medium',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  ...props
}) => {
  // Map our custom variants to MUI variants and classes
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return {
          variant: 'contained' as const,
          className: 'bg-primary-600 hover:bg-primary-700 text-white',
        };
      case 'secondary':
        return {
          variant: 'contained' as const,
          className: 'bg-white text-primary-600 hover:bg-gray-100',
        };
      case 'outlined':
        return {
          variant: 'outlined' as const,
          className: 'border-primary-600 text-primary-600 hover:bg-primary-50',
        };
      case 'text':
        return {
          variant: 'text' as const,
          className: 'text-primary-600 hover:bg-primary-50',
        };
      default:
        return {
          variant: 'contained' as const,
          className: 'bg-primary-600 hover:bg-primary-700 text-white',
        };
    }
  };

  // Map our size to MUI size and additional classes
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-sm py-1 px-3';
      case 'large':
        return 'text-lg py-3 px-6';
      default:
        return 'text-base py-2 px-4';
    }
  };

  const { variant: muiVariant, className } = getVariantProps();
  const sizeClass = getSizeClass();

  return (
    <MuiButton
      variant={muiVariant}
      disabled={disabled || isLoading}
      fullWidth={fullWidth}
      startIcon={!isLoading && startIcon}
      endIcon={!isLoading && endIcon}
      onClick={onClick}
      className={`rounded-md font-medium transition-all duration-200 ${sizeClass} ${className} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${isLoading ? 'relative' : ''}`}
      {...props}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          className="absolute"
          sx={{
            color: variant === 'primary' ? 'white' : 'primary.main',
          }}
        />
      )}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
    </MuiButton>
  );
};

export default Button; 