import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/hooks/useLanguage';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    questionEn: 'How do I pay for my order?',
    questionSo: 'Sideen u bixin karaa dalabkeyga?',
    answerEn: 'We accept EVC Plus and Zaad (E-Dahab) mobile payments. Simply complete your order and send payment to our merchant number, then enter your reference.',
    answerSo: 'Waxaan aqbalnaa EVC Plus iyo Zaad (E-Dahab). Dhamaystir dalabkaaga oo lacagta u dir lambarka ganacsigayaga, kadib geli tixraaca.',
  },
  {
    questionEn: 'What is your return policy?',
    questionSo: 'Maxay tahay siyaasadda soo celinta?',
    answerEn: 'We offer exchanges within 7 days for unworn items in original packaging. Contact us on WhatsApp to arrange.',
    answerSo: 'Waxaan bixinaa bedelid 7 maalmood gudahood alaab aan la xidhin oo xirmo asal ah ku jirto. Nala soo xiriir WhatsApp.',
  },
  {
    questionEn: 'How long does delivery take?',
    questionSo: 'Gaadiidku intee le\'eg buu qaataa?',
    answerEn: 'Mogadishu: Same day or next day. Other regions: 2-5 business days depending on location.',
    answerSo: 'Muqdisho: Maalinta ama maalinta danbe. Gobolada kale: 2-5 maalmood shaqo iyadoo ku xiran goobta.',
  },
  {
    questionEn: 'Are your products authentic?',
    questionSo: 'Alaabtiinnu ma run bay tahay?',
    answerEn: 'Yes! We source all products from verified suppliers and guarantee authenticity. Every item is quality-checked before shipping.',
    answerSo: 'Haa! Alaabta oo dhan waxaan ka helnaa bixiyayaal la xaqiijiyey waxaanan damaanad qaadnaa saxnimada. Alaab kasta tayada ayaa la hubiyaa ka hor dirida.',
  },
  {
    questionEn: 'Can I track my order?',
    questionSo: 'Ma raad raaci karaa dalabkeyga?',
    answerEn: 'Yes! After placing your order, you\'ll receive updates via WhatsApp. You can also contact us anytime for order status.',
    answerSo: 'Haa! Ka dib dalabkaaga, waxaad heli doontaa cusbooneysiin WhatsApp. Waxaad sidoo kale nala soo xiriiri kartaa waqti kasta.',
  },
];

export function FAQSection() {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'so' ? 'Su\'aalaha inta badan la isweydiiyo' : 'Frequently Asked Questions'}
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold">
            {language === 'so' ? 'Jawaabahaaga' : 'Your Questions, Answered'}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-4 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left py-4 hover:no-underline">
                  <span className="font-medium pr-4">
                    {language === 'so' ? faq.questionSo : faq.questionEn}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {language === 'so' ? faq.answerSo : faq.answerEn}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
