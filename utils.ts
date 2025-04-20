import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getPlanQuota(tier: string): number {
  switch (tier) {
    case 'pro':
      return 30;
    case 'enterprise':
      return 100;
    case 'free':
    default:
      return 0;
  }
}

export function getPlanPrice(tier: string): number {
  switch (tier) {
    case 'pro':
      return 49;
    case 'enterprise':
      return 149;
    case 'free':
    default:
      return 0;
  }
}
