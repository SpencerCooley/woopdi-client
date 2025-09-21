import styles from './CurrencyDisplay.module.scss';

export default function CurrencyDisplay() {
  return (
    <div className={styles.currencyContainer}>
      <div className={styles.balance}>
        <span className={styles.amount}>$150.00</span>
        <span className={styles.label}>Account Balance</span>
      </div>
    </div>
  );
}
