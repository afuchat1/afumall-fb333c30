import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive',
      });
      return;
    }

    if (!user && !reviewerName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        product_id: productId,
        user_id: user?.id || null,
        rating,
        comment: comment.trim() || null,
        reviewer_name: user ? 'Verified Customer' : reviewerName.trim(),
      };

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
      });

      // Reset form
      setRating(0);
      setComment('');
      setReviewerName('');
      onReviewSubmitted();
    } catch (error: any) {
      toast({
        title: 'Error submitting review',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted hover:text-yellow-400'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStars()}
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="reviewerName">Your Name *</Label>
              <Input
                id="reviewerName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};