import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
}

interface Firework {
  x: number;
  y: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  exploded: boolean;
  particles: Particle[];
}

export default function Fireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworks = useRef<Firework[]>([]);
  const animRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const COLORS = [
      '#ff69b4', '#ff1493', '#ffb6d9', '#f472b6',
      '#c084fc', '#fbbf24', '#fb923c', '#34d399',
      '#60a5fa', '#fff', '#ff85c2'
    ];

    const explode = (fw: Firework) => {
      const count = 80 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 2 + Math.random() * 4;
        fw.particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 2 + Math.random() * 3,
          gravity: 0.04 + Math.random() * 0.04,
        });
      }
      fw.exploded = true;
    };

    const spawnFirework = () => {
      const x = 0.2 * canvas.width + Math.random() * 0.6 * canvas.width;
      fireworks.current.push({
        x,
        y: canvas.height,
        vy: -(12 + Math.random() * 6),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        trail: [],
        exploded: false,
        particles: [],
      });
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fireworks.current = fireworks.current.filter(fw => {
        if (!fw.exploded) {
          fw.trail.push({ x: fw.x, y: fw.y });
          if (fw.trail.length > 8) fw.trail.shift();

          fw.trail.forEach((pt, i) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${(i / fw.trail.length) * 0.6})`;
            ctx.fill();
          });

          fw.y += fw.vy;
          fw.vy += 0.15;

          if (fw.vy >= -3 || fw.y < canvas.height * 0.35) {
            explode(fw);
          }
        } else {
          fw.particles = fw.particles.filter(p => p.alpha > 0.02);
          fw.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.alpha -= 0.014;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
            ctx.fill();
          });

          if (fw.particles.length === 0) return false;
        }
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    if (active) {
      draw();
      intervalRef.current = setInterval(spawnFirework, 600);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      id="fireworks-canvas"
      style={{ display: active ? 'block' : 'none' }}
    />
  );
}
