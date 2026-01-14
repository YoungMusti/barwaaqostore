import { Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ProductReviewsProps {
  productId: string;
}

// Mock reviews - in production, these would come from database
const mockReviews = [
  { id: '1', name: 'Ahmed M.', rating: 5, comment: 'Excellent quality shoes!', date: '2024-01-10' },
  { id: '2', name: 'Fatima A.', rating: 4, comment: 'Very comfortable, fast delivery.', date: '2024-01-08' },
  { id: '3', name: 'Hassan O.', rating: 5, comment: 'Best trainers I\'ve bought!', date: '2024-01-05' },
];

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { language } = useLanguage();
  
  // Use productId to get specific reviews (mock for now)
  const reviews = mockReviews.slice(0, 3);
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">
          {language === 'so' ? 'Faallooyinka' : 'Reviews'}
        </h4>
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-1">
            ({reviews.length})
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{review.name}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}
