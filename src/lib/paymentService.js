import api from './api';

export const createVNPayPayment = async (paymentData) => {
    try {
        const response = await api.post('/payment/create-vnpay-payment', paymentData);
        return response;
    } catch (error) {
        throw error;
    }
};