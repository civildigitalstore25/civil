import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { resolveProductVideo } from '../../utils/productVideo';

interface ProductGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string;
}

type MediaItem = { id: string; kind: 'image' | 'video'; src: string };

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title, videoUrl }) => {
  const items: MediaItem[] = [
    ...(images || []).filter(Boolean).map((src) => ({ id: src, kind: 'image' as const, src })),
    ...(videoUrl?.trim() ? [{ id: `video:${videoUrl.trim()}`, kind: 'video' as const, src: videoUrl.trim() }] : []),
  ];
  const [selectedId, setSelectedId] = useState(items[0]?.id || '');
  const [zoom, setZoom] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });
  const current = items.find((item) => item.id === selectedId) || items[0];

  if (!current) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-400">
        No product image
      </div>
    );
  }

  const player = current.kind === 'video' ? resolveProductVideo(current.src) : null;

  return (
    <div className="space-y-3">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-3">
        {player ? (
          <div className="aspect-video w-full max-w-md overflow-hidden rounded-lg bg-black shadow">
            {player.kind === 'iframe' ? (
              <iframe src={player.src} title="Product demo video" className="h-full w-full border-0" allow={player.allow} allowFullScreen />
            ) : (
              <video src={player.src} className="h-full w-full" controls playsInline />
            )}
          </div>
        ) : (
          <div
            className="relative flex h-full w-full cursor-crosshair items-center justify-center overflow-hidden"
            onMouseEnter={() => setZoom((value) => ({ ...value, on: true }))}
            onMouseLeave={() => setZoom((value) => ({ ...value, on: false }))}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setZoom({
                on: true,
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100,
              });
            }}
          >
            <img
              src={current.src}
              alt={title}
              className="max-h-full max-w-full rounded-lg object-contain shadow transition-transform duration-200"
              style={{ transform: zoom.on ? 'scale(2)' : 'scale(1)', transformOrigin: `${zoom.x}% ${zoom.y}%` }}
            />
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                item.id === current.id ? 'border-[#F5A623]' : 'border-slate-200'
              }`}
            >
              {item.kind === 'video' ? (
                <span className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Play className="h-4 w-4 fill-white" />
                  <span className="mt-1 text-[10px] font-semibold">Video</span>
                </span>
              ) : (
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
