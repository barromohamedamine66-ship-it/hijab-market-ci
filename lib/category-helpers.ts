// ==============================================================================
// HIJAB MARKET CI — Spécifications intelligentes par Catégorie
// ==============================================================================

export interface CategorySpec {
  sizeLabel: string;
  sizePlaceholder: string;
  sizePresets: string[];
  materialLabel: string;
  materialPlaceholder: string;
  colorsLabel: string;
  colorsPlaceholder: string;
  defaultSizes: string;
  defaultMaterial: string;
  defaultColors: string;
  allowEmptySizes?: boolean;
}

export function getCategorySpec(categoryNameOrSlug?: string): CategorySpec {
  const norm = (categoryNameOrSlug || '').toLowerCase();

  // 1. Parfums, Muscs, Encens, Bakhoor & Soins
  if (
    norm.includes('parfum') ||
    norm.includes('musc') ||
    norm.includes('beaute') ||
    norm.includes('cosmetique') ||
    norm.includes('sunnah') ||
    norm.includes('encens') ||
    norm.includes('bakhoor')
  ) {
    return {
      sizeLabel: 'Contenance / Format (Flacon ou Spray)',
      sizePlaceholder: 'ex: 6ml Roll-on, 12ml, 30ml Spray, 50ml...',
      sizePresets: [
        '6ml (Roll-on)',
        '12ml',
        '30ml Spray',
        '50ml Eau de Parfum',
        '100ml Eau de Parfum',
        'Format Standard',
      ],
      materialLabel: 'Type / Notes olfactives',
      materialPlaceholder: 'ex: Huile concentrée sans alcool, Musc blanc, Oud royal, Ambre...',
      colorsLabel: 'Senteurs / Déclinaisons',
      colorsPlaceholder: 'ex: Musc Tahara, Oud Royal, Vanille Dorée...',
      defaultSizes: '6ml (Roll-on)',
      defaultMaterial: 'Huile concentrée sans alcool',
      defaultColors: 'Musc Blanc, Oud, Tahara',
    };
  }

  // 2. Hijabs, Voiles, Khimars & Turbans
  if (
    norm.includes('hijab') ||
    norm.includes('voile') ||
    norm.includes('khimar') ||
    norm.includes('turban') ||
    norm.includes('foulard')
  ) {
    return {
      sizeLabel: 'Dimensions / Format du Hijab',
      sizePlaceholder: 'ex: Standard (180x70 cm), Maxi (200x80 cm)...',
      sizePresets: [
        'Standard (180x70 cm)',
        'Maxi (200x80 cm)',
        'Carré (120x120 cm)',
        'Carré (140x140 cm)',
        'Taille Unique',
        'Double Voile (1m50)',
      ],
      materialLabel: 'Matière / Tissu',
      materialPlaceholder: 'ex: Soie de Médine, Mousseline crêpe, Jersey premium...',
      colorsLabel: 'Couleurs disponibles',
      colorsPlaceholder: 'ex: Vert Sauge, Noir, Nude, Camel, Beige...',
      defaultSizes: 'Standard (180x70 cm)',
      defaultMaterial: 'Soie de Médine Opaque',
      defaultColors: 'Vert Émeraude, Noir, Beige',
    };
  }

  // 3. Abayas, Robes, Kimonos, Jalabiyas, Boubous, Ensembles & Qamis
  if (
    norm.includes('abaya') ||
    norm.includes('robe') ||
    norm.includes('kimono') ||
    norm.includes('jalabiya') ||
    norm.includes('boubou') ||
    norm.includes('ensemble') ||
    norm.includes('pret-a-porter') ||
    norm.includes('homme') ||
    norm.includes('qamis') ||
    norm.includes('bazin')
  ) {
    return {
      sizeLabel: 'Tailles / Longueurs de la Tenue',
      sizePlaceholder: 'ex: 52, 54, 56, 58 ou S, M, L, XL, XXL...',
      sizePresets: [
        '52 (1m55)',
        '54 (1m60)',
        '56 (1m65)',
        '58 (1m70)',
        '60 (1m75)',
        'S',
        'M',
        'L',
        'XL',
        'XXL',
        '3XL',
        'Taille Unique',
        'Sur-mesure',
      ],
      materialLabel: 'Matière / Tissu',
      materialPlaceholder: 'ex: Nidha royal coréen, Crêpe de Dubaï, Bazin riche Getzner...',
      colorsLabel: 'Couleurs disponibles',
      colorsPlaceholder: 'ex: Noir intense, Bleu nuit, Vert émeraude, Doré...',
      defaultSizes: '54 (1m60), 56 (1m65), 58 (1m70)',
      defaultMaterial: 'Nidha royal coréen haut de gamme',
      defaultColors: 'Noir, Bleu Nuit, Vert Émeraude',
    };
  }

  // 4. Mode Enfants
  if (norm.includes('enfant') || norm.includes('bebe') || norm.includes('fillette')) {
    return {
      sizeLabel: 'Âges / Tailles enfant',
      sizePlaceholder: 'ex: 2-4 ans, 4-6 ans, 6-8 ans...',
      sizePresets: [
        '2-4 ans',
        '4-6 ans',
        '6-8 ans',
        '8-10 ans',
        '10-12 ans',
        '12-14 ans',
        'Taille Unique',
      ],
      materialLabel: 'Matière / Tissu',
      materialPlaceholder: 'ex: Coton bio doux, Jersey respirant...',
      colorsLabel: 'Couleurs disponibles',
      colorsPlaceholder: 'ex: Rose poudré, Blanc, Vert menthe...',
      defaultSizes: '4-6 ans, 6-8 ans, 8-10 ans',
      defaultMaterial: 'Coton doux hypoallergénique',
      defaultColors: 'Rose poudré, Blanc, Nude',
    };
  }

  // 5. Gourdes & Thermos
  if (norm.includes('gourde') || norm.includes('thermos') || norm.includes('bouteille')) {
    return {
      sizeLabel: 'Capacité / Volume',
      sizePlaceholder: 'ex: 500 ml, 750 ml, 1 Litre...',
      sizePresets: ['500 ml', '750 ml', '1 Litre', 'Format Standard'],
      materialLabel: 'Matériau / Finition',
      materialPlaceholder: 'ex: Inox double paroi isotherme (garde chaud 12h / froid 24h)...',
      colorsLabel: 'Coloris / Gravures disponibles',
      colorsPlaceholder: 'ex: Noir mat, Or rose, Argenté, Vert olive...',
      defaultSizes: '500 ml',
      defaultMaterial: 'Acier inoxydable 304 double paroi',
      defaultColors: 'Noir Mat, Or Rose, Blanc Nacré',
    };
  }

  // 6. Chaussures & Maroquinerie
  if (
    norm.includes('chaussure') ||
    norm.includes('babouche') ||
    norm.includes('sandale') ||
    norm.includes('mule')
  ) {
    return {
      sizeLabel: 'Pointures disponibles',
      sizePlaceholder: 'ex: 37, 38, 39, 40, 41...',
      sizePresets: ['36', '37', '38', '39', '40', '41', '42', '43', 'Taille Unique'],
      materialLabel: 'Matière / Finition',
      materialPlaceholder: 'ex: Cuir véritable artisanal, Simili cuir doré...',
      colorsLabel: 'Couleurs disponibles',
      colorsPlaceholder: 'ex: Doré, Noir, Camel, Blanc...',
      defaultSizes: '37, 38, 39, 40',
      defaultMaterial: 'Cuir artisanal souple',
      defaultColors: 'Doré, Noir, Camel',
    };
  }

  // 7. Tapis de Prière, Coffrets & Accessoires Divers
  if (
    norm.includes('tapis') ||
    norm.includes('coffret') ||
    norm.includes('cadeau') ||
    norm.includes('bonnet') ||
    norm.includes('bijoux') ||
    norm.includes('sac')
  ) {
    return {
      sizeLabel: 'Format / Dimensions',
      sizePlaceholder: 'ex: Standard (110x70 cm), Taille Unique...',
      sizePresets: [
        'Taille Unique',
        'Standard (110x70 cm)',
        'Grand Format Épais',
        'Coffret Complet',
        'Format Voyage Pliable',
      ],
      materialLabel: 'Matière / Finition',
      materialPlaceholder: 'ex: Velours moussé doux, Satin, Plaqué or...',
      colorsLabel: 'Couleurs / Modèles',
      colorsPlaceholder: 'ex: Vert Émeraude & Or, Bleu Nuit, Doré...',
      defaultSizes: 'Taille Unique',
      defaultMaterial: 'Velours royal haute densité',
      defaultColors: 'Vert Émeraude, Bleu Nuit, Doré',
    };
  }

  // Défaut standard
  return {
    sizeLabel: 'Tailles / Dimensions',
    sizePlaceholder: 'ex: Standard, Taille Unique ou S, M, L...',
    sizePresets: ['Taille Unique', 'Standard', 'S', 'M', 'L', 'XL'],
    materialLabel: 'Matière / Tissu',
    materialPlaceholder: 'ex: Coton, Soie, Lin...',
    colorsLabel: 'Couleurs disponibles',
    colorsPlaceholder: 'ex: Vert, Noir, Beige...',
    defaultSizes: 'Taille Unique',
    defaultMaterial: 'Qualité Supérieure',
    defaultColors: 'Noir, Beige, Blanc',
  };
}

/**
 * Retourne le libellé client approprié pour l'affichage de la taille sur la fiche produit
 */
export function getProductSizeDisplayLabel(categoryNameOrSlug?: string): string {
  const norm = (categoryNameOrSlug || '').toLowerCase();
  if (
    norm.includes('parfum') ||
    norm.includes('musc') ||
    norm.includes('beaute') ||
    norm.includes('cosmetique') ||
    norm.includes('encens')
  ) {
    return 'Contenance / Format';
  }
  if (
    norm.includes('hijab') ||
    norm.includes('voile') ||
    norm.includes('khimar') ||
    norm.includes('tapis')
  ) {
    return 'Dimensions';
  }
  if (
    norm.includes('gourde') ||
    norm.includes('thermos')
  ) {
    return 'Capacité';
  }
  if (
    norm.includes('chaussure') ||
    norm.includes('babouche')
  ) {
    return 'Pointure';
  }
  if (
    norm.includes('enfant')
  ) {
    return 'Âge / Taille';
  }
  return 'Taille';
}
