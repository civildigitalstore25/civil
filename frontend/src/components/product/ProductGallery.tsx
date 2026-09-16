import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const displayImages = images && images.length > 0 ? images : ['/placeholder.png'];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Large Main Product Image */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-lg">
        <img
          src={displayImages[selectedImage]}
          alt={`${title} main preview`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedImage(idx)}
            className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white cursor-pointer ${
              selectedImage === idx
                ? 'border-[#F5A623] shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt={`${title} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
