'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import { Image as ImageIcon, Plus, Trash2, Loader2, Sparkles, Upload, X, CheckCircle2 } from 'lucide-react';
import type { Product, Shop, Story } from '@/lib/supabase/types';

export default function SellerStoriesPage() {
  const { user, shop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && shop) {
      loadData();
    } else if (user && shop === null) {
      setLoading(false);
    }
  }, [user, shop]);

  const loadData = async () => {
    setLoading(true);
    if (shop) {
      try {
        const [storeProducts, sellerStoriesRes] = await Promise.all([
          DBService.getProducts({ store_id: shop.id }),
          fetch('/api/seller/stories')
            .then((r) => (r.ok ? r.json() : { stories: [] }))
            .catch(() => ({ stories: [] })),
        ]);
        setProducts(storeProducts || []);
        if (sellerStoriesRes?.stories && Array.isArray(sellerStoriesRes.stories)) {
          setStories(sellerStoriesRes.stories);
        } else {
          const allStories = await DBService.getStories();
          setStories((allStories || []).filter((s) => s.shop_id === shop.id));
        }
      } catch (error) {
        console.error('Error loading stories data:', error);
      }
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const isImage = file.type.startsWith('image/');

    if (!isImage) {
      setErrorMsg('Veuillez sélectionner un fichier photo/image (JPG, PNG, WebP).');
      return;
    }

    // Limite image à 15 Mo
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("L'image dépasse la taille maximale autorisée de 15 Mo.");
      return;
    }

    setSelectedFile(file);

    // Aperçu local instantané
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setErrorMsg('');

    let finalMediaUrl = mediaUrl.trim();

    if (inputMode === 'file') {
      if (!selectedFile) {
        setErrorMsg('Veuillez sélectionner une photo depuis votre appareil.');
        return;
      }
      setSubmitting(true);
      try {
        const uploadedUrl = await DBService.uploadStoryMedia(selectedFile, shop.id);
        if (!uploadedUrl) {
          setErrorMsg("Impossible d'importer l'image. Essayez avec un fichier plus léger ou utilisez un lien direct.");
          setSubmitting(false);
          return;
        }
        finalMediaUrl = uploadedUrl;
      } catch (err: any) {
        setErrorMsg(err?.message || "Erreur lors du téléversement de la photo.");
        setSubmitting(false);
        return;
      }
    } else {
      if (!finalMediaUrl) {
        setErrorMsg('Veuillez indiquer un lien URL valide.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const newStory = await DBService.createStory({
        shop_id: shop.id,
        product_id: selectedProductId || null,
        media_url: finalMediaUrl,
        media_type: 'image',
      });

      if (newStory) {
        setStories([newStory, ...stories]);
        setIsCreating(false);
        setSelectedFile(null);
        setFilePreview('');
        setMediaUrl('');
        setSelectedProductId('');
      } else {
        setErrorMsg("Une erreur est survenue lors de la publication de la story.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de publication.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette story ?')) {
      const success = await DBService.deleteStory(id);
      if (success) {
        setStories(stories.filter((s) => s.id !== id));
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
          <h1 className="text-2xl font-extrabold text-gray-900 font-heading flex items-center gap-2.5">
            <span>Mes Stories Photos</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Actives ({stories.length})
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Publiez des photos de vos nouveaux arrivages ou articles phares (visibles 7 jours).
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Photo Story
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 md:p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Nouvelle Story Photo
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedFile(null);
                setFilePreview('');
              }}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateStory} className="space-y-6">
            {/* Mode d'import */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl max-w-md">
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  inputMode === 'file' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                📱 Photo depuis mon appareil
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  inputMode === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🔗 Lien web direct
              </button>
            </div>

            {/* Zone d'import de photo */}
            {inputMode === 'file' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!filePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Cliquez pour choisir une belle Photo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés : <strong>JPG, PNG, WebP</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-gray-200">
                    <div className="w-40 h-64 rounded-2xl overflow-hidden bg-black flex-shrink-0 relative shadow-md">
                      <img
                        src={filePreview}
                        alt="Aperçu Story"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Aperçu
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Photo prête
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mt-1 truncate max-w-xs sm:max-w-md">
                          {selectedFile?.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Taille : {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} Mo
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline block"
                      >
                        Changer de photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode Lien Direct */
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Lien direct de l'image (URL)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://mon-site.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
            )}

            {/* Associer un produit */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Associer un article de votre boutique (Optionnel)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white"
              >
                <option value="">-- Aucun produit associé (Story libre) --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price.toLocaleString('fr-FR')} FCFA
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Si sélectionné, un bouton d'accès direct vers cet article apparaîtra sur la story pour les clientes.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setSelectedFile(null);
                  setFilePreview('');
                }}
                className="btn btn-outline"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary min-w-[160px]"
                disabled={submitting || (inputMode === 'file' && !selectedFile) || (inputMode === 'url' && !mediaUrl)}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Téléversement...
                  </span>
                ) : (
                  'Publier la Photo'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des stories actives */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stories.map((story) => {
          const product = products.find((p) => p.id === story.product_id);
          const isExpired = new Date(story.expires_at) < new Date();

          return (
            <div
              key={story.id}
              className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-gray-900 shadow-sm border border-gray-200"
            >
              <img
                src={story.media_url}
                alt="Story"
                className={`w-full h-full object-cover ${isExpired ? 'opacity-50 grayscale' : ''}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Statut */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                <div>
                  {isExpired ? (
                    <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-sm">
                      Expirée
                    </span>
                  ) : (
                    <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-sm">
                      Active
                    </span>
                  )}
                </div>

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
                <div className="absolute bottom-2 left-2 right-2 bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 z-10">
                  <p className="text-white text-[10px] font-semibold truncate leading-tight">{product.name}</p>
                  <p className="text-emerald-300 text-[10px] font-bold">{product.price.toLocaleString('fr-FR')} F</p>
                </div>
              )}
            </div>
          );
        })}

        {stories.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-bold">Vous n'avez aucune story active.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Ajoutez une photo pour mettre en valeur les nouveautés de votre boutique auprès des clientes !
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Publier ma première photo story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
