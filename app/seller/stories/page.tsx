'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import { Play, Image as ImageIcon, Plus, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { Product, Shop, Story } from '@/lib/supabase/types';

export default function SellerStoriesPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const userStore = await DBService.getShopByOwner(user!.id);
    if (userStore) {
      setStore(userStore);
      const [storeProducts, allStories] = await Promise.all([
        DBService.getProducts({ store_id: userStore.id }),
        DBService.getStories()
      ]);
      setProducts(storeProducts);
      setStories(allStories.filter(s => s.shop_id === userStore.id));
    }
    setLoading(false);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !mediaUrl) return;

    setSubmitting(true);
    const newStory = await DBService.createStory({
      shop_id: store.id,
      product_id: selectedProductId || null,
      media_url: mediaUrl,
      media_type: mediaType
    });

    if (newStory) {
      setStories([newStory, ...stories]);
      setIsCreating(false);
      setMediaUrl('');
      setSelectedProductId('');
    }
    setSubmitting(false);
  };

  const handleDeleteStory = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette story ?')) {
      const success = await DBService.deleteStory(id);
      if (success) {
        setStories(stories.filter(s => s.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-heading">Mes Stories</h1>
          <p className="text-gray-500 text-sm mt-1">Publiez des photos ou vidéos éphémères pour animer votre boutique.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer une Story
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Nouvelle Story
          </h2>
          <form onSubmit={handleCreateStory} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Type de média
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-500" /> Image
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <Play className="w-4 h-4 text-gray-500" /> Vidéo (Max 15s)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Lien de l'image ou de la vidéo
              </label>
              <input
                type="url"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Astuce : Collez le lien direct de votre média. Bientôt, vous pourrez l'importer directement depuis votre téléphone.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Associer à un produit (Optionnel)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="input"
              >
                <option value="">-- Ne pas associer de produit --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString('fr-FR')} F)</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !mediaUrl}
              >
                {submitting ? 'Publication...' : 'Publier la Story'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des stories actives */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stories.map(story => {
          const product = products.find(p => p.id === story.product_id);
          const isExpired = new Date(story.expires_at) < new Date();

          return (
            <div key={story.id} className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-gray-100 shadow-sm border border-gray-200">
              <img
                src={story.media_url}
                alt="Story"
                className={`w-full h-full object-cover ${isExpired ? 'opacity-50 grayscale' : ''}`}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              {/* Statut */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                {isExpired ? (
                  <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                    Expirée
                  </span>
                ) : (
                  <span className="bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                    Active
                  </span>
                )}
                
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Produit lié */}
              {product && (
                <div className="absolute bottom-2 left-2 right-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                  <p className="text-white text-[10px] font-semibold truncate leading-tight">{product.name}</p>
                  <p className="text-emerald-300 text-[10px] font-bold">{product.price.toLocaleString('fr-FR')} F</p>
                </div>
              )}
            </div>
          );
        })}

        {stories.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Vous n'avez aucune story active.</p>
            <p className="text-sm text-gray-400 mt-1">Publiez votre première story pour attirer plus de clients !</p>
          </div>
        )}
      </div>
    </div>
  );
}
