import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sizeData = [
  { eu: '36', us: '4', uk: '3.5', cm: '22.5' },
  { eu: '37', us: '5', uk: '4', cm: '23' },
  { eu: '38', us: '6', uk: '5', cm: '24' },
  { eu: '39', us: '7', uk: '6', cm: '24.5' },
  { eu: '40', us: '7.5', uk: '6.5', cm: '25' },
  { eu: '41', us: '8', uk: '7', cm: '26' },
  { eu: '42', us: '9', uk: '8', cm: '26.5' },
  { eu: '43', us: '10', uk: '9', cm: '27.5' },
  { eu: '44', us: '11', uk: '10', cm: '28' },
  { eu: '45', us: '12', uk: '11', cm: '29' },
  { eu: '46', us: '13', uk: '12', cm: '30' },
];

export function SizeGuideModal({ open, onOpenChange }: SizeGuideModalProps) {
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {language === 'so' ? 'Hagaha Cabbirka' : 'Size Guide'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'so' 
              ? 'Isbarbar dhig cabbirka kala duwan ee kabaha.'
              : 'Compare different shoe size standards.'
            }
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left font-semibold">EU</th>
                  <th className="py-2 px-3 text-left font-semibold">US</th>
                  <th className="py-2 px-3 text-left font-semibold">UK</th>
                  <th className="py-2 px-3 text-left font-semibold">CM</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((size, index) => (
                  <tr 
                    key={size.eu} 
                    className={index % 2 === 0 ? 'bg-secondary/30' : ''}
                  >
                    <td className="py-2 px-3 font-medium">{size.eu}</td>
                    <td className="py-2 px-3 text-muted-foreground">{size.us}</td>
                    <td className="py-2 px-3 text-muted-foreground">{size.uk}</td>
                    <td className="py-2 px-3 text-muted-foreground">{size.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {language === 'so'
                ? '💡 Talooyin: Qiyaas cagahaaga habeenkii marka ay ku weyn yihiin. Haddii aad u dhexeyso laba cabbir, dooro midka weyn.'
                : '💡 Tip: Measure your feet in the evening when they are largest. If between sizes, choose the larger one.'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
