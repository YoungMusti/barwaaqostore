import { Phone, Clock, CreditCard, Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { NewsletterSignup } from './NewsletterSignup';
import { AnimatedSocialIcons } from './AnimatedSocialIcons';
import { PaymentMethodIcons } from './PaymentMethodIcons';
import { motion } from 'framer-motion';

export function Footer() {
  const { language } = useLanguage();

  const socialIcons = [
    { href: 'https://instagram.com', icon: <Instagram className="w-5 h-5" />, label: 'Instagram' },
    { href: 'https://facebook.com', icon: <Facebook className="w-5 h-5" />, label: 'Facebook' },
    { href: 'https://twitter.com', icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-foreground text-background py-10 mt-12"
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <motion.div variants={itemVariants}>
            <h3 className="font-display text-xl font-bold mb-4">Barwaaqo Store</h3>
            <p className="text-background/70 text-sm mb-4">
              {language === 'so' 
                ? 'Kabo tayada sare oo qiimo jaban ah.' 
                : 'Premium footwear at affordable prices.'
              }
            </p>
            <p className="text-xs text-background/50 mb-4">
              Powered by <span className="font-semibold">Barwaaqo Group</span>
            </p>
            
            {/* Social Icons */}
            <AnimatedSocialIcons icons={socialIcons} />
            
            {/* Newsletter Signup */}
            <NewsletterSignup />
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {language === 'so' ? 'Nala Soo Xiriir' : 'Contact Us'}
            </h4>
            <div className="space-y-2 text-sm text-background/70">
              <motion.p 
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="font-medium text-background">
                  {language === 'so' ? 'Telefon:' : 'Phone:'}
                </span>
                +252 612502108
              </motion.p>
              <motion.p 
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="font-medium text-background">WhatsApp:</span>
                +252 612502108
              </motion.p>
            </div>
          </motion.div>

          {/* Hours & Payment */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'so' ? 'Saacadaha Shaqada' : 'Business Hours'}
            </h4>
            <p className="text-sm text-background/70 mb-4">7:00 AM - 10:00 PM</p>

            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {language === 'so' ? 'Qaabka Lacag Bixinta' : 'Payment Methods'}
            </h4>
            <PaymentMethodIcons />
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="border-t border-background/20 mt-8 pt-6 text-center text-xs text-background/50"
        >
          © {new Date().getFullYear()} Barwaaqo Store. {language === 'so' ? 'Xuquuqda oo dhan waa la ilaaliyey.' : 'All rights reserved.'}
        </motion.div>
      </div>
    </motion.footer>
  );
}
