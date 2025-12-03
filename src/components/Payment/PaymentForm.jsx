import React, { useState } from 'react';
import styles from './styles.module.css';
import { processPayment } from '../../services/paymentService';

export default function PaymentForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || cardNumber.replace(/\D/g, '').length < 12) {
      setError('Vui lòng nhập thông tin hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      await processPayment({ name, cardNumber, exp, cvc });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.message || 'Thanh toán thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className={styles.success}>Thanh toán thành công. Cảm ơn bạn!</div>;
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>
        Tên trên thẻ
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        Số thẻ
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
          maxLength={19}
        />
      </label>

      <div className={styles.row}>
        <label>
          Hết hạn (MM/YY)
          <input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" />
        </label>

        <label>
          CVC
          <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} maxLength={4} />
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.payButton} disabled={loading}>
        {loading ? 'Đang xử lý...' : `Thanh toán`}
      </button>
    </form>
  );
}