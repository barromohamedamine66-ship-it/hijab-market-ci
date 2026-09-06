// ==============================================================================
// HIJAB MARKET CI — Grille Logistique & Tarification des Livraisons Côte d'Ivoire
// ==============================================================================

export type LogisticsZone = 'abidjan_centre' | 'abidjan_peripherie' | 'abidjan_banlieue' | 'interieur';

export interface ShippingZoneInfo {
  id: LogisticsZone;
  zoneId: number;
  name: string;
  shortName: string;
  description: string;
  defaultFee: number;
  fee: number;
  delay: string;
  transportType: 'moto' | 'interurbain';
  badgeColor: string;
  locations: string[];
}

export const SHIPPING_ZONES: Record<LogisticsZone, ShippingZoneInfo> = {
  abidjan_centre: {
    id: 'abidjan_centre',
    zoneId: 1,
    name: 'Zone 1 : Abidjan Centre & Communes Proches',
    shortName: 'Abidjan Centre',
    description: 'Cocody, Plateau, Marcory, Treichville, Adjamé, Koumassi',
    defaultFee: 1500,
    fee: 1500,
    delay: '2h à 4h (ou max 24h)',
    transportType: 'moto',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    locations: [
      'Cocody (Angré, Riviera, Deux-Plateaux, Blockhauss)',
      'Plateau',
      'Marcory (Zone 4, Biétry, Résidentiel)',
      'Treichville',
      'Adjamé',
      'Koumassi',
    ],
  },
  abidjan_peripherie: {
    id: 'abidjan_peripherie',
    zoneId: 2,
    name: 'Zone 2 : Abidjan Périphérie',
    shortName: 'Abidjan Périphérie',
    description: 'Yopougon, Abobo, Port-Bouët, Attécoubé',
    defaultFee: 2000,
    fee: 2000,
    delay: 'Dans la journée (24h)',
    transportType: 'moto',
    badgeColor: 'bg-sky-500/10 text-sky-700 border-sky-200',
    locations: [
      'Yopougon (Maroc, Niangon, Toits Rouges, Gesco)',
      'Abobo (Sogefiha, Samaké, PK18, N\'Dotré)',
      'Port-Bouët (Aéroport, Vridi, Derrière Warf)',
      'Attécoubé',
    ],
  },
  abidjan_banlieue: {
    id: 'abidjan_banlieue',
    zoneId: 3,
    name: 'Zone 3 : Grand Abidjan & Banlieue',
    shortName: 'Grand Abidjan / Banlieue',
    description: 'Bingerville, Songon, Anyama, Grand-Bassam',
    defaultFee: 2500,
    fee: 2500,
    delay: '24h à 48h',
    transportType: 'moto',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200',
    locations: [
      'Bingerville',
      'Anyama',
      'Songon',
      'Grand-Bassam',
    ],
  },
  interieur: {
    id: 'interieur',
    zoneId: 4,
    name: 'Zone 4 : Intérieur du Pays (Villes de Province)',
    shortName: 'Intérieur du Pays',
    description: 'Expédition sécurisée par Car (UTB, CTE...) ou Relais Colis',
    defaultFee: 3000,
    fee: 3000,
    delay: '48h à 72h',
    transportType: 'interurbain',
    badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-200',
    locations: [
      'Yamoussoukro',
      'Bouaké',
      'San-Pédro',
      'Korhogo',
      'Daloa',
      'Man',
      'Gagnoa',
      'Soubré',
      'Divo',
      'Abengourou',
      'Agboville',
      'Dabou',
      'Grand-Lahou',
      'Bondoukou',
      'Ferkessédougou',
      'Odienné',
      'Autre ville de l\'intérieur',
    ],
  },
};

/**
 * Détermine la zone et le tarif selon la ville et la commune sélectionnées
 */
export function getShippingZoneAndFee(cityOrCommune?: string, communeOrCity?: string): ShippingZoneInfo {
  const normLoc = `${cityOrCommune || ''} ${communeOrCity || ''}`.trim().toLowerCase();

  // Si explicitement mentionné intérieur ou villes hors Abidjan
  const isInterieurCity = SHIPPING_ZONES.interieur.locations.some((l) =>
    normLoc.includes(l.toLowerCase().split(' ')[0])
  );
  if (isInterieurCity || (cityOrCommune && cityOrCommune.toLowerCase() !== 'abidjan' && !normLoc.includes('cocody') && !normLoc.includes('plateau') && !normLoc.includes('yopougon') && !normLoc.includes('abobo') && !normLoc.includes('marcory'))) {
    return SHIPPING_ZONES.interieur;
  }

  // Vérification dans Abidjan Périphérie (Yopougon, Abobo, Port-Bouët, Attécoubé)
  if (
    normLoc.includes('yopougon') ||
    normLoc.includes('abobo') ||
    normLoc.includes('port-bouët') ||
    normLoc.includes('port-bouet') ||
    normLoc.includes('attécoubé') ||
    normLoc.includes('attecoube')
  ) {
    return SHIPPING_ZONES.abidjan_peripherie;
  }

  // Vérification dans Grand Abidjan / Banlieue (Bingerville, Anyama, Songon, Grand-Bassam)
  if (
    normLoc.includes('bingerville') ||
    normLoc.includes('anyama') ||
    normLoc.includes('songon') ||
    normLoc.includes('bassam')
  ) {
    return SHIPPING_ZONES.abidjan_banlieue;
  }

  // Par défaut : Abidjan Centre (Cocody, Plateau, Marcory, Treichville, Adjamé, Koumassi)
  return SHIPPING_ZONES.abidjan_centre;
}
