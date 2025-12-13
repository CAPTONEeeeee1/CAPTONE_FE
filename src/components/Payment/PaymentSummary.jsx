import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentSummary({ planName = 'Premium', displayAmount, benefits = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-lg">{planName}</h4>
        <p className="text-2xl font-bold text-primary">{displayAmount}</p>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {benefits.length
          ? benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{b}</span>
              </li>
            ))
          : (
            <>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Không quảng cáo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tăng tốc độ tải</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Hỗ trợ ưu tiên</span>
              </li>
            </>
          )}
      </ul>
    </div>
  );
}