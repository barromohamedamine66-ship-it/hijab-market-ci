'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { DBService } from '@/lib/supabase/db-service';
import type { Shop } from '@/lib/supabase/types';
import {
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MessageCircle,
  Store,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    DBService.getShops().then(setShops);
  }, []);

  // Grouper les articles par boutique
  const storeGroups = items.reduce((acc, item) => {
    const key = item.store_id || item.store_name || 'Boutique Partenaire';
    if (!acc[key]) {
      acc[key] = {
        storeId: item.store_id,
        storeName: item.store_name || 'Boutique Partenaire',
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { storeId?: string; storeName: string; items: typeof items }>);

  const getStoreWhatsAppUrl = (group: { storeId?: string; storeName: string; items: typeof items }) => {
    const foundShop = shops.find(
      s => s.id === group.storeId || s.name.toLowerCase() === group.storeName.toLowerCase()
    );

    const storePhone = foundShop?.whatsapp || foundShop?.phone || '+2250777393813';
    const clean = storePhone.replace(/[^0-9]/g, '');
    const formatted = clean.startsWith('225') ? clean : (clean.length === 10 ? `225${clean}` : `225${clean}`);

    const groupTotal = group.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const lines = group.items.map(
      (it, idx) =>
        `${idx + 1}. *${it.product_name}* (Qté: ${it.quantity}) — ${(it.price * it.quantity).toLocaleString('fr-FR')} FCFA${
          it.selected_color ? ` [Couleur: ${it.selected_color}]` : ''
        }${it.selected_size ? ` [Taille: ${it.selected_size}]` : ''}`
    );

    const message = encodeURIComponent(
      `Bonjour *${group.storeName}*,\n\nJe souhaite commander les articles suivants sélectionnés sur le portail *HIJAB MARKET CI* :\n\n${lines.join(
        '\n'
      )}\n\n*Total des articles : ${groupTotal.toLocaleString(
        'fr-FR'
      )} FCFA*\n\nPouvez-vous me confirmer la disponibilité et le délai de livraison ? Merci !`
    );

    return `https://wa.me/${formatted}?text=${message}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 container py-10 max-w-5xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Continuer mes achats
        </Link>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">Mon Panier</h1>
            <p className="text-xs text-gray-500 mt-1">
              {items.length === 0
                ? 'Votre panier est vide'
                : `${items.reduce((sum, i) => sum + i.quantity, 0)} articles sélectionnés auprès de nos boutiques`}
            </p>
          </div>

          {items.length > 0 && (
            <button onClick={clearCart} className="text-xs text-rose-600 hover:underline font-semibold">
              Vider le panier
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              🛍️
            </div>
            <h3 className="font-bold text-gray-900 text-base">Votre panier est encore vide</h3>
            <p className="text-xs text-gray-500">
              Découvrez nos hijabs en soie de Médine, abayas de Dubaï, boubous en Bazin riche et ensembles mastour.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
            >
              Explorer les nouveautés ✨
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles regroupés par boutique */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Commandes directes sans intermédiaire :</strong> vos articles sont regroupés par boutique vendeuse. Cliquez sur le bouton WhatsApp de chaque boutique pour convenir de l'adresse de livraison et régler en direct.
                </p>
              </div>

              {Object.entries(storeGroups).map(([groupKey, group]) => {
                const groupTotal = group.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
                const whatsappUrl = getStoreWhatsAppUrl(group);
                const foundShop = shops.find(
                  s => s.id === group.storeId || s.name.toLowerCase() === group.storeName.toLowerCase()
                );

                return (
                  <div
                    key={groupKey}
                    className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4 p-5"
                  >
                    {/* Header de la boutique */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">{group.storeName}</span>
                            {foundShop?.is_founder && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                Fondatrice
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {foundShop?.commune || 'Abidjan'} • {group.items.length} article(s)
                          </span>
                        </div>
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Commander ces {group.items.length} article(s) sur WhatsApp
                      </a>
                    </div>

                    {/* Liste des articles du groupe */}
                    <div className="space-y-3">
                      {group.items.map((item, idx) => (
                        <div
                          key={`${item.product_id}-${item.selected_color}-${item.selected_size}-${idx}`}
                          className="flex items-center gap-4 py-2"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              '🧕'
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs truncate">{item.product_name}</h4>
                            {(item.selected_color || item.selected_size) && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {item.selected_color && `Couleur : ${item.selected_color}`}
                                {item.selected_color && item.selected_size && ' • '}
                                {item.selected_size && `Taille : ${item.selected_size}`}
                              </p>
                            )}
                            <p className="text-xs font-extrabold text-emerald-600 mt-0.5">
                              {item.price.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>

                          {/* Quantité & Supprimer */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-50">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity - 1,
                                    item.selected_color,
                                    item.selected_size
                                  )
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-200 font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-xs font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity + 1,
                                    item.selected_color,
                                    item.selected_size
                                  )
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-200 font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product_id, item.selected_color, item.selected_size)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Sous-total {group.storeName} :</span>
                      <span className="font-extrabold text-gray-900">
                        {groupTotal.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Résumé de Commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
                <h3 className="text-base font-bold text-gray-900 font-heading">Récapitulatif Panier</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Nombre de boutiques</span>
                    <span className="font-bold text-gray-900">{Object.keys(storeGroups).length} boutique(s)</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Total des articles</span>
                    <span className="font-bold text-gray-900">{items.reduce((s, i) => s + i.quantity, 0)} pièces</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900">Valeur totale</span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      {total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                  💡 <em>Pour valider vos achats, cliquez sur le bouton vert WhatsApp de chaque boutique ci-contre. Vous conviendrez directement de la remise en main propre ou de la livraison à votre domicile.</em>
                </div>

                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Expédition directe par chaque vendeuse
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Paiement direct Wave, Orange Money ou à la livraison
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
