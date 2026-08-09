'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('contact_messages').insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        subject: formData.subject || null,
        message: formData.message,
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-bold text-[#a63b7e] uppercase tracking-widest block">Customer Support</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-serif">Get In Touch With Imani's</h1>
        <p className="text-xs text-gray-500 max-w-lg mx-auto">We are here to assist you with order inquiries, product details, size suggestions and delivery updates across Pakistan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-pink-50/50 rounded-3xl border border-pink-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm font-serif">Imani's Collection Info</h3>

            <div className="flex items-start gap-3 text-xs text-gray-700">
              <MapPin className="w-5 h-5 text-[#a63b7e] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900">Islamabad Store Address</strong>
                <span>Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-700">
              <Phone className="w-5 h-5 text-[#a63b7e] shrink-0" />
              <div>
                <strong className="block text-gray-900">Mobile & WhatsApp Helpline</strong>
                <a href="tel:03121222333" className="hover:underline text-[#a63b7e] font-bold">0312 1222333</a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-700">
              <Mail className="w-5 h-5 text-[#a63b7e] shrink-0" />
              <div>
                <strong className="block text-gray-900">Official Support Email</strong>
                <a href="mailto:imanisbyanila@gmail.com" className="hover:underline">imanisbyanila@gmail.com</a>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/923121222333"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-emerald-600 text-white p-4 rounded-3xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-current" /> Chat Live on WhatsApp (0312 1222333)
          </a>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 font-serif">Message Sent Successfully!</h3>
              <p className="text-xs text-gray-500">Thank you for reaching out. Our support team will get back to you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="text-xs text-[#a63b7e] font-bold underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 font-serif mb-2">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
