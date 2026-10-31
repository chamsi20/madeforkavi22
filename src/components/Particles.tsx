import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface FloatingParticleProps {
  emoji: string;
  size: number;
  startX: number;
  delay: number;
  duration: number;
}

export function FloatingParticle({
  emoji,
  size,
  startX,
  delay,
  duration,
}: FloatingParticleProps) {
  const controls = useAnimation();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const run = async () => {
      while (mounted.current) {
        await controls.start({
          y: [window.innerHeight + 50, -100],
          x: [startX, startX + (Math.random() - 0.5) * 80],
          opacity: [0, 0.7, 0.9, 0],
          rotate: [0, Math.random() > 0.5 ? 20 : -20],
          transition: {
            duration: duration,
            delay: delay,
            ease: 'easeInOut',
          },
        });
        // Reset to bottom for infinite loop
        await controls.set({ y: window.innerHeight + 50, opacity: 0 });
      }
    };

    run();

    return () => {
      mounted.current = false;
    };
  }, [controls, startX, delay, duration]);

  return (
    <motion.div
      className="floating-heart fixed pointer-events-none select-none"
      style={{
        left: `${startX}px`,
        bottom: -50,
        fontSize: `${size}px`,
        zIndex: 0,
      }}
      animate={controls}
    >
      {emoji}
    </motion.div>
  );
}

interface TwinkleStarProps {
  top: string;
  left: string;
  size: number;
  delay: number;
}

export function TwinkleStar({ top, left, size, delay }: TwinkleStarProps) {
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ top, left, fontSize: `${size}px`, zIndex: 0 }}
      animate={{
        opacity: [0.2, 1, 0.2],
        scale: [0.8, 1.2, 0.8],
        rotate: [0, 15, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      ✨
    </motion.div>
  );
}
