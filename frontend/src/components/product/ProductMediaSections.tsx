import React from 'react';
import type { Product } from '../../types/product';
import { resolveProductVideo, youtubeEmbed } from '../../utils/productVideo';

const ActivationVideo = ({ name, url }: { name: string; url?: string }) => {
  const player = resolveProductVideo(url);
  if (!player) return null;
  return (
    <section className="mt-8 rounded-xl bg-slate-100 p-4 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <span aria-hidden>▶️</span>
        Activation Video Demo
      </h2>
      <p className="mt-1 text-xs text-slate-500">Watch this step-by-step guide to activate your {name} license</p>
      <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
        {player.kind === 'iframe' ? (
          <iframe src={player.src} title="Activation Video Demo" className="h-full w-full border-0" allow={player.allow} allowFullScreen />
        ) : (
          <video src={player.src} className="h-full w-full" controls playsInline />
        )}
      </div>
    </section>
  );
};

const SampleVideos = ({ links }: { links?: string[] }) => {
  const videos = (links || [])
    .map((url) => ({ url, embed: youtubeEmbed(url) }))
    .filter((item): item is { url: string; embed: string } => Boolean(item.embed));
  if (!videos.length) return null;

  return (
    <section className="mt-8 rounded-xl bg-slate-100 p-4 sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Sample Videos</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border-2 border-slate-200 p-3 sm:grid-cols-4">
        {videos.map((video, index) => (
          <div key={video.url} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
            <iframe
              src={video.embed}
              title={`Sample Video ${index + 1}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export const ProductMediaSections: React.FC<{ product: Product }> = ({ product }) => (
  <>
    <ActivationVideo name={product.name} url={product.activationVideoUrl} />
    <SampleVideos links={product.instagramReels} />
  </>
);

export default ProductMediaSections;
