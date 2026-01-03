'use client';

import { BRAND_COLORS } from '../constants';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  children?: React.ReactNode;
}

export default function ActionButton({
  onClick,
  disabled = false,
  title,
  icon,
  variant = 'default',
  children,
}: ActionButtonProps) {
  const variants = {
    default: `${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover}`,
    primary: BRAND_COLORS.btnPrimary,
    success: 'bg-green-500 hover:bg-green-400 text-white',
    danger: 'text-red-400 hover:bg-red-500/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}
