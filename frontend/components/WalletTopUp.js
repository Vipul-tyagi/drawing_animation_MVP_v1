import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { DollarSign, Loader2 } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const topUpAmounts = [
  { amount: 5, label: '$5' },
  { amount: 10, label: '$10' },
  { amount: 20, label: '$20' },
  { amount: 50, label: '$50' },
];

export default function WalletTopUp({ currentBalance, onTopUpSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const haptic = useHapticFeedback();

  const handleTopUp = async (amount) => {
    haptic.light();
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('You must be logged in to top up your wallet.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = data.url; // Stripe session URL
      } else {
        setError(data.error || 'Failed to create checkout session.');
      }
    } catch (err) {
      console.error('Error during top-up process:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card p-6 border-4 border-blue-300/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-6 h-6 text-blue-500" />
        <h3 className="text-title text-neutral-800 dark:text-neutral-200">
          Your Wallet Balance: <span className="font-bold text-blue-500">${currentBalance !== undefined ? currentBalance.toFixed(2) : 'Loading...'}</span>
        </h3>
      </div>

      <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
        Add funds to your wallet to create more magical drawings! Each creation costs $0.50.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {topUpAmounts.map((item) => (
          <button
            key={item.amount}
            onClick={() => handleTopUp(item.amount)}
            className="btn-secondary flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-400/50 text-blue-600 dark:text-blue-400 font-bold text-lg"
            disabled={loading}
          >
            <DollarSign className="w-5 h-5 mb-1" />
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center text-blue-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Redirecting to Stripe...
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-error/20 border-2 border-error/30 rounded-lg text-error font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
