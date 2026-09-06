'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Save, Image as ImageIcon, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import type { Category } from '@/lib/supabase/types';

// Images d'exemple élégantes et ultra-qualitatives pour démonstration si pas de fichier local
const PRESET_IMAGES = [
  { label: 'Soie Émeraude', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mousseline Rose', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Jersey Noir', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80' },
  { label: 'Abaya Dubaï Broderie', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { user, shop } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [material, setMaterial] = useState('Soie de Médine');
  const [badge, setBadge] = useState('Nouveau');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState('Vert Émeraude, Noir, Beige');
  const [sizes, setSizes] = useState('Standard (190x75cm)');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [imagePreview, setImagePreview] = useState<string | null>(PRESET_IMAGES[0].url);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    DBService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storeId = shop?.id || (user ? `shop-${user.id}` : 's1000000-0000-0000-0000-000000000001');

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

      await DBService.createProduct({
        store_id: storeId,
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

  return (
    <div className="max-w-4xl space-y-6 mx-auto pb-12">
      <Link href="/seller/products" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste des produits
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Ajouter un Nouveau Produit</h1>
        <p className="text-xs text-gray-500 mt-1">Publiez un nouvel article sur votre boutique et rendez-le disponible immédiatement pour les clientes.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-bold flex items-center gap-2">
          ✅ Produit enregistré et publié avec succès ! Redirection vers vos produits...
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
                <p className="text-xs font-bold text-gray-800">Cliquez pour importer une photo</p>
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
              </div>
              <span className="text-[10px] text-gray-400 mt-1 font-semibold">Aperçu fiche produit</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nom de l'Article
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: Hijab Soie de Médine Plissée — Bleu Nuit"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Matière / Tissu
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: Soie de Médine Opaque"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Couleurs (séparées par virgule)
            </label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="Vert, Noir, Beige..."
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
            placeholder="Détaillez la texture du voile, sa fluidité, son opacité et vos conseils pour le porter..."
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
            className="w-full sm:w-auto justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" /> {loading ? 'Enregistrement réel...' : 'Publier le Produit 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
