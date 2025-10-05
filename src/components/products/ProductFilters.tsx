import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterOptions {
  priceRange: [number, number];
  inStock: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isFlashSale: boolean;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  maxPrice: number;
}

export const ProductFilters = ({ filters, onFiltersChange, maxPrice }: ProductFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, maxPrice],
      inStock: false,
      isNewArrival: false,
      isFeatured: false,
      isPopular: false,
      isFlashSale: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto font-sans">
        <SheetHeader>
          <SheetTitle className="font-heading">Filter Products</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Price Range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
            </Label>
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={localFilters.priceRange}
              onValueChange={(value) => 
                setLocalFilters({ ...localFilters, priceRange: value as [number, number] })
              }
              className="w-full"
            />
          </div>

          {/* Stock Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Availability</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={localFilters.inStock}
                onCheckedChange={(checked) => 
                  setLocalFilters({ ...localFilters, inStock: checked as boolean })
                }
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                In Stock Only
              </label>
            </div>
          </div>

          {/* Product Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Product Tags</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newArrival"
                  checked={localFilters.isNewArrival}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ ...localFilters, isNewArrival: checked as boolean })
                  }
                />
                <label htmlFor="newArrival" className="text-sm">New Arrivals</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={localFilters.isFeatured}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ ...localFilters, isFeatured: checked as boolean })
                  }
                />
                <label htmlFor="featured" className="text-sm">Featured</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="popular"
                  checked={localFilters.isPopular}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ ...localFilters, isPopular: checked as boolean })
                  }
                />
                <label htmlFor="popular" className="text-sm">Popular</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flashSale"
                  checked={localFilters.isFlashSale}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ ...localFilters, isFlashSale: checked as boolean })
                  }
                />
                <label htmlFor="flashSale" className="text-sm">Flash Sale</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleResetFilters} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};