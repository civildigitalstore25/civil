export type ProductVideoPlayer = { kind: 'iframe' | 'video'; src: string; allow?: string };

export const resolveProductVideo = (raw?: string): ProductVideoPlayer | null => {
  const url = raw?.trim();
  if (!url) return null;

  const youtube =
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (youtube?.[1]) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${youtube[1]}?rel=0`,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };

  const drive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (drive?.[1]) return { kind: 'iframe', src: `https://drive.google.com/file/d/${drive[1]}/preview` };

  return { kind: 'video', src: url };
};

export const youtubeEmbed = (raw: string) => {
  const url = raw.trim();
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  const watch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const id = shorts?.[1] || watch?.[1];
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&loop=1&playlist=${id}&controls=1`;
};
