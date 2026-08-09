import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs md:text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif mb-4">7-Day Return & Exchange Policy</h1>

      <p>At <strong>Imani's Collection (imanisbyanila)</strong>, customer satisfaction is our top priority. We offer a 7-day hassle-free return and exchange policy for products purchased within Pakistan.</p>

      <h3 className="text-base font-bold text-gray-900 pt-2">1. Eligibility for Return / Exchange</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Items must be unworn, unwashed, and undamaged with original tags intact.</li>
        <li>Return request must be initiated within 7 days of package delivery.</li>
        <li>Defective, damaged, or wrong items sent by us will be exchanged with zero return shipping cost.</li>
      </ul>

      <h3 className="text-base font-bold text-gray-900 pt-2">2. How to Initiate a Return</h3>
      <p>Please contact our WhatsApp Support Helpline at <strong>0312 1222333</strong> or email <strong>imanisbyanila@gmail.com</strong> with your Order Reference Number (IMP-XXXXXX) and photos of the item.</p>

      <h3 className="text-base font-bold text-gray-900 pt-2">3. Refund Processing</h3>
      <p>Once the returned package passes inspection at our Islamabad fulfillment center, refunds are processed via Bank Transfer, EasyPaisa, or JazzCash within 3-5 working days.</p>
    </div>
  );
}
