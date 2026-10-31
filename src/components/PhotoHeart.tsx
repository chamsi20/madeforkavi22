import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Photos cycling through all 5 with captions ── */
const PHOTO_ITEMS = [
  {
    src: '/Kaviii.png',
    title: 'Always in My Heart 💖',
    note: 'Your gorgeous smile lights up everything ✨',
  },
  {
    src: '/photo2.png',
    title: 'Sweetest Memories 🌸',
    note: 'Every moment with you is precious and unforgettable 💕',
  },
  {
    src: '/photo3.png',
    title: 'Forever Beautiful 💫',
    note: 'Cherishing all our laughter and beautiful moments together 🌷',
  },
  {
    src: '/photo4.png',
    title: 'Pure Magic ✨',
    note: 'You bring so much warmth, joy, and sunshine into my life 💝',
  },
  {
    src: '/photo5.png',
    title: 'My Favorite View 🎀',
    note: 'Wishing you all the happiness and love in the world today and always 🥂',
  },
];

/* ── Parametric heart equation ──
   x = 16 sin³(t)
   y = -(13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
   Generates N evenly-spaced points on the heart curve
*/
function heartPoints(n: number, scale: number, cx: number, cy: number) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push({ x: cx + x * scale, y: cy + y * scale });
  }
  return pts;
}

interface PhotoHeartProps {
  onClose: () => void;
}

export default function PhotoHeart({ onClose }: PhotoHeartProps) {
  // We use 3 phases: 'hidden' -> 'intro' (fast pop-up) -> 'heart' (formation)
  const [phase, setPhase] = useState<'hidden' | 'intro' | 'heart'>('hidden');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const N = 16; // number of photo slots

  // Pre-calculate stable random offsets for the "intro pop-up" sequence
  const introPositions = useMemo(() => {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    return Array.from({ length: N }).map(() => ({
      x: (Math.random() - 0.5) * (winW * 0.75),
      y: (Math.random() - 0.5) * (winH * 0.75),
      rot: (Math.random() - 0.5) * 60, // Wild rotation
      targetRot: (Math.random() - 0.5) * 12 // Subtle rotation for final heart
    }));
  }, []);

  useEffect(() => {
    // 1. Start intro pop-up very quickly after mount
    const t1 = setTimeout(() => setPhase('intro'), 100);
    // 2. Wait for intro staggered animation (N * 0.05s + duration) then form heart
    const t2 = setTimeout(() => setPhase('heart'), 1600);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Keyboard navigation for preview
  useEffect(() => {
    if (previewIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewIndex(null);
      } else if (e.key === 'ArrowRight') {
        setPreviewIndex(p => (p === null ? 0 : (p + 1) % PHOTO_ITEMS.length));
      } else if (e.key === 'ArrowLeft') {
        setPreviewIndex(p => (p === null ? 0 : (p - 1 + PHOTO_ITEMS.length) % PHOTO_ITEMS.length));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex]);

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewIndex(prev => (prev === null ? 0 : (prev + 1) % PHOTO_ITEMS.length));
  }, []);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewIndex(prev => (prev === null ? 0 : (prev - 1 + PHOTO_ITEMS.length) % PHOTO_ITEMS.length));
  }, []);

  // Center of the viewport
  const cx = 0;   // SVG-relative
  const cy = 10;  // slightly down

  // Responsive scale: smaller on mobile
  const scale = typeof window !== 'undefined' && window.innerWidth < 600 ? 11 : 15;

  const points = heartPoints(N, scale, cx, cy);

  // Photo size: slightly varies per slot for depth effect
  const sizes = points.map((_, i) => 58 + (i % 3) * 8);

  return (
    <motion.div
      className="photo-heart-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => {
        if (previewIndex !== null) {
          setPreviewIndex(null);
        } else {
          onClose();
        }
      }}
    >
      {/* Glow behind the heart */}
      <div className="ph-glow" />

      {/* Sparkles */}
      {['✨', '💖', '🌸', '⭐', '💕', '🎀', '✨', '💝'].map((e, i) => (
        <motion.div
          key={i}
          className="ph-sparkle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            fontSize: `${14 + Math.random() * 14}px`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        >
          {e}
        </motion.div>
      ))}

      {/* SVG coordinate container — photos placed relative to center */}
      <div className="ph-stage">
        {points.map((pt, i) => {
          const item = PHOTO_ITEMS[i % PHOTO_ITEMS.length];
          return (
            <motion.div
              key={i}
              className="ph-photo-slot"
              style={{
                width: sizes[i],
                height: sizes[i],
                left: `calc(50% + ${pt.x}px - ${sizes[i] / 2}px)`,
                top: `calc(50% + ${pt.y}px - ${sizes[i] / 2}px)`,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: introPositions[i].x,
                y: introPositions[i].y,
                rotate: introPositions[i].rot,
              }}
              animate={{
                opacity: phase !== 'hidden' ? 1 : 0,
                // Pop up big in 'intro', settle to 1 in 'heart'
                scale: phase === 'intro' ? 1.6 : (phase === 'heart' ? 1 : 0),
                x: phase === 'intro' ? introPositions[i].x : 0,
                y: phase === 'intro' ? introPositions[i].y : 0,
                rotate: phase === 'intro' ? introPositions[i].rot : introPositions[i].targetRot,
                zIndex: phase === 'intro' ? 10 + i : 1,
              }}
              transition={{
                delay: phase === 'intro' ? i * 0.05 : i * 0.03,
                duration: phase === 'intro' ? 0.4 : 1.2,
                type: 'spring',
                stiffness: phase === 'intro' ? 220 : 85,
                damping: phase === 'intro' ? 12 : 14,
              }}
              whileHover={{ scale: 1.25, zIndex: 100, rotate: 0 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex(i % PHOTO_ITEMS.length);
              }}
              title="Click to view photo in heart 💖"
            >
              <img
                src={item.src}
                alt={`Memory ${i + 1}`}
                className="ph-photo"
              />
              {/* Glow ring */}
              <div className="ph-ring" />
            </motion.div>
          );
        })}

        {/* Centre heart label */}
        <AnimatePresence>
          {phase === 'heart' && (
            <motion.div
              className="ph-center-label"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
            >
              <div className="ph-center-emoji">💖</div>
              <div className="ph-center-text">Kaviii</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top hint pill */}
        <AnimatePresence>
          {phase === 'heart' && (
            <motion.div
              className="ph-top-hint"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              ✨ Tap any photo to preview 💖
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close hint */}
      <motion.div
        className="ph-close-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        Tap background to close ✕
      </motion.div>

      {/* Heart-Cropped Photo Preview Lightbox */}
      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            key="ph-preview-backdrop"
            className="ph-preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex(null);
            }}
          >
            <motion.div
              className="ph-preview-card"
              initial={{ scale: 0.7, y: 35, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                className="ph-preview-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(null);
                }}
                aria-label="Close Preview"
              >
                ✕
              </button>

              {/* Decorative Corner Sparkles */}
              <span className="ph-preview-sparkle" style={{ top: 16, left: 22 }}>✨</span>
              <span className="ph-preview-sparkle" style={{ top: 20, right: 62, animationDelay: '0.8s' }}>🌸</span>
              <span className="ph-preview-sparkle" style={{ bottom: 20, left: 24, animationDelay: '1.4s' }}>💫</span>
              <span className="ph-preview-sparkle" style={{ bottom: 22, right: 26, animationDelay: '0.4s' }}>💖</span>

              {/* Heart-Cropped Photo Display */}
              <motion.div
                key={previewIndex}
                className="ph-preview-heart-wrap"
                initial={{ scale: 0.88, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  viewBox="0 0 170 158"
                  className="heart-preview-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <clipPath id="heart-preview-clip">
                      <path d="M85 158 C32 120 0 90 0 52 C0 24 22 0 52 0 C65 0 78 7 85 20 C92 7 105 0 118 0 C148 0 170 24 170 52 C170 90 138 120 85 158 Z" />
                    </clipPath>
                    <linearGradient id="heart-preview-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff77a9" />
                      <stop offset="50%" stopColor="#ff1493" />
                      <stop offset="100%" stopColor="#ffb6d9" />
                    </linearGradient>
                    <filter id="heart-preview-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Heart Cropped Photo Image */}
                  <image
                    href={PHOTO_ITEMS[previewIndex].src}
                    x="0"
                    y="0"
                    width="170"
                    height="158"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#heart-preview-clip)"
                  />

                  {/* Glowing Heart Outline */}
                  <path
                    d="M85 158 C32 120 0 90 0 52 C0 24 22 0 52 0 C65 0 78 7 85 20 C92 7 105 0 118 0 C148 0 170 24 170 52 C170 90 138 120 85 158 Z"
                    fill="none"
                    stroke="url(#heart-preview-border-grad)"
                    strokeWidth="4"
                    filter="url(#heart-preview-glow)"
                  />

                  {/* Shimmer Inner Stroke */}
                  <path
                    d="M85 158 C32 120 0 90 0 52 C0 24 22 0 52 0 C65 0 78 7 85 20 C92 7 105 0 118 0 C148 0 170 24 170 52 C170 90 138 120 85 158 Z"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="1.5"
                  />
                </svg>
              </motion.div>

              {/* Title & Caption */}
              <h3 className="ph-preview-title">{PHOTO_ITEMS[previewIndex].title}</h3>
              <p className="ph-preview-note">{PHOTO_ITEMS[previewIndex].note}</p>

              {/* Navigation Controls */}
              <div className="ph-preview-nav">
                <button
                  type="button"
                  className="ph-nav-btn"
                  onClick={prevPhoto}
                  aria-label="Previous Photo"
                >
                  ‹
                </button>
                <span className="ph-preview-counter">
                  {previewIndex + 1} / {PHOTO_ITEMS.length}
                </span>
                <button
                  type="button"
                  className="ph-nav-btn"
                  onClick={nextPhoto}
                  aria-label="Next Photo"
                >
                  ›
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
