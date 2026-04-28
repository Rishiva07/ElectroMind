import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
