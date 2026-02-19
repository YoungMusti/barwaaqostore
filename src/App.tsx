import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import { WishlistProvider } from "@/hooks/useWishlist";
import { RecentlyViewedProvider } from "@/hooks/useRecentlyViewed";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/components/store/CurrencyToggle";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { AnimatePresence, motion } from 'framer-motion';
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.3,
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <TooltipProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <CartProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AnimatedRoutes />
                    <MobileBottomNav />
                  </BrowserRouter>
                </CartProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
