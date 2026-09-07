'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';

interface LikeButtonProps {
  productId: string;
  className?: string;
}

export default function LikeButton({ productId, className = '' }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      DBService.hasLiked(productId, user.id).then(setLiked);
    }
  }, [productId, user?.id]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    e.stopPropagation();

    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (loading) return;
    setLoading(true);

    // Optimistic UI
    setLiked(!liked);
    
    const isNowLiked = await DBService.toggleLike(productId, user.id);
    setLiked(isNowLiked);
    setLoading(false);
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        liked 
          ? 'bg-rose-100 text-rose-500 scale-110 shadow-sm' 
          : 'bg-white/80 text-gray-400 hover:bg-rose-50 hover:text-rose-400 backdrop-blur-sm'
      } ${className}`}
      title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-current' : ''}`} />
    </button>
  );
}
