"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useApp } from "../../context/app-context";
import { useTheme } from "../../context/theme-context";
import { subscriptionService } from "../../services/api";
import QuantitySelector from './QuantitySelector';
import styles from "./StripePaymentForm.module.scss";

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

if (!stripePublishableKey) {
  console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const BASE_PRICE_CENTS = 20000; // $200.00

interface StripePaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user, loading: userLoading } = useApp();
  const { mode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (userLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!stripePublishableKey || !stripePriceId) {
    return (
      <div className={`${styles.paymentForm} ${mode === 'dark' ? styles.darkTheme : ''}`}>
        <div className={styles.errorMessage}>
          <h3>Payment System Configuration Error</h3>
          <p>Stripe is not properly configured. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !user) {
      setError("Payment system not ready. Please log in and try again.");
      return;
    }
    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card information not found.");
      setLoading(false);
      return;
    }

    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: user.email },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message || "Failed to create payment method");
      }

      await subscriptionService.create(
        paymentMethod.id,
        stripePriceId,
        quantity
      );
      
      router.push('/admin');
      onSuccess?.();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: mode === 'dark' ? '#fff' : '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const totalPrice = (BASE_PRICE_CENTS * quantity / 100).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className={`${styles.paymentForm} ${mode === 'dark' ? styles.darkTheme : ''}`}>
      <div className={styles.planInfo}>
        <h3>Standard Plan</h3>
        <p className={styles.description}>Number of Daycare Centers:</p>
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        <p className={styles.price}>${totalPrice} / month</p>
      </div>
      <div className={styles.cardSection}>
        <label className={styles.cardLabel}>Card Information</label>
        <div className={styles.cardElementWrapper}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <button type="submit" disabled={!stripe || loading} className={`${styles.submitButton} ${loading ? styles.loading : ""}`}>
        {loading ? "Processing..." : `Subscribe Now for $${totalPrice}`}
      </button>
      <div className={styles.securityInfo}>
        <p>Your payment information is secure and encrypted.</p>
        <p>Cancel anytime from your account settings.</p>
      </div>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default StripePaymentForm;