import { useRef, useEffect } from 'react';
import { Wind } from 'lucide-react';
import { aqiColor, aqiLabel } from '@/lib/aqi';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  speed: number;
}

interface Props {
  aqi: number;
  city?: string;
  className?: string;
}

export const AqiCanvas = ({ aqi, city, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const aqiRef = useRef<number>(aqi);

  aqiRef.current = aqi;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const PARTICLE_COUNT = 90;

    const createParticle = (initial = false): Particle => {
      const aqiVal = aqiRef.current;
      const intensity = Math.min(aqiVal / 200, 1.5);
      const baseSpeed = 0.4 + intensity * 1.2;
      const angle = (Math.random() - 0.5) * 0.3;
      const speed = baseSpeed + Math.random() * 1.5;

      return {
        x: initial ? Math.random() * width : -20,
        y: Math.random() * height,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle) + (Math.random() - 0.5) * 0.4,
        life: 0,
        maxLife: 200 + Math.random() * 200,
        size: 0.6 + Math.random() * 1.8 + intensity * 0.5,
        speed,
      };
    };

    // Seed initial particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(true));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const aqiVal = aqiRef.current;
      const color = aqiColor(aqiVal);
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const intensity = Math.min(aqiVal / 200, 1.5);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.02)`);
      bgGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.05)`);
      bgGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.01)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Slight vertical drift simulating air currents
        p.vy += (Math.random() - 0.5) * 0.03;
        p.vy = Math.max(-1.2, Math.min(1.2, p.vy));

        const lifeRatio = p.life / p.maxLife;
        // Fade in then out
        const alpha = lifeRatio < 0.15
          ? (lifeRatio / 0.15) * 0.7
          : (1 - (lifeRatio - 0.15) / 0.85) * 0.7;

        // Draw trailing line
        const trailLen = 8 + p.speed * 6 + intensity * 4;
        const grad = ctx.createLinearGradient(
          p.x - p.vx * trailLen, p.y - p.vy * trailLen,
          p.x, p.y,
        );
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * trailLen, p.y - p.vy * trailLen);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Glow dot at head
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Reset particle when it leaves screen or dies
        if (p.x > width + 30 || p.life > p.maxLife || p.y < -30 || p.y > height + 30) {
          particles[i] = createParticle(false);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  const color = aqiColor(aqi);
  const label = aqiLabel(aqi);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${className ?? ''}`}
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, rgb(var(--surface)) 60%)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          maskImage: 'linear-gradient(#000 86%, transparent)',
          WebkitMaskImage: 'linear-gradient(#000 86%, transparent)',
        }}
      />
      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
          style={{ background: color + '20', boxShadow: `0 0 60px ${color}30` }}
        >
          <Wind className="w-9 h-9" style={{ color }} />
        </div>
        <div className="text-5xl font-bold" style={{ color, fontFamily: 'var(--font-display)' }}>
          {aqi}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color }}>
          {label}
        </div>
        {city && <div className="text-xs text-muted mt-0.5">{city}</div>}
      </div>
    </div>
  );
};
