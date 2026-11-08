import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import WhatsAppIcon from '../components/common/WhatsAppIcon';
import { storageService } from '../services/storageService';
import { apiRequest } from '../services/apiClient';
import { SOCIAL_LINKS, InstagramGlyph } from '../components/common/SocialLinks';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || sending) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    setSendError(null);
    setSubmitted(false);
    try {
      // Emails the store inbox via the backend (Brevo).
      const { response, data } = await apiRequest<{ success?: boolean; message?: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      });
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send your message right now.');
      }
    } catch (err: any) {
      setSendError(err?.message || 'Unable to send your message right now. Please try again later.');
      setSending(false);
      return;
    }
    setSending(false);

    // Keep a local copy as before
    const existing = storageService.getItem<any[]>('civil_contact_messages', []);
    storageService.setItem('civil_contact_messages', [newMessage, ...existing]);

    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Hero Breadcrumb Banner */}
      <div className="w-full bg-white border-b border-slate-200 py-6 sm:py-8 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-2">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#F5A623] font-bold">Contact Us</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Have questions about digital software downloads or CAD packages? We are available 24/7.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* 4 Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Call to Us */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center text-xl shrink-0">
              📞
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Call to Us</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                We're available 24/7, 7 days a week.
              </p>
            </div>
            <div className="space-y-1 text-xs font-bold text-slate-800 pt-2 border-t border-slate-100">
              <div>Phone: <a href="tel:+918807423228" className="hover:text-[#F5A623]">+91 88074 23228</a></div>
              <div>Phone: <a href="tel:+919042993986" className="hover:text-[#F5A623]">+91 90429 93986</a></div>
            </div>
          </div>

          {/* Card 2: Write to Us */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              ✉️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Write to Us</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Fill out our form and we will contact you within 24 hours.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-800 pt-2 border-t border-slate-100">
              Email: <a href="mailto:civildigitalstore25@gmail.com" className="hover:text-[#F5A623]">civildigitalstore25@gmail.com</a>
            </div>
          </div>

          {/* Card 3: Headquarter Hours */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              🏢
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Headquarter Hours</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">India Standard Time</p>
            </div>
            <div className="space-y-1 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Monday – Friday:</span>
                <span className="font-bold text-slate-900">9:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-bold text-slate-900">11:00 – 15:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-bold text-emerald-600">Online 24/7</span>
              </div>
            </div>
          </div>

          {/* Card 4: Official Social Channels */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              <InstagramGlyph className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Official Social Media</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Follow our official accounts for daily updates & releases.
              </p>
            </div>
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
                title="Follow us on Instagram (@civildigital_store)"
              >
                <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <InstagramGlyph className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                    Instagram
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    @civildigital_store
                  </span>
                </div>
              </a>

              {/* YouTube */}
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
                title="Subscribe on YouTube (@CivilDigitalStore)"
              >
                <span className="w-7 h-7 rounded-lg bg-[#FF0000] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                    YouTube
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    @CivilDigitalStore
                  </span>
                </div>
              </a>

              {/* Facebook */}
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
                title="Follow us on Facebook (ercivildigitalstore)"
              >
                <span className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Facebook
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    ercivildigitalstore
                  </span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
                title="Chat with us on WhatsApp (+91 88074 23228)"
              >
                <span className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold text-slate-900 group-hover:text-[#25D366] transition-colors truncate">
                    WhatsApp
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    +91 88074 23228
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Offline Store Location Card */}
        <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1B2D50] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-block bg-[#F5A623] text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
              OFFLINE STORE LOCATION
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Want To Visit Our Offline Stores?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              📍 Civil DigitalStore, 2/308, Main Road, Pillayarpatti, Vallam, Tamil Nadu 613403
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=Civil+DigitalStore+Pillayarpatti+Vallam+Tamil+Nadu+613403"
            target="_blank"
            rel="noreferrer"
            className="bg-[#F5A623] hover:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Get Directions</span>
            <span>📍</span>
          </a>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Have a question about your order, custom CAD request, or technical specs? Drop us a note below.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-3 animate-fade-in">
              <span className="text-base">✓</span>
              <span>Thank you for contacting Civil Digital Store! We will contact you within 24 hours.</span>
            </div>
          )}

          {sendError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold rounded-xl">
              {sendError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subject</label>
              <input
                type="text"
                placeholder="e.g. Inquiry about AutoCAD Architecture Bundle"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Your Message *</label>
              <textarea
                rows={5}
                required
                placeholder="Write your message or inquiry here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="disabled:opacity-60 bg-[#F5A623] hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Send Message →
              </button>
            </div>
          </form>
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default ContactUsPage;
