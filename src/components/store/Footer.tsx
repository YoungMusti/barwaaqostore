import { Phone, Clock, CreditCard, Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { NewsletterSignup } from './NewsletterSignup';
import { AnimatedSocialIcons } from './AnimatedSocialIcons';
import { PaymentMethodIcons } from './PaymentMethodIcons';
import { motion } from 'framer-motion';
import barwaaqoLogo from '@/assets/barwaaqo-logo.png';

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
      className="relative overflow-hidden py-12 mt-12"
      style={{
        background: 'linear-gradient(135deg, hsl(220 25% 10%) 0%, hsl(225 30% 15%) 50%, hsl(15 30% 18%) 100%)'
      }}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-[80px]" />
      
      <div className="container relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <img src={barwaaqoLogo} alt="Barwaaqo Store" className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1" />
              <h3 className="font-display text-2xl font-bold text-white">Barwaaqo Store</h3>
            </div>
            <p className="text-white/70 text-sm mb-4">
              {language === 'so' 
                ? 'Kabo tayada sare oo qiimo jaban ah.' 
                : 'Premium footwear at affordable prices.'
              }
            </p>
            <p className="text-xs text-white/50 mb-4">
              Powered by <span className="font-semibold text-primary">Barwaaqo Group</span>
            </p>
            
            {/* Social Icons */}
            <AnimatedSocialIcons icons={socialIcons} />
            
            {/* Newsletter Signup */}
            <NewsletterSignup />
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <Phone className="w-4 h-4 text-primary" />
              {language === 'so' ? 'Nala Soo Xiriir' : 'Contact Us'}
            </h4>
            <div className="space-y-2 text-sm text-white/70">
              <motion.p 
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <span className="font-medium text-white">
                  {language === 'so' ? 'Telefon:' : 'Phone:'}
                </span>
                +252 612502108
              </motion.p>
              <motion.p 
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <span className="font-medium text-white">WhatsApp:</span>
                +252 612502108
              </motion.p>
            </div>
          </motion.div>

          {/* Hours & Payment */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-accent" />
              {language === 'so' ? 'Saacadaha Shaqada' : 'Business Hours'}
            </h4>
            <p className="text-sm text-white/70 mb-4">7:00 AM - 10:00 PM</p>

            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <CreditCard className="w-4 h-4 text-success" />
              {language === 'so' ? 'Qaabka Lacag Bixinta' : 'Payment Methods'}
            </h4>
            <PaymentMethodIcons />
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/50"
        >
          © {new Date().getFullYear()} Barwaaqo Store. {language === 'so' ? 'Xuquuqda oo dhan waa la ilaaliyey.' : 'All rights reserved.'}
        </motion.div>
      </div>
    </motion.footer>
  );
}
