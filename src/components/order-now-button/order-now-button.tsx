"use client";

import { useEffect, useState, useCallback } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
  size: number;
  shape: "circle" | "square" | "star" | "confetti";
}

interface ConfettiExplosionProps {
  onComplete: () => void;
}

const colors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#d946ef", "#f43f5e", "#fbbf24", "#fb923c",
];

const shapes = ["circle", "square", "star", "confetti"] as const;

function ConfettiExplosion({ onComplete }: ConfettiExplosionProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>(() => {
    const newPieces: ConfettiPiece[] = [];
    const numPieces = 50;

    for (let i = 0; i < numPieces; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = 3 + Math.random() * 8;

      newPieces.push({
        id: i,
        x: 50,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        velocity: {
          x: Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1),
          y: Math.sin(angle) * velocity - 5,
        },
        size: 8 + Math.random() * 12,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    return newPieces;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPieces((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocity.x * 0.5,
            y: p.y + p.velocity.y * 0.5,
            velocity: {
              x: p.velocity.x * 0.98,
              y: p.velocity.y + 0.3,
            },
            rotation: p.rotation + p.velocity.x * 2,
          }))
          .filter((p) => p.y < 120);
      });
    }, 16);

    setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 2000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute transition-transform"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "star" ? "0" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
            boxShadow: piece.shape === "star" 
              ? `0 0 ${piece.size}px ${piece.color}` 
              : "none",
            clipPath: piece.shape === "star" 
              ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" 
              : piece.shape === "confetti"
              ? "polygon(0 0, 100% 0, 100% 100%)"
              : "none",
          }}
        />
      ))}
    </div>
  );
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

interface OrderNowButtonProps {
  onClick: () => void;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function OrderNowButton({ onClick, theme }: OrderNowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const handleClick = () => {
    setShowConfetti(true);
    
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 12; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 300,
      });
    }
    setSparkles(newSparkles);
    
    onClick();
  };

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
    setSparkles([]);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative px-16 py-7 rounded-2xl font-extrabold text-3xl text-white transition-all duration-300 hover:-translate-y-2 overflow-visible"
        style={{
          background: isHovered
            ? `linear-gradient(180deg, ${theme.accent} 0%, ${theme.secondary} 100%)`
            : `linear-gradient(180deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
          boxShadow: isHovered
            ? `0 12px 0 ${theme.secondary}, 0 20px 40px ${theme.secondary}80, 0 0 30px ${theme.accent}60`
            : `0 8px 0 ${theme.primary}, 0 12px 25px ${theme.primary}60`,
        }}
      >
        <span className="flex items-center gap-4 relative z-10">
          <span 
            className="text-4xl filter drop-shadow-sm transition-transform duration-300"
            style={{ 
              transform: isHovered ? "scale(1.3) rotate(-10deg)" : "scale(1)",
            }}
          >
            👕
          </span>
          <span 
            className="tracking-widest transition-all duration-300"
            style={{ 
              color: isHovered ? "#fef08a" : "white",
              textShadow: isHovered ? `0 0 20px ${theme.accent}` : "none",
            }}
          >
            ORDER NOW
          </span>
          <span 
            className="text-4xl filter drop-shadow-sm transition-transform duration-300"
            style={{ 
              transform: isHovered ? "scale(1.3) rotate(10deg)" : "scale(1)",
            }}
          >
            ✨
          </span>
        </span>

        {/* Hover gradient overlay */}
        <div 
          className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Bottom shadow on hover */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/30 blur-2xl rounded-full transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? "scale(1.2)" : "scale(1)",
          }}
        />

        {/* Sparkle effects on click */}
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="absolute text-2xl animate-ping"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}ms`,
            }}
          >
            ✨
          </span>
        ))}
      </button>

      {showConfetti && <ConfettiExplosion onComplete={handleConfettiComplete} />}
    </>
  );
}

export default OrderNowButton;
