'use client';

import Image from 'next/image';
import StripePaymentForm from '../../components/billing/StripePaymentForm';
import styles from './PaymentSetup.module.scss';
import { useLogo } from '../../hooks/useLogo';

export default function PaymentSetupPage() {
  const { currentLogoUrl, hasLogo } = useLogo();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {hasLogo && (
          <div className={styles.logoWrapper}>
            <Image
              src={currentLogoUrl!}
              alt="Company Logo"
              width={120}
              height={35}
              priority
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        )}
        <StripePaymentForm />
      </div>
    </div>
  );
}
