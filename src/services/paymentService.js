export async function processPayment(payload) {
  // Mock payment: thay bằng tích hợp Stripe/PayPal ở production
  await new Promise((res) => setTimeout(res, 1000));
  const card = (payload.cardNumber || '').toString();
  if (card.startsWith('4')) {
    return { ok: true };
  }
  throw new Error('Thẻ bị từ chối (mock). Dùng thẻ bắt đầu bằng "4" để thử.');
}