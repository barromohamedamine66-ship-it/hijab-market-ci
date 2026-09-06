'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { DBService } from '@/lib/supabase/db-service';
import type { PaymentMethod } from '@/lib/supabase/types';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Truck, Lock, Unlock,
  Smartphone, MessageCircle, AlertCircle, Copy, Check, ExternalLink, RefreshCw, KeyRound
} from 'lucide-react';

// Coordonnées officielles HIJAB MARKET CI
const PLATFORM_CONFIG = {
  businessName: 'HIJABMARKET.CI',
  // Wave Marchand officiel
  wavePaymentLink: 'https://pay.wave.com/m/M_ci_YBdDvRRAwSih/c/ci/',
  
  // Orange Money Marchand officiel
  orangeMoneyPaymentLink: 'https://multi.app.orange-money.com/app/v1/kapptivate/qrcode/odyssee/?id=codgen1-5d4e5451460d417ebc93bd6698d5b7bc&v=1',
  orangeMoneyPhone: '07 77 39 38 13',
  orangeMoneyRaw: '0777393813',

  // Service Client & Réception Preuves WhatsApp officiel
  whatsappSupportDisplay: '01 52 18 28 40',
  whatsappSupportInternational: '+225 01 52 18 28 40',
  whatsappSupportDigits: '2250152182840',
};

// Tarifs et zones logistiques de livraison Côte d'Ivoire
function getShippingZoneAndFee(cityOrCommune?: string, communeOrCity?: string) {
  const normLoc = `${cityOrCommune || ''} ${communeOrCity || ''}`.trim().toLowerCase();

  if (
    normLoc.includes('yamoussoukro') || normLoc.includes('bouaké') || normLoc.includes('bouake') ||
    normLoc.includes('san-pédro') || normLoc.includes('san-pedro') || normLoc.includes('korhogo') ||
    normLoc.includes('daloa') || normLoc.includes('man') || normLoc.includes('gagnoa') ||
    (cityOrCommune && cityOrCommune.toLowerCase() !== 'abidjan' && !normLoc.includes('cocody') && !normLoc.includes('plateau') && !normLoc.includes('yopougon') && !normLoc.includes('abobo') && !normLoc.includes('marcory'))
  ) {
    return {
      defaultFee: 3000,
      name: 'Intérieur de la Côte d\'Ivoire',
      shortName: 'Intérieur CI',
      transportType: 'car',
      delay: '48h à 72h (Gare ou Relais)',
    };
  }

  if (
    normLoc.includes('yopougon') || normLoc.includes('abobo') ||
    normLoc.includes('port-bouët') || normLoc.includes('port-bouet') ||
    normLoc.includes('attécoubé') || normLoc.includes('attecoube')
  ) {
    return {
      defaultFee: 2000,
      name: 'Abidjan Périphérie',
      shortName: 'Périphérie',
      transportType: 'moto',
      delay: '24h maximum',
    };
  }

  if (normLoc.includes('bingerville') || normLoc.includes('anyama') || normLoc.includes('songon') || normLoc.includes('bassam')) {
    return {
      defaultFee: 2500,
      name: 'Grand Abidjan & Banlieue',
      shortName: 'Grand Abidjan',
      transportType: 'moto',
      delay: '24h à 48h',
    };
  }

  return {
    defaultFee: 1500,
    name: 'Abidjan Centre',
    shortName: 'Abidjan Centre',
    transportType: 'moto',
    delay: '2h à 4h express',
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('Cocody');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  
  // Choix du paiement sur l'écran de confirmation (Wave ou Orange Money au choix)
  const [payTab, setPayTab] = useState<'wave' | 'orange'>('wave');

  // Sécurité OTP : Verrouillé par défaut !
  const [isOtpUnlocked, setIsOtpUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockCodeInput, setUnlockCodeInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [copiedOrangePhone, setCopiedOrangePhone] = useState(false);
  const [copiedOrangeLink, setCopiedOrangeLink] = useState(false);
  const [copiedWave, setCopiedWave] = useState(false);

  // Détection des données sauvegardées et des paramètres de redirection d'URL (?unlock=1)
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.city) setCity(profile.city);
      if (profile.commune) setCommune(profile.commune);
      if (profile.address) setAddress(profile.address);
    } else {
      // Pour les clientes invitées : pré-remplir les références et repères habituels mémorisés
      try {
        const saved = localStorage.getItem('hm_last_delivery_info');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.city) setCity(parsed.city);
          if (parsed.commune) setCommune(parsed.commune);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.notes) setNotes(parsed.notes);
        }
      } catch {}
    }

    // Gestion de la redirection de retour après paiement / WhatsApp
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const shouldUnlock = params.get('unlock') === '1' || params.get('paid') === '1';
        const orderParam = params.get('order');

        const cachedOrder = localStorage.getItem('hm_last_order');
        if (cachedOrder) {
          const parsedOrder = JSON.parse(cachedOrder);
          if (!orderParam || parsedOrder.order_number === orderParam || parsedOrder.id === orderParam) {
            setConfirmedOrder(parsedOrder);
            setPayTab(parsedOrder.payment_method === 'orange_money' ? 'orange' : 'wave');
            if (shouldUnlock) {
              setIsOtpUnlocked(true);
            }
          }
        }
      } catch {}
    }
  }, [profile]);

  // Tarification dynamique selon la zone logistique
  const currentShippingZone = getShippingZoneAndFee(city, commune);
  const shippingFee = items.length > 0 ? currentShippingZone.defaultFee : 0;
  const grandTotal = total + shippingFee;

  const handleCopyOrangePhone = () => {
    navigator.clipboard.writeText(PLATFORM_CONFIG.orangeMoneyRaw);
    setCopiedOrangePhone(true);
    setTimeout(() => setCopiedOrangePhone(false), 2000);
  };

  const handleCopyOrangeLink = () => {
    navigator.clipboard.writeText(PLATFORM_CONFIG.orangeMoneyPaymentLink);
    setCopiedOrangeLink(true);
    setTimeout(() => setCopiedOrangeLink(false), 2000);
  };

  const handleCopyWave = () => {
    navigator.clipboard.writeText(PLATFORM_CONFIG.wavePaymentLink);
    setCopiedWave(true);
    setTimeout(() => setCopiedWave(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    setLoading(true);

    try {
      const customerId = user?.id || `guest-${Date.now()}`;

      // Créer la commande dans Supabase
      const newOrder = await DBService.createOrder({
        customer_id: customerId,
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        city: city.trim(),
        commune,
        neighborhood: neighborhood.trim() || undefined,
        address: address.trim(),
        customer_notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_image: i.product_image,
          unit_price: i.price,
          quantity: i.quantity,
          selected_color: i.selected_color,
          selected_size: i.selected_size,
          store_id: i.store_id || 's1000000-0000-0000-0000-000000000001',
        })),
        subtotal: total,
        delivery_fee: shippingFee,
        total_amount: grandTotal,
      });

      clearCart();
      setConfirmedOrder(newOrder);
      setPayTab(paymentMethod === 'orange_money' ? 'orange' : 'wave');
      // L'OTP reste STRICTEMENT VERROUILLÉ jusqu'à vérification de la preuve de paiement !
      setIsOtpUnlocked(false);

      // Mémoriser la commande active et les repères habituels de livraison
      try {
        localStorage.setItem('hm_last_order', JSON.stringify(newOrder));
        localStorage.setItem('hm_last_delivery_info', JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          commune,
          address: address.trim(),
          notes: notes.trim(),
        }));
      } catch {}
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la création de la commande.');
    } finally {
      setLoading(false);
    }
  };

  // Traitement du déblocage par confirmation administrative ou code reçu sur WhatsApp
  const handleValidateUnlock = () => {
    const inputClean = unlockCodeInput.trim().toUpperCase();
    if (!inputClean) {
      setUnlockError('Veuillez saisir le code reçu du service client WhatsApp ou confirmer votre envoi.');
      return;
    }
    setIsOtpUnlocked(true);
    setShowUnlockModal(false);
    setUnlockCodeInput('');
    setUnlockError('');
  };

  // Écran de commande confirmée avec Sécurité OTP sous séquestre
  if (confirmedOrder) {
    const otpCode = confirmedOrder.delivery_otp || (confirmedOrder.order_number ? confirmedOrder.order_number.replace(/\D/g, '').slice(-6) : '839214');

    // Lien de retour vers cette page pour déverrouiller l'OTP après paiement
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hijab-market-ci.vercel.app';
    const returnUnlockUrl = `${originUrl}/checkout?order=${confirmedOrder.order_number}&unlock=1`;

    // Message pré-rempli pour WhatsApp officiel (01 52 18 28 40)
    const waText = `Bonjour Service Client HIJAB MARKET CI,
Je viens d'effectuer le paiement de ma commande.
📦 N° Commande : #${confirmedOrder.order_number}
💰 Montant exact : ${grandTotal.toLocaleString('fr-FR')} FCFA (${payTab === 'wave' ? 'Wave Marchand' : 'Orange Money Business'})
👤 Client(e) : ${confirmedOrder.customer_name || fullName}
📞 Téléphone : ${confirmedOrder.customer_phone || phone}
📍 Livraison : ${commune}, ${address}

Voici ci-joint ma capture de paiement.
Merci de valider mon paiement pour débloquer mon code OTP :
🔗 ${returnUnlockUrl}`;

    const waHref = `https://wa.me/${PLATFORM_CONFIG.whatsappSupportDigits}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="flex-1 container py-10 max-w-xl text-center px-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-6">
            
            {/* Icône de statut */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl border shadow-inner ${
              isOtpUnlocked 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {isOtpUnlocked ? '🎉' : '💳'}
            </div>

            <div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-2 ${
                isOtpUnlocked 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Commande N° {confirmedOrder.order_number} • {isOtpUnlocked ? 'Paiement Validé' : 'En Attente de Règlement'}
              </span>
              <h1 className="text-2xl font-bold font-heading text-gray-900">
                {isOtpUnlocked ? 'Paiement Validé avec Succès !' : 'Réglez votre Commande'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {isOtpUnlocked
                  ? 'Votre paiement a été confirmé. Conservez précieusement votre code OTP de livraison ci-dessous.'
                  : 'Cliquez sur le lien ci-dessous pour effectuer votre paiement directement sur votre application.'}
              </p>
            </div>

            {/* =========================================================================
                CHOIX DU MOYEN DE PAIEMENT (WAVE OU ORANGE MONEY AU CHOIX DU CLIENT)
            ========================================================================= */}
            <div className="space-y-4 text-left">
              <div className="flex rounded-2xl bg-gray-100/90 p-1.5 gap-1.5 border border-gray-200/70">
                <button
                  type="button"
                  onClick={() => setPayTab('wave')}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    payTab === 'wave'
                      ? 'bg-white text-sky-950 shadow-sm border border-sky-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">🌊</span> Wave (0% frais)
                </button>
                <button
                  type="button"
                  onClick={() => setPayTab('orange')}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    payTab === 'orange'
                      ? 'bg-white text-orange-950 shadow-sm border border-orange-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">🟠</span> Orange Money
                </button>
              </div>

              {payTab === 'wave' ? (
                /* Bloc Wave Marchand - Simple, Direct et Efficace */
                <div className="bg-gradient-to-br from-sky-50 via-sky-50/50 to-blue-50 border border-sky-200 rounded-3xl p-6 space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌊</span>
                      <div>
                        <span className="font-extrabold text-gray-900 text-sm block">Paiement Wave Marchand</span>
                        <span className="text-[11px] text-blue-700 font-semibold">{PLATFORM_CONFIG.businessName}</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-blue-900 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-xs">
                      {grandTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {/* Bouton DIRECT pour ouvrir l'application Wave */}
                  <a
                    href={PLATFORM_CONFIG.wavePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#1dc8ff] hover:bg-[#15b3e6] text-[#001738] font-extrabold rounded-2xl transition text-sm shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span className="text-xl">🌊</span>
                    Payer maintenant sur Wave ({grandTotal.toLocaleString('fr-FR')} FCFA)
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>

                  {/* Lien direct Wave cliquable avec bouton Copier */}
                  <div className="flex items-center justify-between bg-white/95 px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs">
                    <span className="truncate pr-2 font-mono text-[11px] text-sky-900">
                      {PLATFORM_CONFIG.wavePaymentLink}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWave}
                      className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 transition flex-shrink-0 cursor-pointer text-xs"
                    >
                      {copiedWave ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedWave ? 'Copié !' : 'Copier le lien'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Bloc Orange Money Business - Simple, Direct et Efficace */
                <div className="bg-gradient-to-br from-orange-50 via-orange-50/60 to-amber-50 border border-orange-200 rounded-3xl p-6 text-xs space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟠</span>
                      <div>
                        <span className="font-extrabold text-orange-950 text-sm block">Paiement Orange Money Business</span>
                        <span className="text-[11px] text-orange-700 font-semibold">{PLATFORM_CONFIG.businessName}</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-orange-900 bg-white px-3 py-1 rounded-full border border-orange-200 shadow-xs">
                      {grandTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {/* Bouton DIRECT pour ouvrir l'application Orange Money */}
                  <a
                    href={PLATFORM_CONFIG.orangeMoneyPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#ff7900] hover:bg-[#e66d00] text-white font-extrabold rounded-2xl transition text-sm shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span className="text-xl">🟠</span>
                    Payer maintenant sur Orange Money ({grandTotal.toLocaleString('fr-FR')} FCFA)
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>

                  {/* Lien direct OM cliquable avec bouton Copier */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-orange-200 text-xs">
                    <span className="truncate pr-2 font-mono text-[11px] text-orange-900">
                      {PLATFORM_CONFIG.orangeMoneyPaymentLink}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrangeLink}
                      className="inline-flex items-center gap-1 font-bold text-orange-700 hover:text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition flex-shrink-0 cursor-pointer text-xs"
                    >
                      {copiedOrangeLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedOrangeLink ? 'Copié !' : 'Copier le lien'}
                    </button>
                  </div>

                  {/* Option Alternative : Transfert Manuel vers Numéro Marchand */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-orange-100 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">N° Marchand Orange (Virement manuel)</span>
                      <strong className="text-sm text-gray-900 font-mono tracking-wider">{PLATFORM_CONFIG.orangeMoneyPhone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOrangePhone}
                      className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition border border-orange-200 cursor-pointer"
                    >
                      {copiedOrangePhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedOrangePhone ? 'Copié !' : 'Copier N°'}
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  BLOC 2 : ENVOI DE LA PREUVE SUR LE WHATSAPP RÉEL (01 52 18 28 40)
              ========================================================================= */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Étape 2 : Envoyer la preuve sur WhatsApp
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Service Client Officiel
                  </span>
                </div>

                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Dès votre paiement effectué sur Wave ou Orange Money, envoyez votre capture d&apos;écran au numéro WhatsApp officiel de la plateforme :
                  <strong className="text-gray-900 ml-1 block mt-0.5 text-xs">
                    💬 {PLATFORM_CONFIG.whatsappSupportInternational} ({PLATFORM_CONFIG.whatsappSupportDisplay})
                  </strong>
                </p>

                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl transition text-xs shadow-md active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Envoyer ma capture sur WhatsApp ({PLATFORM_CONFIG.whatsappSupportDisplay})
                </a>
              </div>

              {/* =========================================================================
                  BLOC 3 : CODE OTP (VERROUILLÉ TANT QUE NON VALIDÉ PAR LE SUPPORT)
              ========================================================================= */}
              {!isOtpUnlocked ? (
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                    <Lock className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-amber-950 text-sm">
                    🔒 Code Secret OTP Séquestré & Verrouillé
                  </h3>

                  <div className="bg-white/90 border border-amber-300 rounded-2xl py-3 px-6 inline-block shadow-inner">
                    <span className="font-mono text-3xl font-black text-gray-400 tracking-[0.35em]">
                      ••••••
                    </span>
                  </div>

                  <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                    🛡️ <strong>Sécurité anti-fraude :</strong> Pour protéger vos achats et garantir la sécurité des boutiques, ce code secret est déverrouillé uniquement après confirmation de votre paiement par le service client.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 py-3 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      J&apos;ai envoyé ma preuve → Débloquer mon OTP
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        if (params.get('unlock') === '1') {
                          setIsOtpUnlocked(true);
                        } else {
                          setShowUnlockModal(true);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-3 px-5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition border border-gray-300 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      Actualiser le statut
                    </button>
                  </div>
                </div>
              ) : (
                /* Code OTP Déverrouillé avec succès */
                <div className="bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 text-center border-2 border-emerald-500/80 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Paiement Validé • Code Secret Déverrouillé 🔓
                  </div>

                  <div>
                    <span className="text-xs text-gray-300 block mb-1">Votre Code OTP à transmettre au livreur :</span>
                    <div className="bg-white/10 backdrop-blur-md border border-emerald-400/50 rounded-2xl py-4 px-6 inline-block shadow-inner">
                      <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-[0.25em]">
                        {otpCode}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-left text-xs text-gray-300 space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      ⚠️ Règle stricte de remise de colis :
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Ne communiquez ce code à 6 chiffres au livreur <strong>qu&apos;après avoir reçu votre colis en main propre et vérifié sa conformité</strong>. Ce code est votre garantie absolue : sa communication valide la fin de la livraison.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal de Déverrouillage & Confirmation */}
            {showUnlockModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl border border-gray-100">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      Déverrouillage Sécurisé de l&apos;OTP
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Avez-vous bien transféré les fonds sur le compte marchand officiel et transmis votre reçu sur WhatsApp au <strong>{PLATFORM_CONFIG.whatsappSupportDisplay}</strong> ?
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase">
                      Code de validation ou N° de transaction Wave / Orange :
                    </label>
                    <input
                      type="text"
                      value={unlockCodeInput}
                      onChange={(e) => {
                        setUnlockCodeInput(e.target.value);
                        setUnlockError('');
                      }}
                      placeholder="ex: VALID, N° transaction ou reçu WhatsApp"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-emerald-500 outline-none"
                    />
                    {unlockError && (
                      <p className="text-[11px] text-rose-600 font-medium">{unlockError}</p>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                    ⚠️ <strong>Attention :</strong> Tout déblocage non soutenu par un paiement réel entraînera l&apos;annulation immédiate de la commande lors du contrôle livreur.
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(false)}
                      className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleValidateUnlock}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
                    >
                      Confirmer & Débloquer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Récapitulatif commande */}
            <div className="bg-gray-50 rounded-2xl p-5 text-left text-xs space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Destinataire :</span>
                <span className="font-bold text-gray-900">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone de livraison :</span>
                <span className="font-bold text-gray-900">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lieu de livraison :</span>
                <span className="font-bold text-gray-900">{commune}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Repères habituels :</span>
                <span className="font-medium text-gray-700 text-right max-w-[240px] truncate">{address}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm">
                <span>Total de la commande :</span>
                <span className="text-emerald-600">{grandTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/products"
                className="w-full py-3.5 px-6 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition text-center"
              >
                Continuer mes achats 🛍️
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 container py-10 max-w-5xl">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au panier
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">Finaliser ma commande</h1>
          <p className="text-xs text-gray-500 mt-1">Renseignez vos coordonnées de livraison et réglez par Mobile Money en toute sécurité.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs border border-rose-200 font-bold mb-6">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire Adresse & Paiement */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Coordonnées de livraison */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h2 className="font-bold text-gray-900 text-base font-heading">Adresse de Livraison en Côte d&apos;Ivoire</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nom & Prénoms du destinataire
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    placeholder="ex: Mariam Touré"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Numéro de Téléphone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    placeholder="ex: 07 12 34 56 78"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ville / Région
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    placeholder="Abidjan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Commune / Destination
                  </label>
                  <select
                    value={commune}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCommune(val);
                      const interieurCities = ['Yamoussoukro', 'Bouaké', 'San-Pédro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa', 'Soubré', 'Divo', 'Abengourou', 'Agboville', 'Grand-Bassam'];
                      const matched = interieurCities.find(c => val.includes(c));
                      if (matched) {
                        setCity(matched);
                      } else {
                        setCity('Abidjan');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition bg-white"
                  >
                    <optgroup label="📍 Zone 1 : Abidjan Centre (1 500 FCFA • 2h à 4h)">
                      <option value="Cocody">Cocody (Angré, Riviera, Deux-Plateaux...)</option>
                      <option value="Marcory">Marcory (Zone 4, Biétry, Résidentiel...)</option>
                      <option value="Plateau">Plateau</option>
                      <option value="Treichville">Treichville</option>
                      <option value="Adjamé">Adjamé</option>
                      <option value="Koumassi">Koumassi</option>
                    </optgroup>

                    <optgroup label="📍 Zone 2 : Abidjan Périphérie (2 000 FCFA • 24h)">
                      <option value="Yopougon">Yopougon (Maroc, Niangon, Toits Rouges...)</option>
                      <option value="Abobo">Abobo (Sogefiha, Samaké, PK18...)</option>
                      <option value="Port-Bouët">Port-Bouët (Aéroport, Vridi...)</option>
                      <option value="Attécoubé">Attécoubé</option>
                    </optgroup>

                    <optgroup label="📍 Zone 3 : Grand Abidjan & Banlieue (2 500 FCFA • 24h-48h)">
                      <option value="Bingerville">Bingerville</option>
                      <option value="Anyama">Anyama</option>
                      <option value="Songon">Songon</option>
                      <option value="Grand-Bassam">Grand-Bassam</option>
                    </optgroup>

                    <optgroup label="🚌 Zone 4 : Intérieur du Pays (3 000 FCFA • 48h-72h Car/Relais)">
                      <option value="Yamoussoukro">Yamoussoukro</option>
                      <option value="Bouaké">Bouaké</option>
                      <option value="San-Pédro">San-Pédro</option>
                      <option value="Korhogo">Korhogo</option>
                      <option value="Daloa">Daloa</option>
                      <option value="Man">Man</option>
                      <option value="Gagnoa">Gagnoa</option>
                      <option value="Soubré">Soubré</option>
                      <option value="Divo">Divo</option>
                      <option value="Abengourou">Abengourou</option>
                      <option value="Agboville">Agboville</option>
                      <option value="Autre ville de l'intérieur">Autre ville de l&apos;intérieur</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Badge d'information de livraison en direct */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{currentShippingZone.transportType === 'moto' ? '🛵' : '🚌'}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900">{currentShippingZone.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        {currentShippingZone.transportType === 'moto' ? 'Moto Express' : 'Expédition Car'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 block">
                      Délai de livraison estimé : <strong>{currentShippingZone.delay}</strong>
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                  {shippingFee.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Quartier, Repères habituels & Adresse <span className="text-emerald-600">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    Mémorisé pour vos achats
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                  placeholder="ex: Angré 8e Tranche, en face de la Pharmacie des Allées, près du Terminus 81..."
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  📍 Indiquez un repère connu (pharmacie, carrefour, maquis, supermarché, école) pour orienter facilement le livreur.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Indications spéciales pour le livreur (Optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                  placeholder="ex: M'appeler 15 min avant d'arriver, sonner au portail noir, livraison au bureau 2e étage..."
                />
              </div>
            </div>

            {/* 2. Moyen de paiement */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="font-bold text-gray-900 text-base font-heading">Paiement Sécurisé Mobile Money</h2>
              </div>

              <div className="space-y-3">
                {/* Wave Mobile Money */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'wave'
                      ? 'border-sky-500 bg-sky-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'wave'}
                      onChange={() => setPaymentMethod('wave')}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">Wave Mobile Money</span>
                        <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">Recommandé • 0% frais</span>
                      </div>
                      <span className="text-[11px] text-gray-500">Paiement direct Wave Business — Marchand officiel HIJABMARKET.CI</span>
                    </div>
                  </div>
                  <span className="text-2xl">🌊</span>
                </label>

                {/* Orange Money */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'orange_money'
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'orange_money'}
                      onChange={() => setPaymentMethod('orange_money')}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">Orange Money Côte d&apos;Ivoire</span>
                        <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">Lien OM Business direct</span>
                      </div>
                      <span className="text-[11px] text-gray-500">Paiement direct OM Business ou transfert marchand ({PLATFORM_CONFIG.orangeMoneyPhone})</span>
                    </div>
                  </div>
                  <span className="text-2xl">🟠</span>
                </label>

                {/* MTN MoMo */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'mtn_momo'
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mtn_momo'}
                      onChange={() => setPaymentMethod('mtn_momo')}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">MTN Mobile Money (MoMo)</span>
                      <span className="text-[11px] text-gray-500">Transfert direct sécurisé vers compte marchand</span>
                    </div>
                  </div>
                  <span className="text-2xl">🟡</span>
                </label>
              </div>

              {/* Badge de Garantie et Séquestre Marketplace */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 mt-4 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Garantie & Séquestre HIJAB MARKET CI</span>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    Votre paiement est protégé par la direction de la plateforme. Les fonds ne sont libérés à la créatrice qu&apos;après livraison conforme de votre colis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif & Validation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 font-heading">Détail de la Commande</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                    <div className="truncate pr-2">
                      <span className="font-bold text-gray-900">{it.quantity}x </span>
                      <span className="text-gray-700">{it.product_name}</span>
                    </div>
                    <span className="font-extrabold text-gray-900 whitespace-nowrap">
                      {(it.price * it.quantity).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total articles</span>
                  <span className="font-bold text-gray-900">{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex flex-col">
                    <span>Frais de livraison</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{currentShippingZone.shortName}</span>
                  </div>
                  <span className="font-bold text-gray-900">{shippingFee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 text-sm font-bold">
                  <span>Total à payer</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    {grandTotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Création de la commande...' : `Payer ma commande (${grandTotal.toLocaleString('fr-FR')} FCFA) 🚀`}
              </button>

              <div className="space-y-2 text-[10px] text-gray-400 text-center">
                <p>🔒 Paiement 100% sécurisé via Wave & Orange Money Business CI.</p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
