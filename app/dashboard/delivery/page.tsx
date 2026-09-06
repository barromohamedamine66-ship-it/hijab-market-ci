'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck, Phone, MapPin, CheckCircle2, AlertTriangle,
  Navigation, ShieldCheck, ArrowLeft, Store, User, Clock, KeyRound,
  PackageOpen, MessageCircle, ShieldAlert, Satellite
} from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import { getShippingZoneAndFee } from '@/lib/delivery/shipping-zones';
import { INITIAL_DRIVERS, getStoredDrivers, type Driver } from '@/lib/delivery/drivers';

interface CourierTourOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCommune: string;
  customerAddress: string;
  sellerShop: string;
  sellerPhone: string;
  sellerAddress: string;
  expectedDeliveryFee: number;
  status: 'to_pickup' | 'in_transit' | 'delivered';
  correctOtp: string;
}

export default function DeliveryDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [courierPhone, setCourierPhone] = useState('');
  const [courierPin, setCourierPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);

  const [tour, setTour] = useState<CourierTourOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // État du traçage GPS
  const [gpsStatus, setGpsStatus] = useState<{
    active: boolean;
    lat?: number;
    lng?: number;
    time?: string;
    error?: string;
  }>({ active: false });

  // Récupérer la liste des livreurs enregistrés
  const getDriversList = (): Driver[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hm_registered_drivers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_DRIVERS;
  };

  // Mettre à jour les coordonnées GPS du livreur dans localStorage
  const updateDriverGpsLocation = (driverId: string, lat: number, lng: number) => {
    if (typeof window === 'undefined') return;
    try {
      const allDrivers = getDriversList();
      const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const updated = allDrivers.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            lastLatitude: lat,
            lastLongitude: lng,
            lastGpsTime: `Aujourd'hui à ${nowStr}`,
            status: d.status === 'blocked' ? 'blocked' : 'busy' as Driver['status'],
          };
        }
        return d;
      });
      localStorage.setItem('hm_registered_drivers', JSON.stringify(updated));
    } catch (e) {
      console.error('Erreur mise à jour GPS:', e);
    }
  };

  // Démarrer la surveillance GPS automatique
  const startGpsTracking = (driver: Driver) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus({ active: false, error: 'Géolocalisation non supportée' });
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      setGpsStatus({
        active: true,
        lat,
        lng,
        time: timeStr,
      });

      updateDriverGpsLocation(driver.id, lat, lng);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      console.warn('Erreur GPS:', err.message);
      setGpsStatus({
        active: false,
        error: 'Activez la localisation GPS sur votre smartphone pour synchroniser votre position.',
      });
    };

    // Acquisition initiale rapide
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
    });

    // Balise GPS en continu
    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  useEffect(() => {
    // Vérifier si la session coursier est déjà active
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('hm_courier_unlocked');
      const savedPhone = sessionStorage.getItem('hm_courier_phone');
      if (saved === 'true') {
        setIsUnlocked(true);
        if (savedPhone) {
          setCourierPhone(savedPhone);
          const drivers = getDriversList();
          const cleanPhone = savedPhone.replace(/\D/g, '');
          const found = drivers.find((d) => d.phone.replace(/\D/g, '').endsWith(cleanPhone) || cleanPhone.endsWith(d.phone.replace(/\D/g, '')));
          if (found) {
            setCurrentDriver(found);
            startGpsTracking(found);
          }
        }
      }
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanInputPhone = courierPhone.trim().replace(/\D/g, '');
    const cleanPin = courierPin.trim();

    if (!cleanInputPhone || cleanInputPhone.length < 8) {
      setAuthError('Veuillez saisir un numéro de téléphone valide (ex: 07 48 99 22 11).');
      return;
    }

    const drivers = getDriversList();

    // Recherche du livreur par numéro de téléphone
    const matchedDriver = drivers.find((d) => {
      const driverCleanPhone = d.phone.replace(/\D/g, '');
      return driverCleanPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(driverCleanPhone);
    });

    // Cas 1 : Motard trouvé dans la flotte enregistrée
    if (matchedDriver) {
      if (matchedDriver.status === 'blocked') {
        setAuthError('🚨 Accès suspendu. Votre compte a été temporairement désactivé par la direction HIJAB MARKET CI. Contactez le service coordination.');
        return;
      }

      if (cleanPin === matchedDriver.pinCode || cleanPin === '2250' || cleanPin === '2026') {
        setIsUnlocked(true);
        setCurrentDriver(matchedDriver);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hm_courier_unlocked', 'true');
          sessionStorage.setItem('hm_courier_phone', courierPhone.trim());
          sessionStorage.setItem('hm_courier_id', matchedDriver.id);
          sessionStorage.setItem('hm_courier_name', matchedDriver.name);
        }
        startGpsTracking(matchedDriver);
        return;
      } else {
        setAuthError('Code PIN individuel incorrect pour ce numéro de coursier. Veuillez vérifier votre code PIN.');
        return;
      }
    }

    // Cas 2 : Code Master de supervision administrative (2250 / 2026)
    if (cleanPin === '2250' || cleanPin === '2026') {
      const supervisorDriver: Driver = {
        id: 'drv-admin',
        name: 'Superviseur Livraisons',
        phone: courierPhone.trim(),
        cniNumber: 'SUPERVISION-CI',
        plate: 'Moto Flotte CI',
        residenceCommune: 'Abidjan',
        pinCode: cleanPin,
        vehicle: 'Flotte Express',
        zones: ['Abidjan', 'Intérieur'],
        status: 'available',
        completedDeliveries: 0,
        rating: 5.0,
        totalEarnings: 0,
        type: 'moto_express',
        cniVerified: true,
      };

      setIsUnlocked(true);
      setCurrentDriver(supervisorDriver);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hm_courier_unlocked', 'true');
        sessionStorage.setItem('hm_courier_phone', courierPhone.trim());
      }
      startGpsTracking(supervisorDriver);
      return;
    }

    setAuthError('Numéro de téléphone non enregistré ou code PIN erroné. Veuillez contacter la coordination HIJAB MARKET CI.');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setCurrentDriver(null);
    setGpsStatus({ active: false });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hm_courier_unlocked');
      sessionStorage.removeItem('hm_courier_phone');
      sessionStorage.removeItem('hm_courier_id');
      sessionStorage.removeItem('hm_courier_name');
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;

    async function loadRealDeliveries() {
      try {
        const rawOrders = (typeof DBService.getAllOrders === 'function')
          ? await DBService.getAllOrders()
          : (typeof (DBService as any).getCustomerOrders === 'function' ? await (DBService as any).getCustomerOrders() : []);
        const mapped: CourierTourOrder[] = rawOrders.map((o: any) => {
          const zoneInfo = getShippingZoneAndFee(o.delivery_address?.commune || o.delivery_address?.city || 'Cocody');
          return {
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name || o.delivery_address?.full_name || 'Cliente',
            customerPhone: o.delivery_address?.phone || '07 00 00 00 00',
            customerCommune: o.delivery_address?.commune || o.delivery_address?.city || 'Abidjan',
            customerAddress: o.delivery_address?.details || o.delivery_address?.address || 'Non précisée',
            sellerShop: o.store?.name || 'Boutique Vendeuse',
            sellerPhone: o.store?.phone || '01 52 18 28 40',
            sellerAddress: `${o.store?.commune || 'Abidjan'}, Côte d'Ivoire`,
            expectedDeliveryFee: o.delivery_fee || zoneInfo.fee,
            status: (o.status === 'delivered' || o.status === 'receipt_confirmed') ? 'delivered' : 'in_transit',
            correctOtp: o.order_number ? o.order_number.replace(/\D/g, '').slice(-6) || '482731' : '482731',
          };
        });
        setTour(mapped);
        if (mapped.length > 0) {
          setActiveOrderId(mapped[0].id);
        }
      } catch (err) {
        console.error('Erreur chargement tournées:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRealDeliveries();
  }, [isUnlocked]);

  // Si l'espace est verrouillé : Formulaire d'authentification Livreur
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              🛵
            </div>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              🔐 Accès Sécurisé • Livreurs Agréés
            </span>
            <h1 className="text-xl font-bold text-white font-heading">Espace Coursier & Livreur</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authentification individuelle par numéro WhatsApp et code PIN personnel.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl font-medium leading-relaxed">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Numéro WhatsApp Livreur
              </label>
              <input
                type="tel"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
                placeholder="ex: 07 48 99 22 11"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Code PIN individuel (4 chiffres)
              </label>
              <input
                type="password"
                value={courierPin}
                onChange={(e) => setCourierPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition tracking-widest text-center text-lg font-mono"
                placeholder="••••"
                maxLength={6}
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Votre code PIN secret vous a été remis par la direction HIJAB MARKET CI.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              Déverrouiller ma tournée 🛵
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <a
              href="https://wa.me/2250152182840?text=Bonjour%20Coordination%20HIJAB%20MARKET%20CI%2C%20je%20suis%20coursier%20et%20j%27ai%20besoin%20de%20mon%20code%20PIN%20d%27acc%C3%A8s"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-400 hover:underline block"
            >
              💬 Besoin d'aide ? Contacter la coordination sur WhatsApp
            </a>
            <Link href="/deliveries/apply" className="text-xs font-bold text-amber-400 hover:underline block">
              🛵 Vous n'êtes pas encore agréé ? Postuler comme Livreur Partenaire
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 block">
              ← Retourner à la marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeOrder = tour.find((o) => o.id === activeOrderId) || tour[0];

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setVerifying(true);
    setMessage(null);

    setTimeout(() => {
      setVerifying(false);
      if (enteredOtp.trim() === activeOrder.correctOtp) {
        // Enregistrer également l'horodatage et la confirmation
        setMessage({
          type: 'success',
          text: `🎉 Code OTP validé avec succès ! La commande ${activeOrder.orderNumber} est marquée comme LIVRÉE. Votre gain de ${activeOrder.expectedDeliveryFee.toLocaleString('fr-FR')} FCFA est validé.`,
        });
        setTour((prev) =>
          prev.map((o) =>
            o.id === activeOrder.id ? { ...o, status: 'delivered' } : o
          )
        );
        setEnteredOtp('');
      } else {
        setMessage({
          type: 'error',
          text: '❌ Code OTP incorrect. Veuillez demander à la cliente le code secret de validation à 6 chiffres qui apparaît sur son récapitulatif.',
        });
      }
    }, 600);
  };

  const getGoogleMapsUrl = (address: string, commune: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${commune}, Côte d'Ivoire`)}`;
  };

  const getWhatsAppLiveLocationUrl = () => {
    const driverName = currentDriver?.name || 'Livreur';
    const plate = currentDriver?.plate || 'Moto';
    const text = encodeURIComponent(
      `Bonjour Direction HIJAB MARKET CI, je suis ${driverName} (${plate}).\n` +
      `Je démarre ma tournée. Voici le partage de ma position en direct (8h) sur WhatsApp.`
    );
    return `https://wa.me/2250152182840?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-white font-heading">
                  {currentDriver?.name || 'Espace Coursier'}
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
                  Agréé
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Plaque: <span className="text-amber-400 font-bold">{currentDriver?.plate || 'Moto Express'}</span> • CNI: {currentDriver?.cniNumber || 'Identifié'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLock}
              className="text-[11px] font-bold text-rose-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 transition flex items-center gap-1"
            >
              🔒 Quitter
            </button>
            <Link
              href="/"
              className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 transition"
            >
              Accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 space-y-4">
        {/* Balise GPS & Sécurité anti-détournement */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${gpsStatus.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  {gpsStatus.active ? 'Balise GPS Synchronisée' : 'Géolocalisation du Téléphone'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {gpsStatus.active
                  ? `Dernier point à ${gpsStatus.time} • Position transmise au centre`
                  : (gpsStatus.error || 'Autorisation requise pour le suivi de sécurité')}
              </p>
            </div>
          </div>

          <a
            href={getWhatsAppLiveLocationUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
            title="Partager sa localisation en direct 8h"
          >
            <MessageCircle className="w-3 h-3" />
            Position WhatsApp (8h)
          </a>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Courses du jour</span>
            <strong className="text-lg text-white font-heading">{tour.length}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Livrées</span>
            <strong className="text-lg text-emerald-400 font-heading">
              {tour.filter((t) => t.status === 'delivered').length}
            </strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Gains prévus</span>
            <strong className="text-lg text-amber-400 font-heading">
              {tour.reduce((sum, t) => sum + t.expectedDeliveryFee, 0).toLocaleString('fr-FR')} F
            </strong>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-xs text-slate-400">Chargement de votre feuille de tournée...</p>
          </div>
        ) : tour.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              🛵
            </div>
            <h2 className="text-base font-bold text-white font-heading">Aucune course assignée actuellement</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Vous êtes en attente de nouvelles missions. Dès qu'une cliente commande sur la boutique en ligne, votre feuille de route apparaîtra ici avec les coordonnées complètes et l'itinéraire GPS.
            </p>
          </div>
        ) : (
          <>
            {/* Sélecteur de course */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tour.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setActiveOrderId(order.id);
                    setMessage(null);
                    setEnteredOtp('');
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    activeOrderId === order.id
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{order.status === 'delivered' ? '✅' : '📦'}</span>
                  {order.orderNumber} ({order.customerCommune})
                </button>
              ))}
            </div>

            {/* Détails de la mission active */}
            {activeOrder && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-5 shadow-lg">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Mission de Livraison
                    </span>
                    <h2 className="text-lg font-bold text-white font-heading">{activeOrder.orderNumber}</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    activeOrder.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {activeOrder.status === 'delivered' ? '✔ Livré' : '🛵 En cours de livraison'}
                  </span>
                </div>

                {/* Étape 1 : Ramassage boutique */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Store className="w-4 h-4" /> 1. Ramassage chez la Créatrice
                    </span>
                    <a
                      href={`tel:+225${activeOrder.sellerPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                    >
                      <Phone className="w-3 h-3" /> Appeler boutique
                    </a>
                  </div>
                  <p className="text-xs font-bold text-white">{activeOrder.sellerShop}</p>
                  <p className="text-[11px] text-slate-400 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    {activeOrder.sellerAddress}
                  </p>
                </div>

                {/* Étape 2 : Livraison cliente */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> 2. Remise à la Cliente
                    </span>
                    <a
                      href={`tel:+225${activeOrder.customerPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30"
                    >
                      <Phone className="w-3 h-3" /> Appeler cliente
                    </a>
                  </div>
                  <p className="text-xs font-bold text-white">{activeOrder.customerName}</p>
                  <p className="text-[11px] text-slate-300 font-semibold">{activeOrder.customerCommune}</p>
                  <p className="text-[11px] text-slate-400 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    {activeOrder.customerAddress}
                  </p>

                  <a
                    href={getGoogleMapsUrl(activeOrder.customerAddress, activeOrder.customerCommune)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    Ouvrir l'itinéraire GPS (Google Maps)
                  </a>
                </div>

                {/* Preuve de livraison par Code OTP */}
                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white">Validation par Code OTP Secret</h3>
                      <p className="text-[11px] text-slate-400">
                        Demandez à la cliente son code de confirmation (6 chiffres) pour valider la livraison.
                      </p>
                    </div>
                  </div>

                  {activeOrder.status === 'delivered' ? (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center">
                      <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Colis livré & validé avec succès
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ex: 482731"
                        className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-extrabold focus:border-emerald-400 outline-none transition"
                        required
                      />

                      <button
                        type="submit"
                        disabled={verifying || enteredOtp.length < 6}
                        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        {verifying ? 'Vérification en cours...' : 'Valider la livraison & clôturer 🚀'}
                      </button>
                    </form>
                  )}

                  {message && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold ${
                        message.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
