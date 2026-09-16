import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { storageService } from '../services/storageService';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save message to LocalStorage
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
        
        {/* 3 Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Email: <a href="mailto:civildigitalstore@gmail.com" className="hover:text-[#F5A623]">civildigitalstore@gmail.com</a>
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
                <span className="font-bold text-emerald-600">Online Support 24/7</span>
              </div>
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
                className="bg-[#F5A623] hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
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
