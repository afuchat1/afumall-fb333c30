import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCarouselProps {
  products: Product[];
  loading?: boolean;
}

export const ProductCarousel = ({ products, loading }: ProductCarouselProps) => {
  if (loading) {
    return (
      <div className="relative">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {[...Array(8)].map((_, i) => (
              <CarouselItem key={i} className="pl-2 md:pl-3 basis-[45%] sm:basis-[30%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%]">
                <Skeleton className="aspect-[3/4] rounded-lg" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No products available.</p>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in">
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {products.map((product, index) => (
            <CarouselItem 
              key={product.id} 
              className="pl-2 md:pl-3 basis-[45%] sm:basis-[30%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%]"
              style={{
                animation: `fade-in 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4 hover:scale-110 transition-transform" />
        <CarouselNext className="hidden md:flex -right-4 hover:scale-110 transition-transform" />
      </Carousel>
    </div>
  );
};
