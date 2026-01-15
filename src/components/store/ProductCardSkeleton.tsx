import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      {/* Image skeleton with shimmer */}
      <div className="aspect-square relative overflow-hidden bg-secondary/50">
        <Skeleton className="w-full h-full animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 animate-shimmer" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full animate-shimmer" />
          ))}
        </div>
        <Skeleton className="h-4 w-full animate-shimmer" />
        <Skeleton className="h-4 w-2/3 animate-shimmer" />
        <Skeleton className="h-6 w-20 animate-shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
