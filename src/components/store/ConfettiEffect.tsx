import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  delay: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  '#FFD700',
  '#00CED1',
];

export function ConfettiEffect({ isActive, onComplete }: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.3,
        });
      }
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                opacity: 1,
                y: -20,
                x: `${piece.x}vw`,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: '100vh',
                rotate: piece.rotation * 3,
              }}
              transition={{
                duration: 2,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              className="absolute top-0 w-3 h-3"
              style={{
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
