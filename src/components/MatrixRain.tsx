import { useEffect, useRef } from 'react';

const CHARS = 'HAPPYBIRTHDAYKaviii❤♥★✨🎂🎁🌸';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 15;
    const getColumns = () => Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(getColumns()).fill(1).map(() => Math.random() * -50);

    const COLORS = ['#ff1493', '#ff69b4', '#ff85c2', '#ffb6d9', '#ff4da6', '#f472b6', '#e879a8'];

    const draw = () => {
      // Semi-transparent black to create trail/fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = getColumns();
      // Sync drops array length
      while (drops.length < cols) drops.push(Math.random() * -50);
      drops.length = cols;

      for (let i = 0; i < cols; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        // Brighter leading char
        const isLead = drops[i] > 0 && drops[i] % 8 < 1;
        ctx.fillStyle = isLead ? '#fff' : COLORS[Math.floor(Math.random() * COLORS.length)];
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.972) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="matrix-rain" />;
}
