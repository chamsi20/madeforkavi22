import { useEffect, useRef } from 'react';

// Place your background music at: public/music.mp3
// It will auto-play (looped) once the user has interacted with the page (PIN entry).
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Auto-play — works because user already interacted via PIN input
    audio.play().catch(() => {
      // If browser still blocks it, silently ignore
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return null; // no visible UI
}
