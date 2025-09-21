'use client';

import Image from 'next/image';
import StripePaymentForm from '../../components/billing/StripePaymentForm';
import styles from './PaymentSetup.module.scss';

export default function PaymentSetupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <Image
            src="/company-logo-light-low.png"
            alt="Woopdi Logo"
            width={120}
            height={35}
            priority
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
        <StripePaymentForm />
      </div>
    </div>
  );
}
