import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

const PaymentStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');
    const [amount, setAmount] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isSuccess = params.get('success') === 'true';
        setPaymentSuccess(isSuccess);
        setMessage(params.get('message') || '');
        setOrderId(params.get('orderId') || '');
        setAmount(params.get('amount') || '');
        setWorkspaceId(params.get('workspaceId') || '');

        if (isSuccess) {
            console.log("Payment successful, dispatching workspacePlanChanged event.");
            window.dispatchEvent(new CustomEvent('workspacePlanChanged'));
        }
    }, [location.search]);

    useEffect(() => {
        // If there's a status message, redirect after a delay
        if (message || orderId) {
            const timer = setTimeout(() => {
                if (paymentSuccess && workspaceId) {
                    navigate(`/workspace/${workspaceId}`, { replace: true });
                } else {
                    navigate('/workspaces', { replace: true });
                }
            }, 5000); // 5-second delay

            // Cleanup the timer if the component unmounts before the timer fires
            return () => clearTimeout(timer);
        }
    }, [message, orderId, navigate, paymentSuccess, workspaceId]);

    const handleGoToWorkspaces = () => {
        if (paymentSuccess && workspaceId) {
            navigate(`/workspace/${workspaceId}`);
        } else {
            navigate('/workspaces');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
                {paymentSuccess ? (
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                ) : (
                    <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                )}
                <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {paymentSuccess ? 'Payment Successful!' : 'Payment Failed!'}
                </h1>
                {message && (
                    <p className="mb-4 text-gray-600 dark:text-gray-400">{message}</p>
                )}
                {orderId && (
                    <p className="mb-2 text-gray-600 dark:text-gray-400"><strong>Order ID:</strong> {orderId}</p>
                )}
                {amount && (
                    <p className="mb-6 text-gray-600 dark:text-gray-400"><strong>Amount:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
                )}
                <Button onClick={handleGoToWorkspaces} size="lg">
                    {paymentSuccess && workspaceId ? 'Go to Upgraded Workspace' : 'Go to Workspaces'}
                </Button>
            </div>
        </div>
    );
};

export default PaymentStatus;

