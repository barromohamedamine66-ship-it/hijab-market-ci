'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Truck, ShieldCheck, CheckCircle2, Phone, MapPin,
  ArrowLeft, MessageCircle, FileText, Sparkles, Upload,
  Camera, Image as ImageIcon, X, AlertTriangle
} from 'lucide-react';
import { getStoredDrivers, saveStoredDrivers, type Driver } from '@/lib/delivery/drivers';

export default function CourierApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cniNumber: '',
    plate: '',
    vehicle: 'Moto Boxer 150',
    residenceCommune: 'Cocody',
    zones: ['Cocody', 'Marcory', 'Plateau'],
  });

  const [photos, setPhotos] = useState<{
    cniFront: string | null;
    cniBack: string | null;
    motoPhoto: string | null;
    selfie: string | null;
  }>({
    cniFront: null,
    cniBack: null,
    motoPhoto: null,
    selfie: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableZones = [
    'Cocody (Angré, Riviera, Deux-Plateaux)',
    'Marcory (Zone 4, Biétry)',
    'Plateau',
    'Yopougon (Maroc, Niangon, Toits Rouges)',
    'Koumassi',
    'Treichville',
    'Adjamé',
    'Abobo',
    'Port-Bouët',
    'Bingerville',
    'Grand-Bassam',
  ];

  const handleZoneToggle = (zone: string) => {
    setFormData((prev) => {
      const exists = prev.zones.includes(zone);
      if (exists) {
        return { ...prev, zones: prev.zones.filter((z) => z !== zone) };
      } else {
        return { ...prev, zones: [...prev.zones, zone] };
      }
    });
  };

  // Traitement et compression légère de l'image en Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'cniFront' | 'cniBack' | 'motoPhoto' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("L'image est trop volumineuse (maximum 5 Mo). Veuillez en choisir une plus légère.");
      return;
    }
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Redimensionner pour optimiser la mémoire du navigateur
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const scaleSize = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotos((prev) => ({ ...prev, [field]: dataUrl }));
        } else {
          setPhotos((prev) => ({ ...prev, [field]: event.target?.result as string }));
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (field: 'cniFront' | 'cniBack' | 'motoPhoto' | 'selfie') => {
    setPhotos((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation du numéro CNI (Format CI : 11 chiffres NNI ou C/CI + chiffres)
    const cleanCni = formData.cniNumber.replace(/[\s-]/g, '').toUpperCase();
    if (cleanCni.length < 9) {
      setErrorMsg("Le numéro de CNI semble invalide. Veuillez entrer votre N° National d'Identification (11 chiffres) ou votre numéro CNI officiel.");
      return;
    }

    // Validation de la plaque moto
    const cleanPlate = formData.plate.trim();
    if (cleanPlate.length < 5) {
      setErrorMsg("Veuillez saisir une plaque d'immatriculation valide (ex: 8492-JJ-01).");
      return;
    }

    // Vérification des photos obligatoires
    if (!photos.cniFront) {
      setErrorMsg("Veuillez ajouter la photo du RECTO de votre CNI.");
      return;
    }
    if (!photos.motoPhoto) {
      setErrorMsg("Veuillez ajouter la photo de votre MOTO (avec la plaque bien visible).");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newApplication: Driver = {
        id: `drv-app-${Date.now()}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        cniNumber: formData.cniNumber.trim().toUpperCase(),
        plate: formData.plate.trim().toUpperCase(),
        residenceCommune: formData.residenceCommune.trim(),
        pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
        vehicle: formData.vehicle.trim(),
        zones: formData.zones.length > 0 ? formData.zones : ['Abidjan Centre'],
        status: 'pending_approval',
        completedDeliveries: 0,
        rating: 5.0,
        totalEarnings: 0,
        type: 'moto_express',
        cniVerified: false,
        cniFrontUrl: photos.cniFront || undefined,
        cniBackUrl: photos.cniBack || undefined,
        motoPhotoUrl: photos.motoPhoto || undefined,
        selfieUrl: photos.selfie || undefined,
      };

      const existing = getStoredDrivers();
      saveStoredDrivers([newApplication, ...existing]);

      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const getWhatsAppNotifyUrl = () => {
    const text = encodeURIComponent(
      `Bonjour Direction HIJAB MARKET CI,\n\n` +
      `Je viens de soumettre ma candidature comme LIVREUR PARTENAIRE avec mes photos de pièces justificatives :\n` +
      `- Nom : ${formData.name}\n` +
      `- Téléphone : ${formData.phone}\n` +
      `- N° CNI : ${formData.cniNumber}\n` +
      `- Plaque Moto : ${formData.plate}\n` +
      `- Commune : ${formData.residenceCommune}\n\n` +
      `J'attends l'examen de mon dossier et mon code PIN d'accès.`
    );
    return `https://wa.me/2250152182840?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Retour marketplace
          </Link>
          <Link
            href="/dashboard/delivery"
            className="text-xs font-bold text-emerald-400 hover:underline"
          >
            Déjà agréé ? Accéder à l'espace livreur →
          </Link>
        </div>

        {/* Confirmation Screen */}
        {submitted ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              🎉
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Dossier complet avec justificatifs envoyé
              </span>
              <h1 className="text-2xl font-bold text-white font-heading">
                Candidature Livreur Partenaire Enregistrée
              </h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Merci <strong>{formData.name}</strong> ! Vos photos de pièces (CNI et plaque moto) ont été transmises à la direction <strong>HIJAB MARKET CI</strong>. 
                Après vérification visuelle, vous recevrez votre <strong>Code PIN secret d'accès</strong> par message WhatsApp.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-400">
                <span>Téléphone WhatsApp :</span>
                <strong className="text-white">{formData.phone}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>N° CNI transmis :</span>
                <strong className="text-slate-200 font-mono">{formData.cniNumber}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plaque Moto :</span>
                <strong className="text-amber-400 font-mono">{formData.plate}</strong>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
                <span>Photos transmises :</span>
                <strong className="text-emerald-400">CNI Recto/Verso + Moto OK</strong>
              </div>
            </div>

            <div className="space-y-3 pt-2 max-w-md mx-auto">
              <a
                href={getWhatsAppNotifyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Notifier la Direction sur WhatsApp pour accélérer la validation ⚡
              </a>

              <Link
                href="/"
                className="block text-xs text-slate-500 hover:text-slate-400 pt-2"
              >
                Retourner à la boutique
              </Link>
            </div>
          </div>
        ) : (
          /* Formulaire de Candidature */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Truck className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Recrutement Express Livreur</span>
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Devenir Livreur Agréé HIJAB MARKET CI
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rejoignez le réseau officiel de coursiers express à Abidjan. Rémunération immédiate de 
                <strong> 1 500 F à 3 000 F FCFA par course</strong> versée directement par commande.
              </p>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-white">Sécurité & Vérification Visuelle Obligatoire :</strong>
                Pour éviter toute usurpation et protéger les commandes des clientes, la photo nette de votre 
                <strong> CNI</strong> et la photo de votre <strong>moto avec la plaque visible</strong> sont requises pour validation par l'administration.
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Coordonnées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Nom et Prénoms complets *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mamadou Koné"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Numéro de Téléphone WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 07 00 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition text-xs font-medium"
                  />
                </div>
              </div>

              {/* Pièces et Moto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    N° CNI ou NNI (11 chiffres) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: CI-002938102 ou 10012345678"
                    value={formData.cniNumber}
                    onChange={(e) => setFormData({ ...formData, cniNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white uppercase font-mono outline-none focus:border-emerald-500 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Plaque d'Immatriculation Moto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 8492-JJ-01"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white uppercase font-mono outline-none focus:border-emerald-500 transition text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Commune de Résidence à Abidjan *
                  </label>
                  <select
                    value={formData.residenceCommune}
                    onChange={(e) => setFormData({ ...formData, residenceCommune: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition text-xs"
                  >
                    <option value="Cocody">Cocody (Angré, Riviera, Deux-Plateaux...)</option>
                    <option value="Yopougon">Yopougon (Maroc, Niangon, Toits Rouges...)</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Plateau">Le Plateau</option>
                    <option value="Adjamé">Adjamé</option>
                    <option value="Treichville">Treichville</option>
                    <option value="Abobo">Abobo</option>
                    <option value="Port-Bouët">Port-Bouët</option>
                    <option value="Attécoubé">Attécoubé</option>
                    <option value="Bingerville">Bingerville</option>
                    <option value="Grand-Bassam">Grand-Bassam</option>
                    <option value="Autre commune">Autre commune</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Modèle de Moto utilisée *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Boxer 150, Yamaha Crux, Haojue 125..."
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition text-xs"
                  />
                </div>
              </div>

              {/* SECTION PHOTOS JUSTIFICATIVES */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs">Photos Justificatives Obligatoires (Anti-Vol)</h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Prenez des photos nettes avec votre téléphone ou sélectionnez-les depuis votre galerie.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo CNI Recto */}
                  <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 bg-slate-900/50 transition">
                    <span className="block text-[10px] font-bold uppercase text-slate-300 mb-2 flex items-center justify-between">
                      <span>🪪 1. CNI (Face Recto) *</span>
                      {photos.cniFront && <span className="text-emerald-400 text-[10px]">✅ Chargée</span>}
                    </span>
                    {photos.cniFront ? (
                      <div className="relative rounded-xl overflow-hidden h-28 bg-black border border-emerald-500/40 group">
                        <img src={photos.cniFront} alt="CNI Recto" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto('cniFront')}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                          title="Supprimer la photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-slate-800 hover:bg-slate-800/40 cursor-pointer transition text-center p-2">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-300 font-semibold">Prendre photo CNI Recto</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Visage & nom bien lisibles</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'cniFront')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Photo CNI Verso */}
                  <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 bg-slate-900/50 transition">
                    <span className="block text-[10px] font-bold uppercase text-slate-300 mb-2 flex items-center justify-between">
                      <span>🪪 2. CNI (Face Verso)</span>
                      {photos.cniBack && <span className="text-emerald-400 text-[10px]">✅ Chargée</span>}
                    </span>
                    {photos.cniBack ? (
                      <div className="relative rounded-xl overflow-hidden h-28 bg-black border border-emerald-500/40 group">
                        <img src={photos.cniBack} alt="CNI Verso" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto('cniBack')}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                          title="Supprimer la photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-slate-800 hover:bg-slate-800/40 cursor-pointer transition text-center p-2">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-300 font-semibold">Prendre photo CNI Verso</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Bande de sécurité</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'cniBack')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Photo Moto avec Plaque */}
                  <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 bg-slate-900/50 transition">
                    <span className="block text-[10px] font-bold uppercase text-slate-300 mb-2 flex items-center justify-between">
                      <span>🛵 3. Moto & Plaque visible *</span>
                      {photos.motoPhoto && <span className="text-emerald-400 text-[10px]">✅ Chargée</span>}
                    </span>
                    {photos.motoPhoto ? (
                      <div className="relative rounded-xl overflow-hidden h-28 bg-black border border-emerald-500/40 group">
                        <img src={photos.motoPhoto} alt="Moto avec Plaque" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto('motoPhoto')}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                          title="Supprimer la photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-slate-800 hover:bg-slate-800/40 cursor-pointer transition text-center p-2">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-300 font-semibold">Photo Moto + Plaque</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Plaque d'immatriculation nette</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'motoPhoto')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Selfie du Motard */}
                  <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 bg-slate-900/50 transition">
                    <span className="block text-[10px] font-bold uppercase text-slate-300 mb-2 flex items-center justify-between">
                      <span>🤳 4. Selfie du Motard</span>
                      {photos.selfie && <span className="text-emerald-400 text-[10px]">✅ Chargé</span>}
                    </span>
                    {photos.selfie ? (
                      <div className="relative rounded-xl overflow-hidden h-28 bg-black border border-emerald-500/40 group">
                        <img src={photos.selfie} alt="Selfie motard" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto('selfie')}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                          title="Supprimer la photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-28 rounded-xl border border-slate-800 hover:bg-slate-800/40 cursor-pointer transition text-center p-2">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-300 font-semibold">Prendre un Selfie</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">Visage du conducteur</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'selfie')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Zones de livraison préférées */}
              <div className="space-y-2 pt-1">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  Communes où vous êtes le plus rapide :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableZones.map((zone, idx) => {
                    const isSelected = formData.zones.includes(zone);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleZoneToggle(zone)}
                        className={`py-2 px-3 rounded-xl border text-left text-[11px] transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>📍 {zone}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Transmission du dossier sécurisé...' : 'Envoyer ma Candidature Livreur 🚀'}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  En postulant, vous certifiez l'authenticité de vos pièces d'identité et de votre permis.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
