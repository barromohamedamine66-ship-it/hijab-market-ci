'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/lib/supabase/types';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  MessageCircle,
  Heart,
  Store,
  MapPin,
  Clock,
  ExternalLink,
  Award,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    DBService.getProductBySlug(params.slug).then((prod) => {
      setProduct(prod);
      if (prod?.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
      if (prod?.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
      setLoading(false);

      if (prod?.store_id) {
        DBService.incrementShopViews(prod.store_id);
      }

      if (user && prod) {
        DBService.isProductFavorite(user.id, prod.id).then(setIsFavorited);
      }
    });
  }, [params.slug, user]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    const userId = user?.id || 'guest-user';
    const result = await DBService.toggleFavorite(userId, product.id);
    setIsFavorited(result.isFavorited);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0]?.image_url || null,
      price: product.price,
      quantity: quantity,
      selected_color: selectedColor || undefined,
      selected_size: selectedSize || undefined,
      store_id: product.store_id,
      store_name: product.store?.name || 'Boutique Partenaire',
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-gray-400 text-xs">
          Chargement de l'article...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <p className="text-4xl">🧕</p>
          <h2 className="text-lg font-bold text-gray-800">Article introuvable</h2>
          <p className="text-xs text-gray-500">Ce produit n'existe plus ou a été retiré de la vente.</p>
          <Link href="/products" className="btn btn-primary btn-sm">
            Retourner au catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverImage = product.images?.[0]?.image_url;
  const store = product.store;
  const storeWhatsApp = store?.whatsapp || store?.phone || '+2250777393813';
  const cleanPhone = storeWhatsApp.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('225')
    ? cleanPhone
    : cleanPhone.length === 10
    ? `225${cleanPhone}`
    : `225${cleanPhone}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://hijabmarket.ci/products/${product.slug}`;
  const orderMessage = encodeURIComponent(
    `Bonjour ${store?.name || 'Boutique'},\n\nJe suis intéressé(e) par votre article *${product.name}* (${product.price.toLocaleString('fr-FR')} FCFA)${
      selectedColor ? ` en couleur "${selectedColor}"` : ''
    }${selectedSize ? ` en taille "${selectedSize}"` : ''} vu sur le portail HIJAB MARKET CI.\n\nEst-il toujours disponible pour une commande / livraison ?\nLien article : ${currentUrl}`
  );

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${orderMessage}`;
  const storeUrl = store?.slug ? `/boutique/${store.slug}` : '/stores';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 container py-8 max-w-5xl">
        {/* Fil d'Ariane */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <Link href="/products" className="hover:text-emerald-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Catalogue Mode Modeste
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category?.slug || ''}`} className="hover:text-emerald-600">
            {product.category?.name || 'Vêtements'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie Photo & Badges */}
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner relative">
              {coverImage ? (
                <img src={coverImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">🧕</span>
              )}

              {/* Bouton Favori */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-md hover:scale-110 transition text-rose-500"
                title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
              </button>

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Fiche de la Boutique Vendeuse */}
            {store && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-amber-50/30 border border-emerald-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-emerald-200 overflow-hidden flex items-center justify-center shadow-sm">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">{store.name}</span>
                        {store.is_founder && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Fondatrice
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {store.commune || 'Abidjan'}, {store.city || 'Côte d’Ivoire'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-amber-600">★ {store.rating || '5.0'}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={storeUrl}
                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition text-xs font-semibold flex items-center gap-1"
                    title="Visiter la boutique"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {store.opening_hours && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-1 border-t border-emerald-100/60">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Disponibilité : {store.opening_hours}</span>
                  </div>
                )}
              </div>
            )}

            {/* Badges de confiance */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Livraison Directe</span>
                <span className="text-[9px] text-gray-400">Expédition par le vendeur</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Vendeur Vérifié</span>
                <span className="text-[9px] text-gray-400">Modeste & Traditionnel</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Zéro Frais Cachés</span>
                <span className="text-[9px] text-gray-400">Prix direct boutique</span>
              </div>
            </div>
          </div>

          {/* Fiche Détails & Achat */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    {product.category?.name || 'Mode Modeste'}
                  </span>
                  {store?.is_founder && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Boutique Fondatrice
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">{'★'.repeat(5)}</div>
                  <span className="text-xs font-bold text-gray-700">{product.rating || 5.0}/5</span>
                  <span className="text-xs text-gray-400">
                    • Vendu par <Link href={storeUrl} className="text-emerald-600 font-semibold hover:underline">{store?.name || 'Boutique'}</Link>
                  </span>
                </div>
              </div>

              {/* Prix */}
              <div className="flex items-baseline gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {product.price.toLocaleString('fr-FR')} FCFA
                </span>
                {product.old_price && (
                  <span className="text-base text-gray-400 line-through">
                    {product.old_price.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
                {product.material && (
                  <p className="text-xs font-semibold text-gray-800 mt-2">
                    Tissu / Matière : <span className="text-emerald-700 font-bold">{product.material}</span>
                  </p>
                )}
              </div>

              {/* Couleurs */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Couleur disponible</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          selectedColor === col
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailles */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Dimensions / Taille</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          selectedSize === sz
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Quantité souhaitée</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {product.stock} disponibles en stock
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons d'Action (WhatsApp Direct + Panier) */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {/* Bouton WhatsApp Principal */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                Commander via WhatsApp à la boutique
              </a>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {added ? 'Ajouté au panier !' : 'Ajouter au panier'}
                </button>

                <Link
                  href={storeUrl}
                  className="py-3 px-5 rounded-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  Boutique
                </Link>
              </div>

              <p className="text-center text-[11px] text-gray-500 leading-relaxed">
                Contactez directement la boutique sur WhatsApp pour convenir de l'adresse de livraison et du mode de paiement (Wave, Orange Money ou à la livraison).
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

