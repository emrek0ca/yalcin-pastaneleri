import React from 'react';
import OrderTrackingClient from './OrderTrackingClient';

export function generateStaticParams() {
  return [{ orderNumber: 'demo' }];
}

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
