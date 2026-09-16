import React from 'react';
import { Link } from 'react-router-dom';

interface CartHeaderProps {
  itemCount: number;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount }) => {
  return (
    <div className="w-full bg-[#0D1B2A] text-white border-b border-slate-800/80 py-8 md:py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Breadcrumb & Title */}
        <div className="space-y-2">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs md:text-sm font-medium">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-[#F5A623] font-semibold">My Cart</span>
          </nav>

          {/* Section Label & Main Heading */}
          <div>
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#F5A623] block mb-1">
              SHOPPING
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              My Cart
            </h1>
          </div>
        </div>

        {/* Right Side: Item Count Badge */}
        <div className="self-start md:self-center">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold bg-[#1B2D50] text-[#F5A623] border border-[#F5A623]/30 shadow-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartHeader;
