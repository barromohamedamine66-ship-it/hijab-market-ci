'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';

interface FollowButtonProps {
  shopId: string;
  className?: string;
}

export default function FollowButton({ shopId, className = '' }: FollowButtonProps) {
  const { user } = useAuth();
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      DBService.hasFollowed(shopId, user.id).then(setFollowed);
    }
  }, [shopId, user?.id]);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (loading) return;
    setLoading(true);

    // Optimistic UI
    setFollowed(!followed);
    
    const isNowFollowed = await DBService.toggleFollow(shopId, user.id);
    setFollowed(isNowFollowed);
    setLoading(false);
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm shadow-sm ${
        followed 
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
          : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-md hover:-translate-y-0.5'
      } ${className}`}
      title={followed ? "Se désabonner" : "S'abonner"}
    >
      {followed ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      <span>{followed ? 'Abonné(e)' : "S'abonner"}</span>
    </button>
  );
}
