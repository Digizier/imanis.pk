import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs md:text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif mb-4">Shipping & Delivery Policy</h1>

      <p>We deliver nationwide across all cities, towns, and villages in Pakistan via trusted courier services (Leopard, Trax, CallCourier, M&P).</p>

      <h3 className="text-base font-bold text-gray-900 pt-2">1. Shipping Charges</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Free Shipping:</strong> Applied automatically on all orders of <strong>Rs. 2,999 or more</strong>.</li>
        <li><strong>Standard Flat Rate:</strong> Rs. 200 flat fee for orders under Rs. 2,999.</li>
      </ul>

      <h3 className="text-base font-bold text-gray-900 pt-2">2. Delivery Timelines</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Major Cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan): 2 to 3 working days.</li>
        <li>Other Cities & Rural Towns: 3 to 5 working days.</li>
      </ul>

      <h3 className="text-base font-bold text-gray-900 pt-2">3. Order Verification</h3>
      <p>Orders placed via Cash on Delivery may receive a phone call or WhatsApp message for address verification before dispatch.</p>
    </div>
  );
}
