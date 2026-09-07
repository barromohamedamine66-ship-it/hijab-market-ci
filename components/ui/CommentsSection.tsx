'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';

interface CommentsSectionProps {
  productId: string;
}

export default function CommentsSection({ productId }: CommentsSectionProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    DBService.getComments(productId).then(data => {
      setComments(data);
      setLoading(false);
    });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setSubmitting(true);
    const userName = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur';
    
    try {
      const addedComment = await DBService.addComment(productId, user.id, userName, newComment.trim());
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 mt-8">
      <h3 className="text-xl font-bold font-heading text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-emerald-600" /> 
        Avis & Commentaires ({comments.length})
      </h3>

      {/* Formulaire d'ajout */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition resize-none"
              required
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl text-center text-sm text-gray-500">
          Veuillez vous <a href="/auth/login" className="text-emerald-600 font-bold hover:underline">connecter</a> pour laisser un commentaire.
        </div>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Aucun commentaire pour l'instant. Soyez le premier à donner votre avis !
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment, i) => (
            <div key={comment.id || i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 font-bold text-sm">
                {comment.user_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{comment.user_name}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
