import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

interface AISearchProps {
  onResults: (products: Product[]) => void;
  onLoading: (loading: boolean) => void;
}

export const AISearch = ({ onResults, onLoading }: AISearchProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Search failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      onResults(data.products || []);
      
      toast({
        title: "AI Search Complete",
        description: `Found ${data.products?.length || 0} relevant products`,
      });
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="AI-powered search (e.g., 'red dress for party', 'casual summer outfit')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10"
        />
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={isSearching}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {isSearching ? 'Searching...' : 'AI Search'}
      </Button>
    </div>
  );
};
