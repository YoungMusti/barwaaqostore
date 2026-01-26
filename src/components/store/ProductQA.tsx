import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { MessageCircle, Send, ChevronDown, User } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  answer?: string;
  askedBy: string;
  createdAt: Date;
}

// Mock questions - in production, these would come from database
const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'Is this shoe true to size?',
    answer: 'Yes, these run true to size. We recommend ordering your regular size.',
    askedBy: 'Customer',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    question: 'What material is the upper made of?',
    answer: 'The upper is made of premium synthetic leather with mesh panels for breathability.',
    askedBy: 'Customer',
    createdAt: new Date('2024-01-10'),
  },
];

interface ProductQAProps {
  productId: string;
}

export function ProductQA({ productId }: ProductQAProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [questions] = useState<Question[]>(mockQuestions);

  const handleSubmit = () => {
    if (!question.trim()) {
      toast.error(language === 'so' ? 'Fadlan qor su\'aal' : 'Please enter a question');
      return;
    }

    // In production, this would save to database
    toast.success(
      language === 'so' 
        ? 'Su\'aashaada waa la diray!' 
        : 'Your question has been submitted!'
    );
    setQuestion('');
    setShowForm(false);
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">
            {language === 'so' ? "Su'aalaha & Jawaabaha" : 'Questions & Answers'}
          </h4>
          <span className="text-sm text-muted-foreground">({questions.length})</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Questions list */}
              {questions.map((q) => (
                <div key={q.id} className="p-4 bg-secondary/50 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {q.askedBy} • {q.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {q.answer && (
                    <div className="ml-8 p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">{q.answer}</p>
                      <p className="text-xs text-primary mt-1">
                        — Barwaaqo Store
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Ask question button / form */}
              {!showForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {language === 'so' ? "Weydii su'aal" : 'Ask a Question'}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder={
                      language === 'so' 
                        ? "Qor su'aashaada halkan..." 
                        : 'Type your question here...'
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      {language === 'so' ? 'Jooji' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {language === 'so' ? 'Dir' : 'Submit'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
