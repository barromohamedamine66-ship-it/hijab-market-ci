// ==============================================================================
// HIJAB MARKET CI — Gestion des Livreurs Agréés, Fiches CNI & Traçage GPS
// ==============================================================================

export interface Driver {
  id: string;
  name: string;
  phone: string;
  cniNumber: string;         // N° CNI ou Passeport (Obligatoire)
  plate: string;             // Plaque d'immatriculation de la moto
  residenceCommune: string;  // Commune de résidence à Abidjan
  pinCode: string;           // Code PIN individuel d'accès (4-6 chiffres)
  vehicle: string;           // Ex: Moto Boxer 150
  zones: string[];           // Communes desservies
  status: 'available' | 'busy' | 'offline' | 'blocked' | 'pending_approval';
  completedDeliveries: number;
  rating: number;
  totalEarnings: number;
  type: 'moto_express' | 'interurbain';
  cniVerified: boolean;
  cniFrontUrl?: string;      // Photo CNI Recto
  cniBackUrl?: string;       // Photo CNI Verso
  motoPhotoUrl?: string;     // Photo Moto avec Plaque
  selfieUrl?: string;        // Selfie du motard avec sa pièce
  lastLatitude?: number;
  lastLongitude?: number;
  lastGpsTime?: string;
}

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Mamadou Koné',
    phone: '07 48 99 22 11',
    cniNumber: 'CI-002938102',
    plate: '8492-JJ-01',
    residenceCommune: 'Cocody (Angré)',
    pinCode: '4811',
    vehicle: 'Moto Boxer 150',
    zones: ['Cocody', 'Marcory', 'Plateau'],
    status: 'available',
    completedDeliveries: 142,
    rating: 4.9,
    totalEarnings: 213000,
    type: 'moto_express',
    cniVerified: true,
    lastLatitude: 5.3599,
    lastLongitude: -4.0083,
    lastGpsTime: 'Il y a 10 min',
  },
  {
    id: 'drv-2',
    name: 'Seydou Diarra',
    phone: '05 12 34 88 90',
    cniNumber: 'CI-001847291',
    plate: '5311-GH-01',
    residenceCommune: 'Yopougon (Maroc)',
    pinCode: '1290',
    vehicle: 'Moto Yamaha Crux',
    zones: ['Yopougon', 'Attécoubé', 'Adjamé'],
    status: 'available',
    completedDeliveries: 98,
    rating: 4.8,
    totalEarnings: 196000,
    type: 'moto_express',
    cniVerified: true,
    lastLatitude: 5.3400,
    lastLongitude: -4.0700,
    lastGpsTime: 'Il y a 25 min',
  },
  {
    id: 'drv-3',
    name: 'Ibrahim Bamba',
    phone: '01 55 44 33 22',
    cniNumber: 'CI-004829103',
    plate: '9921-KL-01',
    residenceCommune: 'Koumassi (Remblais)',
    pinCode: '5522',
    vehicle: 'Moto Haojue 125',
    zones: ['Koumassi', 'Treichville', 'Port-Bouët'],
    status: 'available',
    completedDeliveries: 115,
    rating: 4.9,
    totalEarnings: 172500,
    type: 'moto_express',
    cniVerified: true,
    lastLatitude: 5.2950,
    lastLongitude: -3.9550,
    lastGpsTime: 'Il y a 40 min',
  },
  {
    id: 'drv-4',
    name: 'Lassina Touré (Banlieue)',
    phone: '07 77 88 99 00',
    cniNumber: 'CI-003719401',
    plate: '1244-TR-01',
    residenceCommune: 'Bingerville',
    pinCode: '7700',
    vehicle: 'Moto Boxer 150 Pro',
    zones: ['Bingerville', 'Anyama', 'Grand-Bassam'],
    status: 'available',
    completedDeliveries: 76,
    rating: 4.8,
    totalEarnings: 190000,
    type: 'moto_express',
    cniVerified: true,
  },
  {
    id: 'drv-5',
    name: 'Compagnie UTB Colis Express',
    phone: '27 20 21 22 23',
    cniNumber: 'RCCM-CI-ABJ-1998-B',
    plate: 'Réseau Autocars CI',
    residenceCommune: 'Gare Adjamé / Treichville',
    pinCode: '2720',
    vehicle: 'Lignes Nationales Autocars',
    zones: ['Bouaké', 'Yamoussoukro', 'Korhogo', 'San-Pédro', 'Daloa'],
    status: 'available',
    completedDeliveries: 230,
    rating: 4.9,
    totalEarnings: 690000,
    type: 'interurbain',
    cniVerified: true,
  },
];

export const STORAGE_KEY_DRIVERS = 'hm_registered_drivers';

export function getStoredDrivers(): Driver[] {
  if (typeof window === 'undefined') return INITIAL_DRIVERS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DRIVERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Erreur lecture drivers:', e);
  }
  return INITIAL_DRIVERS;
}

export function saveStoredDrivers(drivers: Driver[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
  } catch (e) {
    console.error('Erreur sauvegarde drivers:', e);
  }
}
