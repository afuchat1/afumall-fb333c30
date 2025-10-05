import { useState } from 'react';
import { ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

export const ProductVariantSelector = ({
  variants,
  onVariantChange,
}: ProductVariantSelectorProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (!variants || variants.length === 0) {
    return null;
  }

  // Group variants by color and size
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    updateSelectedVariant(color, selectedSize);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    updateSelectedVariant(selectedColor, size);
  };

  const updateSelectedVariant = (color: string | null, size: string | null) => {
    const variant = variants.find(
      v => v.color === color && v.size === size
    );
    setSelectedVariant(variant || null);
    onVariantChange(variant || null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Color: {selectedColor && <span className="text-primary">{selectedColor}</span>}
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const variantForColor = variants.find(v => v.color === color);
              const isAvailable = variantForColor && variantForColor.stock > 0;
              
              return (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorSelect(color!)}
                  disabled={!isAvailable}
                  className={cn(
                    "transition-all hover:scale-105",
                    selectedColor === color && "border-primary bg-primary/10",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {color}
                  {!isAvailable && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Out
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Size: {selectedSize && <span className="text-primary">{selectedSize}</span>}
          </h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variantForSize = variants.find(
                v => v.size === size && (!selectedColor || v.color === selectedColor)
              );
              const isAvailable = variantForSize && variantForSize.stock > 0;
              
              return (
                <Button
                  key={size}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSizeSelect(size!)}
                  disabled={!isAvailable}
                  className={cn(
                    "transition-all hover:scale-105",
                    selectedSize === size && "border-primary bg-primary/10",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {size}
                  {!isAvailable && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Out
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="p-4 bg-muted rounded-lg space-y-2 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selected:</span>
            <Badge variant="secondary">
              {selectedVariant.color && `${selectedVariant.color}`}
              {selectedVariant.color && selectedVariant.size && ' - '}
              {selectedVariant.size && `${selectedVariant.size}`}
            </Badge>
          </div>
          
          {selectedVariant.price_adjustment !== 0 && (
            <div className="text-sm">
              Price adjustment: 
              <span className={cn(
                "ml-2 font-medium",
                selectedVariant.price_adjustment > 0 ? "text-sale" : "text-green-600"
              )}>
                {selectedVariant.price_adjustment > 0 ? '+' : ''}
                UGX {selectedVariant.price_adjustment.toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="text-sm">
            Stock: <span className="font-medium">{selectedVariant.stock} available</span>
          </div>
        </div>
      )}
    </div>
  );
};