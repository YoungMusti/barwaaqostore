import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onResult: (text: string) => void;
}

export function VoiceSearch({ onResult }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed. Try again.');
    };
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      toast.success(`Searching for "${text}"`);
    };

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={startListening}
      className={`p-1.5 rounded-full transition-colors ${
        isListening 
          ? 'bg-destructive text-destructive-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
      title="Voice search"
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <MicOff className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Mic className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
