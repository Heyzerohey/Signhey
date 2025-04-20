import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('Missing Stripe public key');
}

export const stripePromise = loadStripe(stripePublicKey);

export const getTierDetails = (tier: string) => {
  switch (tier) {
    case 'pro':
      return {
        name: 'Pro',
        price: 49,
        features: [
          'Everything in Free plan',
          '30 LIVE mode documents',
          'Advanced document templates',
          'Custom branding',
          'Priority support'
        ],
        quota: 30,
        recommended: true
      };
    case 'enterprise':
      return {
        name: 'Enterprise',
        price: 149,
        features: [
          'Everything in Pro plan',
          '100 LIVE mode documents',
          'API access',
          'Advanced security features',
          'Dedicated account manager'
        ],
        quota: 100,
        recommended: false
      };
    case 'free':
    default:
      return {
        name: 'Free',
        price: 0,
        features: [
          'Document storage',
          'Basic document templates',
          'Preview mode only (unlimited)',
          'Email support',
          '0 LIVE mode documents'
        ],
        quota: 0,
        recommended: false
      };
  }
};
