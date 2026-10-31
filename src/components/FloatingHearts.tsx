import { useEffect, useRef, useCallback } from 'react';

const HEARTS = ['💖', '💕', '🩷', '💗', '💓', '❤️', '🌸', '✨'];

export default function FloatingHearts({ clickTrigger }: { clickTrigger: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback((x?: number, y?: number) => {
    const container = containerRef.current;
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'heart';
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    el.style.left = `${x ?? Math.random() * window.innerWidth}px`;
    el.style.top = `${y ?? window.innerHeight - 50}px`;
    el.style.fontSize = `${16 + Math.random() * 18}px`;
    el.style.animationDuration = `${3 + Math.random() * 2}s`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }, []);

  // Spawn hearts on click anywhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          spawnHeart(
            e.clientX + (Math.random() - 0.5) * 60,
            e.clientY + (Math.random() - 0.5) * 30
          );
        }, i * 80);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [spawnHeart]);

  // Continuous ambient hearts from bottom
  useEffect(() => {
    const interval = setInterval(() => {
      spawnHeart(Math.random() * window.innerWidth, window.innerHeight + 10);
    }, 1200);
    return () => clearInterval(interval);
  }, [spawnHeart]);

  // Burst on trigger (wish button)
  useEffect(() => {
    if (clickTrigger === 0) return;
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnHeart(Math.random() * window.innerWidth, window.innerHeight + 10);
      }, i * 100);
    }
  }, [clickTrigger, spawnHeart]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }}
    />
  );
}
