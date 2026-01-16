import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

const paymentMethods = [
  { name: 'EVC Plus', icon: Smartphone },
  { name: 'Cash', icon: Banknote },
  { name: 'Card', icon: CreditCard },
];

export function PaymentMethodIcons() {
  return (
    <div className="flex gap-3">
      {paymentMethods.map((method, index) => (
        <motion.div
          key={method.name}
          initial={{ opacity: 0.5 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/10 text-background/70 hover:text-background cursor-pointer transition-all"
        >
          <method.icon className="w-4 h-4" />
          <span className="text-xs font-medium">{method.name}</span>
        </motion.div>
      ))}
    </div>
  );
}
