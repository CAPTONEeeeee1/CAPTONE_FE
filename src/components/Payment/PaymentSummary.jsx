import React from 'react';
import styles from './styles.module.css';

export default function PaymentSummary({ planName = 'Premium', amountCents, benefits = [] }) {
  return (
    <div className={styles.summary}>
      <h3>{planName}</h3>
      <div className={styles.price}>{(amountCents / 100).toFixed(2)}₫ / tháng</div>
      <ul>
        {benefits.length
          ? benefits.map((b, i) => <li key={i}>{b}</li>)
          : (
            <>
              <li>Không quảng cáo</li>
              <li>Tăng tốc độ tải</li>
              <li>Hỗ trợ ưu tiên</li>
            </>
          )}
      </ul>
    </div>
  );
}