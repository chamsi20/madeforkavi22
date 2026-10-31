import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BirthdayAnimationProps {
  onDone: () => void;
}

function launchConfetti() {
  const colors = ['#ff1493', '#ff69b4', '#ffb6d9', '#c084fc', '#fbbf24', '#fff'];
  confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.55 }, colors, scalar: 1.3, gravity: 0.7 });
  setTimeout(() => {
    confetti({ particleCount: 70, spread: 80, angle: 60, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 70, spread: 80, angle: 120, origin: { x: 1, y: 0.7 }, colors });
  }, 400);
}

export default function BirthdayAnimation({ onDone }: BirthdayAnimationProps) {
  useEffect(() => {
    launchConfetti();
    const t1 = setTimeout(() => {
      launchConfetti();
    }, 2000);
    const t2 = setTimeout(() => {
      launchConfetti();
    }, 4000);
    const t3 = setTimeout(() => {
      launchConfetti();
      setTimeout(onDone, 3000);
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const floatingEmojis = ['🎂', '💖', '🌸', '✨', '🎉', '💕', '🎁', '⭐', '🩷', '🎈'];

  return (
    <motion.div
      className="bday-anim-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating emoji background */}
      {floatingEmojis.map((e, i) => (
        <motion.div
          key={i}
          className="bday-float-emoji"
          style={{
            left: `${5 + (i / floatingEmojis.length) * 90}%`,
            fontSize: `${24 + Math.random() * 20}px`,
          }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ y: '-20vh', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.5 + Math.random(), delay: i * 0.2, ease: 'easeOut' }}
        >
          {e}
        </motion.div>
      ))}

      {/* Main text */}
      <div className="bday-anim-content">
        <motion.div
          className="bday-anim-cake"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.3, 1], rotate: [-20, 10, 0] }}
          transition={{ duration: 0.7, ease: 'backOut' }}
        >
          🎂
        </motion.div>

        <motion.h1
          className="bday-anim-title"
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, type: 'spring', stiffness: 130 }}
        >
          Happy Birthday,
        </motion.h1>

        <motion.h1
          className="bday-anim-name"
          initial={{ opacity: 0, scale: 0.3, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, type: 'spring', stiffness: 120 }}
        >
          Kaviii!
        </motion.h1>

        <motion.div
          className="bday-anim-hearts"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          💖 🌸 💖 🌸 💖
        </motion.div>
      </div>
    </motion.div>
  );
}
