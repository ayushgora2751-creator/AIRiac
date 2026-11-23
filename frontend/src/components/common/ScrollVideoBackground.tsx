import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollVideoBackgroundProps {
  totalFrames?: number;
  framePrefix?: string;
  frameExtension?: string;
  overlayOpacity?: number; // 0 to 1
}

export const ScrollVideoBackground: React.FC<ScrollVideoBackgroundProps> = ({
  totalFrames = 60,
  framePrefix = '/frames/ezgif-frame-',
  frameExtension = '.jpg',
  overlayOpacity = 0.35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(1);
  const animationFrameId = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Helper to format frame URL
  const getFrameUrl = useCallback(
    (index: number) => {
      const padded = String(index).padStart(3, '0');
      return `${framePrefix}${padded}${frameExtension}`;
    },
    [framePrefix, frameExtension]
  );

  // Draw image on canvas keeping aspect ratio (cover mode)
  const renderFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    if (!imgWidth || !imgHeight) return;

    // Calculate "cover" scale and positioning
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const x = (canvasWidth - imgWidth * scale) / 2;
    const y = (canvasHeight - imgHeight * scale) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
  }, []);

  // Preload a specific frame index
  const loadFrame = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      if (imagesRef.current.has(index)) {
        return Promise.resolve(imagesRef.current.get(index)!);
      }
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          imagesRef.current.set(index, img);
          resolve(img);
        };
        img.onerror = () => {
          // If frame fails, resolve with frame 1 or existing
          resolve(imagesRef.current.get(1) || img);
        };
      });
    },
    [getFrameUrl]
  );

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const currentImg = imagesRef.current.get(currentFrameRef.current);
      if (currentImg) {
        renderFrame(currentImg);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Initial Preload (first batch of frames for instant responsiveness)
  useEffect(() => {
    let isCancelled = false;

    // Load first frame immediately
    loadFrame(1).then((firstImg) => {
      if (isCancelled) return;
      renderFrame(firstImg);
      setIsReady(true);

      // Preload critical keyframes smoothly in background
      const preloadSequence = async () => {
        // Load every 5th frame first for smooth scrub responsiveness
        for (let i = 1; i <= totalFrames; i += 4) {
          if (isCancelled) return;
          await loadFrame(i);
        }
        // Then fill in the rest
        for (let i = 1; i <= totalFrames; i++) {
          if (isCancelled) return;
          if (!imagesRef.current.has(i)) {
            loadFrame(i);
          }
        }
      };

      preloadSequence();
    });

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, loadFrame, renderFrame]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        const progress =
          scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;

        const targetFrame = Math.min(
          totalFrames,
          Math.max(1, Math.round(progress * (totalFrames - 1)) + 1)
        );

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          loadFrame(targetFrame).then((img) => {
            renderFrame(img);
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [totalFrames, loadFrame, renderFrame]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
    >
      {/* HTML5 Video Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Cinematic Environmental Overlay */}
      <div
        className="absolute inset-0 bg-slate-900 transition-opacity"
        style={{ opacity: overlayOpacity }}
      />

      {/* Subtle vignette and radial gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 pointer-events-none" />
    </div>
  );
};

export default ScrollVideoBackground;
