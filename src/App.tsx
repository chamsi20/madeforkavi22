import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixRain from './components/MatrixRain';
import FloatingHearts from './components/FloatingHearts';
import Fireworks from './components/Fireworks';
import MusicPlayer from './components/MusicPlayer';
import Typewriter from './components/Typewriter';
import PinScreen from './components/PinScreen';
import BirthdayAnimation from './components/BirthdayAnimation';
import PhotoHeart from './components/PhotoHeart';

type Phase = 'pin' | 'birthday-anim' | 'countdown' | 'main';

const MESSAGE_LINES = [
  '🎂 Happy Birthday, Babe! 💖',
  '',
  'Wishing you a day filled with',
  'happiness, laughter,',
  'and beautiful moments. 🌸',
  '',
  'May your smile always shine',
  'as brightly as today. ✨',
];

const PAGES = [
  {
    type: 'cover' as const,
    bg: 'linear-gradient(145deg,#ff1493,#c2185b,#7b0040)',
    emoji: '🎂', title: 'Happy Birthday!', subtitle: 'Kaviii 💖', body: '',
  },
  {
    type: 'text' as const,
    bg: 'linear-gradient(145deg,#9c27b0,#6a1b9a,#38006b)',
    emoji: '🌸', title: 'With Love', subtitle: '',
    body: 'May every moment of your day be filled with joy, magic, and all the things you love. 💜',
  },
  {
    type: 'text' as const,
    bg: 'linear-gradient(145deg,#e91e63,#ad1457,#7b0035)',
    emoji: '✨', title: 'Make a Wish', subtitle: '',
    body: 'May all your dreams come true. You deserve the whole world and more! 💝',
  },
  {
    type: 'photo' as const,
    bg: 'linear-gradient(145deg,#c2185b,#880e4f,#4a0028)',
    emoji: '💖', title: 'Always You', subtitle: '', body: '',
  },
];

const STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: 10 + Math.random() * 10,
  delay: Math.random() * 4,
  dur: 1.8 + Math.random() * 2.5,
}));

export default function App() {
  const [phase, setPhase] = useState<Phase>('pin');
  const [countdown, setCountdown] = useState(3);
  const [showCard, setShowCard] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [wishTrigger, setWishTrigger] = useState(0);
  const [wished, setWished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [showPhotoHeart, setShowPhotoHeart] = useState(false);
  const [showWishPopup, setShowWishPopup] = useState(false);
  const fwTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fwAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (phase !== 'countdown') return;
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(tick);
          setTimeout(() => {
            setPhase('main');
            setShowCard(true);
            setTypingActive(true);
            setTimeout(() => {
              setShowBook(true);
              setFireworksActive(true);
              fwTimer.current = setTimeout(() => setFireworksActive(false), 8000);
            }, 900);
          }, 900);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => () => { if (fwTimer.current) clearTimeout(fwTimer.current); }, []);

  // Fireworks audio — plays public/fireworks.mp3 while fireworks are active
  useEffect(() => {
    if (fireworksActive) {
      if (!fwAudioRef.current) {
        fwAudioRef.current = new Audio('/fireworks.mp3');
        fwAudioRef.current.volume = 0.7;
      }
      fwAudioRef.current.currentTime = 0;
      fwAudioRef.current.play().catch(() => { });
    } else {
      if (fwAudioRef.current) {
        fwAudioRef.current.pause();
        fwAudioRef.current.currentTime = 0;
      }
    }
  }, [fireworksActive]);

  const flipPage = useCallback(() => {
    if (flipping) return;
    setFlipping(true);
    setTimeout(() => {
      setCurrentPage(p => (p + 1) % PAGES.length);
      setFlipping(false);
    }, 420);
  }, [flipping]);

  const handleWish = () => {
    if (wished) return;
    setWished(true);
    setWishTrigger(t => t + 1);
    setFireworksActive(true);
    setShowWishPopup(true);
    setTimeout(() => setFireworksActive(false), 6000);
    setTimeout(() => setShowWishPopup(false), 6500);
  };

  const page = PAGES[currentPage];

  return (
    <>
      {/* PIN */}
      <AnimatePresence>
        {phase === 'pin' && <PinScreen key="pin" onSuccess={() => setPhase('birthday-anim')} />}
      </AnimatePresence>

      {/* Birthday Anim */}
      <AnimatePresence>
        {phase === 'birthday-anim' && <BirthdayAnimation key="bday" onDone={() => setPhase('countdown')} />}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div key="cd" className="intro-overlay"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
            <div className="intro-text">{countdown > 0 ? countdown : '🎉'}</div>
            <div className="intro-sub">{countdown > 0 ? 'Preparing your surprise…' : 'Here we go!'}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      {phase === 'main' && (
        <>
          <MatrixRain />

          {/* Stars */}
          <div className="stars-container">
            {STARS.map(s => (
              <div key={s.id} className="star" style={{
                top: s.top, left: s.left,
                fontSize: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}>✨</div>
            ))}
          </div>

          <Fireworks active={fireworksActive} />
          <FloatingHearts clickTrigger={wishTrigger} />

          {/* Message Card */}
          <div className={`message-card ${showCard ? 'show' : ''}`}>
            {typingActive && <Typewriter lines={MESSAGE_LINES} speed={34} lineDelay={100} />}
          </div>

          {/* 3D Book */}
          <AnimatePresence>
            {showBook && (
              <motion.div className="book-scene"
                initial={{ opacity: 0, scale: 0.72, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <div className="book" onClick={flipPage} title="Tap to turn page">
                  <div className="book-spine" />
                  <div className="book-pages" />
                  <div className="book-back" />

                  <motion.div
                    className="book-cover"
                    key={currentPage}
                    style={{ background: page.bg }}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}>

                    {/* Decorative top bar */}
                    <div className="cover-top-bar">
                      {'★ ✦ ★ ✦ ★'.split(' ').map((s, i) => (
                        <span key={i} style={{ opacity: 0.7, fontSize: 14, letterSpacing: 2 }}>{s}</span>
                      ))}
                    </div>

                    {/* Corner sparkles */}
                    <span className="cover-corner tl">✨</span>
                    <span className="cover-corner tr">💫</span>
                    <span className="cover-corner bl">🌸</span>
                    <span className="cover-corner br">💕</span>

                    {page.type === 'photo' ? (
                      <div className="photo-page">
                        <div className="heart-photo-wrap">
                          <img src="/Kaviii.png" alt="Kaviii" className="heart-photo" />
                          <div className="heart-outline-pulse" />
                        </div>
                        <p className="photo-caption">Always in my heart 💖</p>
                      </div>
                    ) : (
                      <>
                        <div className="cover-emoji">{page.emoji}</div>
                        {/* Decorative divider */}
                        <div className="cover-divider">─── ✦ ───</div>
                        <h1>{page.title}</h1>
                        {page.subtitle && <p className="subtitle">{page.subtitle}</p>}
                        {page.body && <p className="body-text">{page.body}</p>}
                        {/* Bottom script */}
                        {currentPage === 0 && (
                          <p className="cover-script">~ Keep shining, always! ~</p>
                        )}
                      </>
                    )}

                    {/* Bottom bar */}
                    <div className="cover-bottom-bar">
                      <div className="page-dots">
                        {PAGES.map((_, i) => (
                          <div key={i} className="page-dot"
                            style={{ background: i === currentPage ? '#fff' : 'rgba(255,255,255,0.32)' }} />
                        ))}
                      </div>
                    </div>
                    <div className="tap-hint">{currentPage === PAGES.length - 1 ? '↩ loop' : 'TAP ▶'}</div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Heart Button */}
          {showBook && (
            <motion.button
              className="heart-btn"
              onClick={() => setShowPhotoHeart(true)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, type: 'spring', stiffness: 160 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              💝 Her Memories
            </motion.button>
          )}

          {/* Photo Heart Overlay */}
          <AnimatePresence>
            {showPhotoHeart && (
              <PhotoHeart key="ph" onClose={() => setShowPhotoHeart(false)} />
            )}
          </AnimatePresence>

          <MusicPlayer />

          <button id="make-a-wish-btn" className="wish-btn" onClick={handleWish} disabled={wished}>
            {wished ? '🌟 Wished!' : '🎁 Make a Wish'}
          </button>

          <div className="footer-text">Made with ❤️ just for Kaviii</div>

          {/* Wish Popup */}
          <AnimatePresence>
            {showWishPopup && (
              <motion.div
                className="wish-popup-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setShowWishPopup(false)}
              >
                <motion.div
                  className="wish-popup-card"
                  initial={{ scale: 0.5, y: 60, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, y: -40, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  onClick={e => e.stopPropagation()}
                >
                  <motion.h2
                    className="wish-popup-title"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 160 }}
                  >
                    Cheers to 22! 🥂
                  </motion.h2>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
