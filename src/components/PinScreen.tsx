import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { unlockAudio } from '../utils/audioContext';

const CORRECT_PIN = '2004';

interface PinScreenProps {
  onSuccess: () => void;
}

export default function PinScreen({ onSuccess }: PinScreenProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const refs = [firstInputRef, input1Ref, input2Ref, input3Ref];

  // Auto-focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    unlockAudio(); // unlock audio on first user interaction
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    setError(false);

    if (digit && idx < 3) {
      refs[idx + 1].current?.focus();
    }

    // Check PIN when all 4 digits filled
    if (digit && idx === 3) {
      const pin = [...next.slice(0, 3), digit].join('');
      if (pin === CORRECT_PIN) {
        setTimeout(onSuccess, 400);
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setDigits(['', '', '', '']);
          refs[0].current?.focus();
        }, 700);
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    unlockAudio(); // keep unlocking on every key event
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  return (
    <motion.div
      className="pin-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative sparkles */}
      {['✨', '💖', '🌸', '⭐', '💕', '🎀'].map((e, i) => (
        <div key={i} className="pin-sparkle" style={{
          top: `${10 + Math.random() * 80}%`,
          left: `${5 + Math.random() * 90}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${2 + i * 0.4}s`,
        }}>{e}</div>
      ))}

      <motion.div
        className="pin-card"
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Lock icon */}
        <motion.div
          className="pin-lock"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          🔐
        </motion.div>

        <motion.h2
          className="pin-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Enter the Secret Code
        </motion.h2>
        <motion.p
          className="pin-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Only for Kaviii 💖
        </motion.p>

        {/* PIN inputs */}
        <motion.div
          className="pin-inputs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              className={`pin-input ${error ? 'pin-error' : ''} ${d ? 'pin-filled' : ''}`}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="pin-error-msg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              ✗ Wrong code, try again!
            </motion.p>
          )}
        </AnimatePresence>

        <motion.p
          className="pin-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Hint: A special year 🗓️
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
