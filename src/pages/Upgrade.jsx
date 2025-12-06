import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { createVNPayPayment } from '@/lib/paymentService';
import { toast } from 'sonner';

const Upgrade = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { workspaceId } = location.state || {};
    const [isUpgrading, setIsUpgrading] = useState(false);


    const handleUpgrade = async () => {
        console.log('[Upgrade.jsx] handleUpgrade started.');
        setIsUpgrading(true);
        try {
            if (!workspaceId) {
                toast.error("Workspace ID is missing. Cannot proceed.");
                setIsUpgrading(false);
                console.error('[Upgrade.jsx] Missing workspaceId.');
                return;
            }

            const paymentData = {
                amount: 10000000, // Approx. $10
                orderInfo: `Upgrade to Premium Plan`,
                workspaceId: workspaceId,
            };
            console.log('[Upgrade.jsx] Payment data prepared:', paymentData);

            console.log('[Upgrade.jsx] Calling createVNPayPayment...');
            const response = await createVNPayPayment(paymentData);
            console.log('[Upgrade.jsx] API response received:', response);

            if (response && response.paymentUrl) {
                console.log('[Upgrade.jsx] Redirecting to payment URL:', response.paymentUrl);
                window.location.href = response.paymentUrl;
            } else {
                console.error('[Upgrade.jsx] Invalid response or missing paymentUrl.');
                toast.error('Could not get payment URL. Please try again.');
                setIsUpgrading(false);
            }
        } catch (error) {
            console.error('[Upgrade.jsx] Error during upgrade process:', error);
            const errorMessage = error && error.message ? error.message : 'Failed to start the upgrade process. Please try again.';
            toast.error(errorMessage);
            setIsUpgrading(false);
            console.log('[Upgrade.jsx] handleUpgrade finished with error.');
        }
    };

    if (!workspaceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
                    <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">Error</h1>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        No workspace selected. Please go back and select a workspace to upgrade.
                    </p>
                    <Button onClick={() => navigate('/workspaces')}>Go to Workspaces</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">Upgrade to PREMIUM</h1>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Unlock unlimited boards, members, and exclusive features by upgrading your workspace to the PREMIUM plan.
                </p>
                <Button onClick={handleUpgrade} size="lg" disabled={isUpgrading}>
                    {isUpgrading ? 'Processing...' : 'Upgrade Now for 100.000đ/month'}
                </Button>
            </div>
        </div>
    );
};

export default Upgrade;
