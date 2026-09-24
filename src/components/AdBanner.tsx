// src/components/AdBanner.tsx
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot: string;
}

export function AdBanner({ slot }: AdBannerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const insEl = insRef.current;
    if (!insEl || insEl.dataset.loaded) return;

    function pushAd() {
      if (!insEl || insEl.dataset.loaded) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        insEl.dataset.loaded = 'true';
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }

    if (insEl.offsetWidth > 0) {
      pushAd();
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > 0) {
        observer.disconnect();
        pushAd();
      }
    });
    observer.observe(insEl);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="ad-block" ref={wrapperRef} style={{ width: '100%', minHeight: '90px' }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-1296094569685364"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}