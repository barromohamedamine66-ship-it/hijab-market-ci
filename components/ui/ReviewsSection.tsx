'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    DBService.getProductReviews(productId).then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      await DBService.addReview(productId, user.id, rating, newComment.trim());
      // Refresh reviews
      const updatedReviews = await DBService.getProductReviews(productId);
      setReviews(updatedReviews);
      setNewComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-heading text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> 
          Avis Clients ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{avgRating}</span>
            <div className="flex text-amber-400">
              {'★'.repeat(Math.round(Number(avgRating)))}
              <span className="text-gray-300">{'★'.repeat(5 - Math.round(Number(avgRating)))}</span>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Laissez votre avis</h4>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Votre note :</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience (facultatif)..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-amber-500 outline-none text-sm transition resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="absolute right-2 bottom-2 p-2 bg-gray-900 text-white rounded-xl hover:bg-amber-500 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl text-center text-sm text-gray-500">
          Veuillez vous <a href="/auth/login" className="text-emerald-600 font-bold hover:underline">connecter</a> pour laisser un avis.
        </div>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Soyez le premier à donner votre avis sur cet article !
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, i) => (
            <div key={review.id || i} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 font-bold text-sm overflow-hidden border border-gray-200">
                {review.user?.avatar_url ? (
                  <img src={review.user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  review.user?.full_name?.[0]?.toUpperCase() || 'C'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{review.user?.full_name || 'Client anonyme'}</span>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(review.rating)}
                    <span className="text-gray-200">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 mb-2">
                  {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl inline-block">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
