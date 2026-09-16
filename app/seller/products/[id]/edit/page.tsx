'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Save, Image as ImageIcon, Check, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import type { Category, Product } from '@/lib/supabase/types';
import { getCategorySpec } from '@/lib/category-helpers';

const PRESET_IMAGES = [
  { label: 'Soie Émeraude', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mousseline Rose', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Jersey Noir', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80' },
  { label: 'Abaya Dubaï Broderie', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Parfum & Musc', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80' },
  { label: 'Gourde Isotherme', url: '/images/categories/cat_gourdes.jpg' },
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, shop } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [material, setMaterial] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Spécification intelligente selon la catégorie
  const currentCategory = categories.find((c) => c.id === categoryId);
  const spec = getCategorySpec(currentCategory?.slug || currentCategory?.name);

  useEffect(() => {
    Promise.all([
      DBService.getCategories(),
      DBService.getProductById(params.id)
    ]).then(([cats, prod]) => {
      setCategories(cats);
      if (prod) {
        setProduct(prod);
        setName(prod.name || '');
        setCategoryId(prod.category_id || cats[0]?.id || '');
        setPrice(prod.price?.toString() || '');
        setOldPrice(prod.old_price?.toString() || '');
        setStock(prod.stock?.toString() || '0');
        setMaterial(prod.material || '');
        setBadge(prod.badge || '');
        setDescription(prod.description || '');
        setColors(prod.colors?.join(', ') || '');
        setSizes(prod.sizes?.join(', ') || '');
        const currentImg = prod.images?.[0]?.image_url || '';
        setImageUrl(currentImg);
        setImagePreview(currentImg);
      } else {
        setError('Produit introuvable.');
      }
      setInitLoading(false);
    });
  }, [params.id]);

  const handleTogglePresetSize = (preset: string) => {
    const currentList = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (currentList.includes(preset)) {
      const filtered = currentList.filter((s) => s !== preset);
      setSizes(filtered.join(', '));
    } else {
      setSizes([...currentList, preset].join(', '));
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Local = reader.result as string;
      setImagePreview(base64Local);
      setImageUrl(base64Local);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setImageUrl(data.url);
          }
        }
      } catch (err) {
        console.warn('Erreur téléversement image:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!product) return;

    setLoading(true);

    try {
      const priceNum = parseInt(price.replace(/\D/g, ''), 10);
      const oldPriceNum = oldPrice ? parseInt(oldPrice.replace(/\D/g, ''), 10) : undefined;
      const stockNum = parseInt(stock, 10) || 10;

      if (isNaN(priceNum) || priceNum <= 0) {
        setError('Veuillez saisir un prix valide.');
        setLoading(false);
        return;
      }

      await DBService.updateProduct(product.id, {
        category_id: categoryId || null,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        old_price: oldPriceNum,
        stock: stockNum,
        material: material.trim(),
        colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
        sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
        badge: badge || undefined,
        imageUrl: imageUrl || undefined,
      });

      setSaved(true);
      setTimeout(() => {
        router.push('/seller/products');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement du produit.");
    } finally {
      setLoading(false);
    }
  };

  const currentSizesList = sizes.split(',').map((s) => s.trim()).filter(Boolean);

  if (initLoading) {
    return <div className="p-12 text-center text-xs text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 mx-auto pb-12 font-sans">
      <Link href="/seller/products" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste des produits
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Modifier le Produit</h1>
        <p className="text-xs text-gray-500 mt-1">
          Modifiez les informations, les formats/tailles et les visuels de votre article.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-bold flex items-center gap-2">
          ✅ Produit mis à jour avec succès ! Redirection vers vos produits...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200 font-bold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
        {/* Photo Upload & Presets */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Photo Principale du Produit
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-3xl p-5 sm:p-6 text-center bg-gray-50/50 cursor-pointer transition flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-800">Cliquez pour importer une nouvelle photo</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Format PNG, JPG (depuis votre téléphone)</p>
              </label>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] p-2 text-center font-bold">
                    <span className="animate-spin text-lg mb-1">⏳</span>
                    Envoi HD...
                  </div>
                )}
              </div>
              {uploadingImage ? (
                <span className="text-[10px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                  Envoi en cours...
                </span>
              ) : imageUrl && imageUrl.startsWith('http') ? (
                <span className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Photo HD prête pour WhatsApp
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 mt-1 font-semibold">Aperçu fiche produit</span>
              )}
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-gray-500 block mb-1.5">Ou choisir un modèle prêt à l'emploi :</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setImageUrl(preset.url);
                    setImagePreview(preset.url);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                    imageUrl === preset.url
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {imageUrl === preset.url && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catégorie et Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-500/40 focus:border-emerald-600 outline-none text-sm transition bg-white font-semibold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nom de l'Article
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: Hijab Soie de Médine, Musc Tahara Blanc, Abaya Dubaï..."
              required
            />
          </div>
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Prix de Vente (FCFA)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition font-bold"
              placeholder="ex: 5500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Ancien Prix barré (FCFA)
            </label>
            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="Optionnel (ex: 7000)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Quantité en Stock
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="25"
              required
            />
          </div>
        </div>

        {/* Section intelligente Tailles / Formats */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {spec.sizeLabel}
            </label>
            <span className="text-[11px] text-emerald-700/80">
              Cliquez pour ajouter/retirer un format rapidement
            </span>
          </div>

          {/* Boutons suggestions 1-clic */}
          <div className="flex flex-wrap gap-1.5">
            {spec.sizePresets.map((preset) => {
              const isSelected = currentSizesList.includes(preset);
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleTogglePresetSize(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 font-semibold ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-60" />}
                  {preset}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:border-emerald-600 bg-white outline-none text-sm transition"
            placeholder={spec.sizePlaceholder}
          />
        </div>

        {/* Matière / Type, Couleurs / Senteurs & Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {spec.materialLabel}
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder={spec.materialPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {spec.colorsLabel}
            </label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder={spec.colorsPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Badge promotionnel
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition bg-white"
            >
              <option value="Nouveau">Nouveau</option>
              <option value="Top Vente">Top Vente</option>
              <option value="Promo">Promo</option>
              <option value="Exclusivité">Exclusivité</option>
              <option value="">Aucun badge</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Description détaillée du produit
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition resize-none"
            placeholder="Détaillez le produit, ses senteurs ou sa matière, ses points forts et conseils d'utilisation..."
            required
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/seller/products"
            className="w-full sm:w-auto justify-center text-center px-5 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
