"use client";

import React from 'react';
import styles from './QuantitySelector.module.scss';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, setQuantity, min = 1, max = 100 }) => {
  const handleDecrement = () => {
    setQuantity(Math.max(min, quantity - 1));
  };

  const handleIncrement = () => {
    setQuantity(Math.min(max, quantity + 1));
  };

  return (
    <div className={styles.quantitySelector}>
      <button type="button" onClick={handleDecrement} disabled={quantity <= min} className={styles.button}>-</button>
      <span className={styles.quantityDisplay}>{quantity}</span>
      <button type="button" onClick={handleIncrement} disabled={quantity >= max} className={styles.button}>+</button>
    </div>
  );
};

export default QuantitySelector;