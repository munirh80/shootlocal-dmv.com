import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Star, ThumbsUp, User, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBar = ({ label, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-slate-500">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review, onHelpful }) => {
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleHelpful = () => {
    if (!helpfulClicked) {
      setHelpfulClicked(true);
      onHelpful(review.id);
    }
  };
  
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <div className="font-medium">{review.reviewer_name}</div>
            <div className="text-sm text-slate-500">{formatDate(review.created_at)}</div>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>
      
      <p className="text-slate-700 dark:text-slate-300 mb-3">{review.comment}</p>
      
      <button
        onClick={handleHelpful}
        disabled={helpfulClicked}
        className={`flex items-center gap-1 text-sm ${
          helpfulClicked 
            ? 'text-orange-500' 
            : 'text-slate-500 hover:text-orange-500'
        } transition-colors`}
      >
        <ThumbsUp className="w-4 h-4" />
        Helpful ({review.helpful_count + (helpfulClicked ? 1 : 0)})
      </button>
    </div>
  );
};

const ReviewForm = ({ rangeId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a review');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.post(`${API_URL}/api/reviews`, {
        range_id: rangeId,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim()
      });
      
      toast.success('Review submitted! Thank you for your feedback.');
      setRating(0);
      setName('');
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Rating</Label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>
      
      <div>
        <Label htmlFor="reviewer-name">Your Name</Label>
        <Input
          id="reviewer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John D."
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="review-comment">Your Review</Label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience at this range..."
          rows={4}
          className="mt-1 w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={submitting}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {submitting ? 'Submitting...' : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
};

const RangeReviews = ({ rangeId, rangeName }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const loadReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/${rangeId}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch {
      // Reviews failed to load, continue without them
    } finally {
      setLoading(false);
    }
  }, [rangeId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);
  
  const handleHelpful = async (reviewId) => {
    try {
      await axios.post(`${API_URL}/api/reviews/${reviewId}/helpful`);
    } catch {
      // Failed to mark helpful, fail silently
    }
  };
  
  if (loading) {
    return (
      <Card className="tactical-card">
        <CardContent className="py-8 text-center text-slate-500">
          Loading reviews...
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="reviews-section" className="tactical-card">
      <CardHeader>
        <CardTitle className="tactical-heading flex items-center justify-between">
          <span className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Reviews & Ratings
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Rating Summary */}
        {stats && stats.total_reviews > 0 && (
          <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500">{stats.average_rating}</div>
              <StarRating rating={Math.round(stats.average_rating)} readonly size="md" />
              <div className="text-sm text-slate-500 mt-1">
                {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <RatingBar label="5★" count={stats.distribution['5']} total={stats.total_reviews} />
              <RatingBar label="4★" count={stats.distribution['4']} total={stats.total_reviews} />
              <RatingBar label="3★" count={stats.distribution['3']} total={stats.total_reviews} />
              <RatingBar label="2★" count={stats.distribution['2']} total={stats.total_reviews} />
              <RatingBar label="1★" count={stats.distribution['1']} total={stats.total_reviews} />
            </div>
          </div>
        )}
        
        {/* Review Form */}
        {showForm && (
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold mb-4">Write Your Review</h3>
            <ReviewForm 
              rangeId={rangeId} 
              onReviewSubmitted={() => {
                loadReviews();
                setShowForm(false);
              }}
            />
          </div>
        )}
        
        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div>
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onHelpful={handleHelpful}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No reviews yet. Be the first to review {rangeName}!</p>
            {!showForm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Write a Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RangeReviews;
