import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CountdownTimerProps {
  endDate?: Date;
  label?: string;
}

export function CountdownTimer({ endDate, label }: CountdownTimerProps) {
  const { language } = useLanguage();
  
  // Default to end of current day if no date provided
  const targetDate = endDate || new Date(new Date().setHours(23, 59, 59, 999));
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="w-12 h-12 md:w-14 md:h-14 bg-foreground text-background rounded-lg flex items-center justify-center font-bold text-lg md:text-xl"
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-destructive animate-pulse" />
        <span className="text-sm font-medium text-destructive">
          {label || (language === 'so' ? 'Qiimaha maanta oo kaliya!' : 'Today\'s deal ends in:')}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TimeBlock value={timeLeft.hours} label={language === 'so' ? 'Saac' : 'HRS'} />
        <span className="text-2xl font-bold text-foreground">:</span>
        <TimeBlock value={timeLeft.minutes} label={language === 'so' ? 'Daqiiqo' : 'MIN'} />
        <span className="text-2xl font-bold text-foreground">:</span>
        <TimeBlock value={timeLeft.seconds} label={language === 'so' ? 'Ilbiriqsi' : 'SEC'} />
      </div>
    </div>
  );
}
