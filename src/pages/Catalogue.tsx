import { useState, useEffect } from 'react';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { BackToTop } from '@/components/store/BackToTop';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { FileText, Eye, Loader2, Footprints, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Catalogue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pdf_url: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'men', labelEn: "Men's Shoes", labelSo: "Kabaha Ragga", icon: Footprints },
  { id: 'women', labelEn: "Women's Shoes", labelSo: "Kabaha Dumarka", icon: Footprints },
  { id: 'kids', labelEn: "Kids' Shoes", labelSo: "Kabaha Carruurta", icon: Footprints },
  { id: 'sports', labelEn: "Sports Shoes", labelSo: "Kabaha Isboortiga", icon: Footprints },
  { id: 'football', labelEn: "Football Kits", labelSo: "Dharka Kubadda", icon: Shirt },
];

export default function Catalogue() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchCatalogues();
  }, []);

  async function fetchCatalogues() {
    const { data, error } = await supabase
      .from('catalogues')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCatalogues(data);
    setIsLoading(false);
  }

  const getCategoryLabel = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? (language === 'so' ? cat.labelSo : cat.labelEn) : catId;
  };

  const filteredCatalogues = selectedCategory 
    ? catalogues.filter(c => c.category === selectedCategory)
    : catalogues;

  const cataloguesByCategory = CATEGORIES.map(cat => ({
    ...cat,
    items: catalogues.filter(c => c.category === cat.id)
  })).filter(cat => cat.items.length > 0 || selectedCategory === cat.id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {language === 'so' ? 'Buug-yaraha Alaabta' : 'Product Catalogues'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'so' 
              ? 'Baadhid buug-yaraha alaabteena si aad u aragto waxa aanu bixino' 
              : 'Browse our product catalogues to see what we offer before ordering'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            {language === 'so' ? 'Dhammaan' : 'All'}
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full gap-2"
            >
              <cat.icon className="w-4 h-4" />
              {language === 'so' ? cat.labelSo : cat.labelEn}
            </Button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : catalogues.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {language === 'so' ? 'Buug-yar ma jiro weli' : 'No catalogues available yet'}
            </p>
          </motion.div>
        ) : selectedCategory ? (
          // Filtered view - flat grid
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCatalogues.map(catalogue => (
              <CatalogueCard 
                key={catalogue.id} 
                catalogue={catalogue} 
                language={language}
                variants={itemVariants}
              />
            ))}
            {filteredCatalogues.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'so' ? 'Buug-yar laguma helin qaybtan' : 'No catalogues in this category'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // All categories view - grouped sections
          <div className="space-y-12">
            {cataloguesByCategory.map(cat => (
              <motion.section
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">
                    {language === 'so' ? cat.labelSo : cat.labelEn}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({cat.items.length})
                  </span>
                </div>
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {cat.items.map(catalogue => (
                    <CatalogueCard 
                      key={catalogue.id} 
                      catalogue={catalogue} 
                      language={language}
                      variants={itemVariants}
                    />
                  ))}
                </motion.div>
              </motion.section>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}

interface CatalogueCardProps {
  catalogue: Catalogue;
  language: string;
  variants?: any;
}

function CatalogueCard({ catalogue, language, variants }: CatalogueCardProps) {
  const handleView = () => {
    window.open(catalogue.pdf_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all"
    >
      {/* PDF Preview Header */}
      <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
        <FileText className="w-16 h-16 text-primary/40" />
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1">
          {catalogue.title}
        </h3>
        {catalogue.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {catalogue.description}
          </p>
        )}
        <Button 
          onClick={handleView}
          className="w-full gap-2 rounded-full"
        >
          <Eye className="w-4 h-4" />
          {language === 'so' ? 'Arag Buug-yarka' : 'View Catalogue'}
        </Button>
      </div>
    </motion.div>
  );
}
