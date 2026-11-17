import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleContentProps {
  children: React.ReactNode;
  /** Height (px) shown while collapsed - roughly 5-6 lines of description text. */
  collapsedHeight?: number;
  /** Tailwind "from-" colour of the fade; must match the background behind the content. */
  fadeClassName?: string;
  className?: string;
}

/**
 * Clamps long (rich HTML) content with a gradient fade and a centred "Read more / Read less" toggle.
 * The toggle only appears when the content really overflows; size changes (images loading, window
 * resizes, font swaps) are tracked with a ResizeObserver.
 */
export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  collapsedHeight = 200,
  fadeClassName = 'from-white',
  className = '',
}) => {
  const contentId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => setFullHeight(inner.scrollHeight);
    if (typeof ResizeObserver === 'undefined') {
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Small tolerance so content that is only a few pixels taller is shown in full instead of clamped.
  const overflowing = fullHeight > collapsedHeight + 32;
  const collapsed = overflowing && !expanded;

  const toggle = () => {
    if (expanded) {
      const top = wrapperRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setExpanded((value) => !value);
  };

  return (
    <div className={className}>
      <div
        ref={wrapperRef}
        id={contentId}
        className="relative scroll-mt-40 overflow-hidden transition-[max-height] duration-500 ease-in-out motion-reduce:transition-none"
        style={{ maxHeight: !overflowing ? 'none' : expanded ? `${fullHeight}px` : `${collapsedHeight}px` }}
      >
        <div ref={innerRef}>{children}</div>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${fadeClassName} to-transparent transition-opacity duration-300 ${
            collapsed ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {overflowing && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            aria-controls={contentId}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold text-[#D97706] transition-colors hover:bg-amber-50 hover:text-[#B45309] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50"
          >
            {expanded ? 'Read less' : 'Read more'}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default CollapsibleContent;
