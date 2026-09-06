'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck, Package, Phone, MapPin, CheckCircle2,
  Clock, AlertCircle, MessageCircle, UserCheck, Search,
  Filter, ChevronRight, ExternalLink, ShieldCheck, Navigation,
  Layers, Settings, Bus, ShieldAlert, KeyRound, Eye, EyeOff,
  UserPlus, X, Lock, Unlock, AlertTriangle, RefreshCw, UserX,
  Camera, Image as ImageIcon, FileText, ZoomIn
} from 'lucide-react';
import { SHIPPING_ZONES, getShippingZoneAndFee, type LogisticsZone } from '@/lib/delivery/shipping-zones';
import { DBService } from '@/lib/supabase/db-service';
import {
  type Driver,
  INITIAL_DRIVERS,
  getStoredDrivers,
  saveStoredDrivers
} from '@/lib/delivery/drivers';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  date: string;
  sellerShop: string;
  sellerCommune: string;
  sellerPhone: string;
  customerName: string;
  customerPhone: string;
  customerCommune: string;
  customerAddress: string;
  assignedDriverId: string;
  assignedDriverName: string;
  assignedDriverPhone: string;
  transportType: 'moto' | 'interurbain';
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered';
  otpCode: string;
  otpVerified: boolean;
  deliveryFee: number;
}

export default function AdminDeliveriesPage() {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'drivers' | 'zones'>('deliveries');
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTransport, setFilterTransport] = useState<string>('all');

  // Sécurité : Affichage des PINs
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Modal Ajout Livreur
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    cniNumber: '',
    plate: '',
    residenceCommune: 'Cocody',
    vehicle: 'Moto Boxer 150',
    pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
    zones: 'Cocody, Marcory, Plateau',
  });

  // Modal Édition PIN
  const [editingPinDriver, setEditingPinDriver] = useState<Driver | null>(null);
  const [tempPin, setTempPin] = useState('');

  // Modal Inspection Document / Photo Livreur
  const [inspectingPhoto, setInspectingPhoto] = useState<{
    title: string;
    url: string;
    driverName: string;
  } | null>(null);

  // Charger les livreurs persistés
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDrivers = localStorage.getItem('hm_registered_drivers');
      if (savedDrivers) {
        try {
          const parsed = JSON.parse(savedDrivers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDrivers(parsed);
          }
        } catch (e) {
          console.error('Erreur lecture hm_registered_drivers:', e);
        }
      } else {
        localStorage.setItem('hm_registered_drivers', JSON.stringify(INITIAL_DRIVERS));
      }
    }
  }, []);

  // Sauvegarder dans localStorage dès modification
  const saveDrivers = (updated: Driver[]) => {
    setDrivers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hm_registered_drivers', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    async function loadRealDeliveries() {
      try {
        const rawOrders = (typeof DBService.getAllOrders === 'function')
          ? await DBService.getAllOrders()
          : (typeof (DBService as any).getCustomerOrders === 'function' ? await (DBService as any).getCustomerOrders() : []);
        const mapped: DeliveryOrder[] = rawOrders.map((o: any) => {
          const zoneInfo = getShippingZoneAndFee(o.delivery_address?.commune || o.delivery_address?.city || 'Cocody');
          return {
            id: o.id,
            orderNumber: o.order_number,
            date: new Date(o.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }),
            sellerShop: o.store?.name || 'Boutique Vendeuse',
            sellerCommune: o.store?.commune || 'Abidjan',
            sellerPhone: o.store?.phone || '01 52 18 28 40',
            customerName: o.customer_name || o.delivery_address?.full_name || 'Cliente',
            customerPhone: o.delivery_address?.phone || '07 00 00 00 00',
            customerCommune: `${o.delivery_address?.commune || o.delivery_address?.city || 'Abidjan'} (${zoneInfo.name})`,
            customerAddress: o.delivery_address?.details || o.delivery_address?.address || 'Non renseignée',
            assignedDriverId: 'pending',
            assignedDriverName: 'À assigner',
            assignedDriverPhone: '—',
            transportType: zoneInfo.zoneId === 4 ? 'interurbain' : 'moto',
            status: (o.status === 'delivered' || o.status === 'receipt_confirmed') ? 'delivered' : 'in_transit',
            otpCode: o.order_number ? o.order_number.replace(/\D/g, '').slice(-6) || '482910' : '482910',
            otpVerified: o.status === 'delivered' || o.status === 'receipt_confirmed',
            deliveryFee: o.delivery_fee || zoneInfo.fee,
          };
        });
        setOrders(mapped);
      } catch (err) {
        console.error('Erreur chargement livraisons:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRealDeliveries();
  }, []);

  // Validation d'une candidature de livreur
  const handleApproveDriver = (driverId: string) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        return {
          ...d,
          status: 'available' as Driver['status'],
          cniVerified: true,
          pinCode: d.pinCode || Math.floor(1000 + Math.random() * 9000).toString(),
        };
      }
      return d;
    });
    saveDrivers(updated);
  };

  // Rejet d'une candidature
  const handleRejectDriver = (driverId: string) => {
    const updated = drivers.filter((d) => d.id !== driverId);
    saveDrivers(updated);
  };

  // Bloquer / Réactiver un livreur
  const handleToggleBlock = (driverId: string) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        const nextStatus: Driver['status'] = d.status === 'blocked' ? 'available' : 'blocked';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    saveDrivers(updated);
  };

  const handleOpenPinModal = (drv: Driver) => {
    setEditingPinDriver(drv);
    setTempPin(drv.pinCode);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPinDriver || !tempPin.trim()) return;
    const updated = drivers.map((d) =>
      d.id === editingPinDriver.id ? { ...d, pinCode: tempPin.trim() } : d
    );
    saveDrivers(updated);
    setEditingPinDriver(null);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.cniNumber || !newDriver.plate) return;

    const created: Driver = {
      id: `drv-${Date.now()}`,
      name: newDriver.name.trim(),
      phone: newDriver.phone.trim(),
      cniNumber: newDriver.cniNumber.trim().toUpperCase(),
      plate: newDriver.plate.trim().toUpperCase(),
      residenceCommune: newDriver.residenceCommune.trim(),
      pinCode: newDriver.pinCode.trim(),
      vehicle: newDriver.vehicle.trim(),
      zones: newDriver.zones.split(',').map((z) => z.trim()).filter(Boolean),
      status: 'available',
      completedDeliveries: 0,
      rating: 5.0,
      totalEarnings: 0,
      type: 'moto_express',
      cniVerified: true,
    };

    saveDrivers([created, ...drivers]);
    setShowAddModal(false);
    setNewDriver({
      name: '',
      phone: '',
      cniNumber: '',
      plate: '',
      residenceCommune: 'Cocody',
      vehicle: 'Moto Boxer 150',
      pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
      zones: 'Cocody, Marcory, Plateau',
    });
  };

  const togglePinVisibility = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrage des livraisons
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerCommune.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchTransport = filterTransport === 'all' || o.transportType === filterTransport;
    return matchSearch && matchStatus && matchTransport;
  });

  const getStatusBadge = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending_pickup':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> À ramasser
          </span>
        );
      case 'picked_up':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Truck className="w-3 h-3" /> En cours de livraison
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Livré (OTP Validé)
          </span>
        );
    }
  };

  const getDriverStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Disponible
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ● En tournée
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            ○ Hors ligne
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            🚨 Suspendu / Bloqué
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            🟡 Candidature à Valider
          </span>
        );
    }
  };

  const getWhatsAppMissionUrl = (order: DeliveryOrder) => {
    const text = encodeURIComponent(
      `*MISSION DE LIVRAISON — HIJAB MARKET CI*\n\n` +
      `📦 *Commande N° :* ${order.orderNumber}\n` +
      `🏬 *Ramassage (Boutique) :* ${order.sellerShop} (${order.sellerCommune})\n` +
      `📞 *Tél Boutique :* ${order.sellerPhone}\n\n` +
      `📍 *Destination (Cliente) :* ${order.customerName}\n` +
      `🏠 *Adresse :* ${order.customerAddress}, ${order.customerCommune}\n` +
      `📱 *Tél Cliente :* ${order.customerPhone}\n\n` +
      `💰 *Tarif Livreur :* ${order.deliveryFee.toLocaleString('fr-FR')} FCFA\n` +
      `🔐 *Consigne Sécurité :* Demandez impérativement le code secret OTP à 6 chiffres à la cliente avant de lui remettre le colis.\n\n` +
      `Lien d'accès livreur : https://hijab-market-ci-vqg6.vercel.app/dashboard/delivery`
    );
    return `https://wa.me/2250152182840?text=${text}`;
  };

  // URL WhatsApp pour envoyer les identifiants et le code PIN au livreur
  const getWhatsAppCredentialsUrl = (drv: Driver) => {
    const text = encodeURIComponent(
      `Bonjour ${drv.name},\n\n` +
      `Voici votre accès officiel pour vos livraisons sur HIJAB MARKET CI :\n\n` +
      `🛵 Lien de votre tournée : https://hijab-market-ci-vqg6.vercel.app/dashboard/delivery\n` +
      `📱 Votre identifiant : ${drv.phone}\n` +
      `🔐 Votre Code PIN secret : ${drv.pinCode}\n\n` +
      `⚠️ Consignes de sécurité impératives :\n` +
      `1. Ce code PIN est strictement personnel et confidentiel.\n` +
      `2. Activez toujours la balise GPS sur votre smartphone pendant votre tournée.\n` +
      `3. Demandez impérativement le code secret OTP à 6 chiffres à la cliente avant de lui remettre son colis.\n\n` +
      `Bonne route et excellentes livraisons ! 🚀`
    );
    return `https://wa.me/225${drv.phone.replace(/\s+/g, '')}?text=${text}`;
  };

  const pendingDrivers = drivers.filter((d) => d.status === 'pending_approval');
  const activeDrivers = drivers.filter((d) => d.status !== 'pending_approval');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-[#0a0f12] text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl shadow-inner">
              🚚
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                Logistique Nationale & Livreurs Agréés
              </h1>
              <p className="text-xs text-slate-400">
                Supervision des expéditions, validation des candidatures CNI & traçage GPS des motards en Côte d'Ivoire.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/deliveries/apply"
            target="_blank"
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            📋 Lien Postuler Livreur
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/dashboard/delivery"
            target="_blank"
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            Accès Espace Livreur
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Enregistrer un Livreur
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0f171d] border border-slate-800 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Expéditions Totales</span>
          <div className="text-2xl font-extrabold text-white">{orders.length}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">100% commandes réelles</span>
        </div>

        <div className="bg-[#0f171d] border border-slate-800 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Livreurs Agréés Actifs</span>
          <div className="text-2xl font-extrabold text-white">{activeDrivers.length}</div>
          <span className="text-[10px] text-sky-400 font-semibold">CNI & Plaques Vérifiées</span>
        </div>

        <div className="bg-[#0f171d] border border-slate-800 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidatures en attente</span>
          <div className={`text-2xl font-extrabold ${pendingDrivers.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {pendingDrivers.length}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">À valider par l'admin</span>
        </div>

        <div className="bg-[#0f171d] border border-slate-800 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sécurité Anti-Vol</span>
          <div className="text-2xl font-extrabold text-emerald-400">PIN + OTP + GPS</div>
          <span className="text-[10px] text-emerald-400/80 font-semibold">Traçage satellite</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'deliveries'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          Suivi des Colis & Expéditions ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'drivers'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          Flotte des Livreurs, CNI & Traçage GPS ({drivers.length})
          {pendingDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold">
              {pendingDrivers.length} en attente
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'zones'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Grille des 4 Zones Logistiques
        </button>
      </div>

      {/* TAB 1: Suivi des Colis */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher commande, cliente, commune..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f171d] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterTransport}
                onChange={(e) => setFilterTransport(e.target.value)}
                className="bg-[#0f171d] border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
              >
                <option value="all">Tous les transports</option>
                <option value="moto">🛵 Moto Express Abidjan</option>
                <option value="interurbain">🚌 Expéditions Intérieur (Cars)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0f171d] border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending_pickup">À ramasser</option>
                <option value="picked_up">Colis récupéré</option>
                <option value="in_transit">En route</option>
                <option value="delivered">Livrées (OTP Validé)</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-12 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                🛵
              </div>
              <h3 className="font-bold text-white text-base font-heading">
                Aucune expédition en cours
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Dès qu'une cliente passera une commande sur la marketplace, la mission apparaîtra ici avec son code OTP de validation sécurisée.
              </p>
            </div>
          ) : (
            <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">N° Commande</th>
                      <th className="py-4 px-6">Ramassage (Boutique)</th>
                      <th className="py-4 px-6">Destination (Cliente)</th>
                      <th className="py-4 px-6">Livreur / Transporteur</th>
                      <th className="py-4 px-6">Frais & OTP</th>
                      <th className="py-4 px-6 text-right">Ordre de Mission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-white block">{o.orderNumber}</span>
                          <span className="text-[10px] text-slate-500">{o.date}</span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-200 block">{o.sellerShop}</span>
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {o.sellerCommune}
                          </span>
                          <span className="text-[10px] text-slate-500">{o.sellerPhone}</span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-200 block">{o.customerName}</span>
                          <span className="text-[11px] text-sky-400 flex items-center gap-1 font-semibold">
                            <MapPin className="w-3 h-3" /> {o.customerCommune}
                          </span>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]" title={o.customerAddress}>
                            {o.customerAddress}
                          </p>
                          <span className="text-[10px] text-slate-500">{o.customerPhone}</span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                              {o.transportType === 'moto' ? '🛵' : '🚌'}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{o.assignedDriverName}</span>
                              <span className="text-[10px] text-slate-400">{o.assignedDriverPhone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(o.status)}
                              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                {o.deliveryFee.toLocaleString('fr-FR')} F
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-slate-500">Code OTP :</span>
                              <strong className="font-mono text-amber-400 tracking-wider">
                                {o.otpVerified ? '•••••• (Validé)' : o.otpCode}
                              </strong>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <a
                            href={getWhatsAppMissionUrl(o)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Flotte des Livreurs avec CNI & Traçage GPS */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Bannière de présentation */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Sécurité Anti-Détournement & Validation des Motards</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Vous contrôlez chaque admission : examinez la CNI et la plaque du motard, validez sa candidature en 1 clic et transmettez-lui son code PIN secret directement par WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/deliveries/apply"
                target="_blank"
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
              >
                📋 Formulaire Postuler
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition whitespace-nowrap flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Nouveau Livreur Agréé
              </button>
            </div>
          </div>

          {/* SECTION SPÉCIALE : Candidatures en attente de validation */}
          {pendingDrivers.length > 0 && (
            <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                    🟡
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Candidatures de Livreurs en Attente d'Examen ({pendingDrivers.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ces motards ont postulé en ligne. Vérifiez leurs pièces avant de leur débloquer l'accès.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {pendingDrivers.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-[#0f171d] border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{candidate.name}</h4>
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {candidate.phone}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase">
                        En Attente
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">N° CNI / Passeport :</span>
                        <strong className="text-white">{candidate.cniNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Plaque Moto :</span>
                        <strong className="text-amber-400">{candidate.plate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Commune Résidence :</span>
                        <strong className="text-slate-200 font-sans">{candidate.residenceCommune}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Véhicule :</span>
                        <strong className="text-slate-200 font-sans">{candidate.vehicle}</strong>
                      </div>
                    </div>

                    {/* Pièces Justificatives Téléversées */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Pièces & Photos d'Identité :
                        </span>
                        <span className="text-[10px] text-slate-400">Cliquez pour zoomer</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {/* CNI Recto */}
                        <button
                          type="button"
                          onClick={() => candidate.cniFrontUrl && setInspectingPhoto({
                            title: "Carte Nationale d'Identité (Recto)",
                            url: candidate.cniFrontUrl,
                            driverName: candidate.name
                          })}
                          disabled={!candidate.cniFrontUrl}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            candidate.cniFrontUrl
                              ? 'bg-slate-900 border-slate-700 hover:border-emerald-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                              : 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                          }`}
                          title={candidate.cniFrontUrl ? "Voir CNI Recto en grand" : "Non fournie"}
                        >
                          {candidate.cniFrontUrl ? (
                            <>
                              <img
                                src={candidate.cniFrontUrl}
                                alt="CNI Recto"
                                className="w-full h-9 object-cover rounded-lg border border-slate-700"
                              />
                              <span className="text-[9px] font-bold text-emerald-300 truncate w-full">CNI Recto</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-[9px] text-slate-500">Non fournie</span>
                            </>
                          )}
                        </button>

                        {/* CNI Verso */}
                        <button
                          type="button"
                          onClick={() => candidate.cniBackUrl && setInspectingPhoto({
                            title: "Carte Nationale d'Identité (Verso)",
                            url: candidate.cniBackUrl,
                            driverName: candidate.name
                          })}
                          disabled={!candidate.cniBackUrl}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            candidate.cniBackUrl
                              ? 'bg-slate-900 border-slate-700 hover:border-emerald-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                              : 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                          }`}
                          title={candidate.cniBackUrl ? "Voir CNI Verso en grand" : "Non fournie"}
                        >
                          {candidate.cniBackUrl ? (
                            <>
                              <img
                                src={candidate.cniBackUrl}
                                alt="CNI Verso"
                                className="w-full h-9 object-cover rounded-lg border border-slate-700"
                              />
                              <span className="text-[9px] font-bold text-emerald-300 truncate w-full">CNI Verso</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-[9px] text-slate-500">Non fournie</span>
                            </>
                          )}
                        </button>

                        {/* Moto avec Plaque */}
                        <button
                          type="button"
                          onClick={() => candidate.motoPhotoUrl && setInspectingPhoto({
                            title: "Moto avec Plaque d'Immatriculation Visible",
                            url: candidate.motoPhotoUrl,
                            driverName: candidate.name
                          })}
                          disabled={!candidate.motoPhotoUrl}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            candidate.motoPhotoUrl
                              ? 'bg-slate-900 border-slate-700 hover:border-amber-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                              : 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                          }`}
                          title={candidate.motoPhotoUrl ? "Voir Moto & Plaque en grand" : "Non fournie"}
                        >
                          {candidate.motoPhotoUrl ? (
                            <>
                              <img
                                src={candidate.motoPhotoUrl}
                                alt="Moto & Plaque"
                                className="w-full h-9 object-cover rounded-lg border border-slate-700"
                              />
                              <span className="text-[9px] font-bold text-amber-300 truncate w-full">Moto Plaque</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4 text-slate-500" />
                              <span className="text-[9px] text-slate-500">Non fournie</span>
                            </>
                          )}
                        </button>

                        {/* Selfie avec Pièce */}
                        <button
                          type="button"
                          onClick={() => candidate.selfieUrl && setInspectingPhoto({
                            title: "Selfie du Motard avec sa Pièce d'Identité",
                            url: candidate.selfieUrl,
                            driverName: candidate.name
                          })}
                          disabled={!candidate.selfieUrl}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            candidate.selfieUrl
                              ? 'bg-slate-900 border-slate-700 hover:border-sky-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                              : 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                          }`}
                          title={candidate.selfieUrl ? "Voir Selfie en grand" : "Non fournie"}
                        >
                          {candidate.selfieUrl ? (
                            <>
                              <img
                                src={candidate.selfieUrl}
                                alt="Selfie Motard"
                                className="w-full h-9 object-cover rounded-lg border border-slate-700"
                              />
                              <span className="text-[9px] font-bold text-sky-300 truncate w-full">Selfie</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 text-slate-500" />
                              <span className="text-[9px] text-slate-500">Non fournie</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveDriver(candidate.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Valider & Générer PIN
                      </button>

                      <a
                        href={`https://wa.me/225${candidate.phone.replace(/\s+/g, '')}?text=Bonjour%20${encodeURIComponent(candidate.name)}%2C%20HIJAB%20MARKET%20CI.%20J%27examine%20votre%20candidature%20livreur.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center"
                        title="Contacter le candidat sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </a>

                      <button
                        onClick={() => handleRejectDriver(candidate.id)}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center"
                        title="Rejeter la candidature"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grille des Livreurs Agréés Actifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDrivers.map((drv) => (
              <div
                key={drv.id}
                className={`bg-[#0f171d] rounded-3xl border p-6 shadow-sm flex flex-col justify-between space-y-4 transition ${
                  drv.status === 'blocked' ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
                }`}
              >
                {/* Driver Top Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                      {drv.type === 'moto_express' ? '🛵' : '🚌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{drv.name}</h3>
                        {drv.cniVerified && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/40 flex items-center gap-0.5" title="CNI & Identité Vérifiée">
                            <ShieldCheck className="w-3 h-3" /> CNI OK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" /> {drv.phone}
                      </p>
                    </div>
                  </div>
                  {getDriverStatusBadge(drv.status)}
                </div>

                {/* Identification Fiche Anti-Vol */}
                <div className="bg-[#141f27] rounded-2xl p-3 text-xs space-y-2 border border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">N° CNI / Passeport</span>
                      <strong className="text-slate-200 font-mono">{drv.cniNumber || 'Non renseigné'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Plaque Moto</span>
                      <strong className="text-amber-400 font-mono">{drv.plate || 'Non renseignée'}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Résidence :</span>
                    <span className="font-bold text-slate-200">{drv.residenceCommune || 'Abidjan'}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Véhicule :</span>
                    <span className="font-bold text-slate-200">{drv.vehicle}</span>
                  </div>

                  {/* Code PIN individuel */}
                  <div className="flex justify-between items-center bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400 text-xs">Code PIN d'accès :</span>
                      <strong className="font-mono text-sm tracking-wider text-amber-300">
                        {revealedPins[drv.id] ? drv.pinCode : '••••'}
                      </strong>
                      <button
                        onClick={() => togglePinVisibility(drv.id)}
                        className="text-slate-400 hover:text-white transition p-1"
                        title="Afficher/Masquer le PIN"
                      >
                        {revealedPins[drv.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenPinModal(drv)}
                      className="text-[10px] font-bold text-sky-400 hover:underline"
                    >
                      Modifier PIN
                    </button>
                  </div>

                  {/* Geolocation Section */}
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-2.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Traçage GPS en direct
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {drv.lastGpsTime || 'En attente de connexion'}
                      </span>
                    </div>

                    {drv.lastLatitude && drv.lastLongitude ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-300 font-mono">
                          📍 {drv.lastLatitude.toFixed(4)}, {drv.lastLongitude.toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${drv.lastLatitude},${drv.lastLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          Voir sur Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">
                        La position se met à jour automatiquement dès que le motard se connecte sur son smartphone.
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                    <div className="flex justify-between">
                      <span>Livraisons :</span>
                      <strong className="text-emerald-400">{drv.completedDeliveries}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total généré :</span>
                      <strong className="text-amber-400">{drv.totalEarnings.toLocaleString('fr-FR')} F</strong>
                    </div>
                  </div>

                  {/* Documents & Pièces d'identité archivées si disponibles */}
                  {(drv.cniFrontUrl || drv.cniBackUrl || drv.motoPhotoUrl || drv.selfieUrl) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium">Dossier vérifié :</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {drv.cniFrontUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingPhoto({
                              title: "CNI Recto",
                              url: drv.cniFrontUrl!,
                              driverName: drv.name
                            })}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1 transition"
                          >
                            <FileText className="w-2.5 h-2.5" /> CNI Recto
                          </button>
                        )}
                        {drv.cniBackUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingPhoto({
                              title: "CNI Verso",
                              url: drv.cniBackUrl!,
                              driverName: drv.name
                            })}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1 transition"
                          >
                            <FileText className="w-2.5 h-2.5" /> CNI Verso
                          </button>
                        )}
                        {drv.motoPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingPhoto({
                              title: "Photo Moto & Plaque",
                              url: drv.motoPhotoUrl!,
                              driverName: drv.name
                            })}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 transition"
                          >
                            <Truck className="w-2.5 h-2.5" /> Moto
                          </button>
                        )}
                        {drv.selfieUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingPhoto({
                              title: "Selfie Livreur",
                              url: drv.selfieUrl!,
                              driverName: drv.name
                            })}
                            className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center gap-1 transition"
                          >
                            <UserCheck className="w-2.5 h-2.5" /> Selfie
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOUTON MAGIQUE : ENVOYER LES ACCÈS & LE PIN PAR WHATSAPP */}
                <a
                  href={getWhatsAppCredentialsUrl(drv)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  title="Envoyer les identifiants et le code PIN sur le WhatsApp du livreur"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  📲 Envoyer Accès & Code PIN par WhatsApp
                </a>

                {/* Actions Bar Secondaire */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://wa.me/225${drv.phone.replace(/\s+/g, '')}?text=Bonjour%20${encodeURIComponent(drv.name)}%2C%20HIJAB%20MARKET%20CI.%20Merci%20d%27activer%20le%20partage%20de%20position%20en%20direct%20sur%20WhatsApp%20pour%20ta%20tourn%C3%A9e.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Position Directe
                  </a>

                  <a
                    href={`tel:+225${drv.phone.replace(/\s+/g, '')}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center"
                    title="Appeler directement"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleToggleBlock(drv.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      drv.status === 'blocked'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                    title={drv.status === 'blocked' ? "Réactiver l'accès" : "Couper immédiatement l'accès au livreur"}
                  >
                    {drv.status === 'blocked' ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Réactiver
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Suspendre
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Grille des Zones Logistiques */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.values(SHIPPING_ZONES).map((z) => (
              <div
                key={z.id}
                className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {z.transportType === 'moto' ? '🛵 Moto Express' : '🚌 Expédition Car Interurbain'}
                    </span>
                    <h3 className="font-bold text-white text-base font-heading">{z.name}</h3>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-2xl border border-emerald-500/30">
                    {z.defaultFee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{z.description}</p>

                <div className="p-3 bg-[#141f27] rounded-2xl text-xs space-y-1.5 border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Délai moyen garanti :</span>
                    <strong className="text-white">{z.delay}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Règlement :</span>
                    <strong className="text-emerald-400">100% reversé au transporteur</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Communes ou Villes Couvertes :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {z.locations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-800/80 text-slate-200 px-2.5 py-1 rounded-xl border border-slate-700/80"
                      >
                        📍 {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Enregistrer un Nouveau Livreur avec CNI & Moto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f171d] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Enregistrer un Livreur Agréé
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fiche d'identité et code PIN individuel anti-détournement
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Nom et Prénoms
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Oumar Coulibaly"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Téléphone WhatsApp Livreur
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 07 11 22 33 44"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    N° CNI / Passeport (Obligatoire)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: CI-009847112"
                    value={newDriver.cniNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, cniNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Plaque Moto (Obligatoire)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 4892-JJ-01"
                    value={newDriver.plate}
                    onChange={(e) => setNewDriver({ ...newDriver, plate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Commune de Résidence
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Yopougon, Cocody..."
                    value={newDriver.residenceCommune}
                    onChange={(e) => setNewDriver({ ...newDriver, residenceCommune: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Modèle Véhicule / Moto
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Moto Boxer 150"
                    value={newDriver.vehicle}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Code PIN individuel (4 chiffres)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewDriver({ ...newDriver, pinCode: Math.floor(1000 + Math.random() * 9000).toString() })}
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Régénérer
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newDriver.pinCode}
                  onChange={(e) => setNewDriver({ ...newDriver, pinCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-center text-base tracking-widest outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400">
                  C'est ce code secret que vous communiquerez au motard pour déverrouiller sa tournée sur son smartphone.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-md flex items-center justify-center gap-1.5"
                >
                  Enregistrer & Activer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modifier le code PIN d'un livreur */}
      {editingPinDriver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f171d] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Modifier le Code PIN
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingPinDriver.name}</p>
              </div>
              <button
                onClick={() => setEditingPinDriver(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Nouveau Code PIN Livreur (4 chiffres)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xl tracking-widest text-amber-400 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPinDriver(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspection Haute Définition d'un document / photo */}
      {inspectingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectingPhoto(null)}
        >
          <div
            className="bg-[#0f171d] border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-emerald-400" />
                  <span>Contrôle Document : {inspectingPhoto.title}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Candidat Livreur : <strong className="text-white">{inspectingPhoto.driverName}</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectingPhoto(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center max-h-[65vh] p-2">
              <img
                src={inspectingPhoto.url}
                alt={inspectingPhoto.title}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Vérifiez que le nom et la plaque concordent.
              </span>
              <button
                onClick={() => setInspectingPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Fermer l'Aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
