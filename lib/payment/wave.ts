// ==============================================================================
// HIJAB MARKET CI — Configuration Officielle Wave Business Côte d'Ivoire
// ==============================================================================

export interface WaveConfig {
  merchantPhone: string;
  businessName: string;
  wavePaymentLink: string;
  officialMessage: string;
}

// Configuration officielle du compte marchand Wave CI
export const WAVE_CI_CONFIG: WaveConfig = {
  merchantPhone: '07 77 39 38 13',
  businessName: 'HIJABMARKET.CI',
  wavePaymentLink: 'https://pay.wave.com/m/M_ci_YBdDvRRAwSih/c/ci/',
  officialMessage: 'Veuillez Payer HIJABMARKET.CI avec Wave en cliquant sur ce lien https://pay.wave.com/m/M_ci_YBdDvRRAwSih/c/ci/. Ajoutez cet expéditeur à vos contacts pour rendre le lien cliquable.',
};

/**
 * Retourne le lien de paiement officiel Wave Business
 */
export function getWavePaymentUrl(amount?: number, orderNumber?: string): string {
  const baseLink = WAVE_CI_CONFIG.wavePaymentLink;
  if (!amount) return baseLink;

  try {
    const url = new URL(baseLink);
    if (amount) url.searchParams.set('amount', amount.toString());
    if (orderNumber) url.searchParams.set('client_reference', orderNumber);
    return url.toString();
  } catch {
    return baseLink;
  }
}

/**
 * Retourne les liens Wave optimisés pour mobile (Intent Android et lien universel)
 */
export function getWaveDeepLink(): {
  universalUrl: string;
  androidIntentUrl: string;
} {
  return {
    universalUrl: WAVE_CI_CONFIG.wavePaymentLink,
    androidIntentUrl: 'intent://pay.wave.com/m/M_ci_YBdDvRRAwSih/c/ci/#Intent;scheme=https;package=com.wave.personal;end',
  };
}

/**
 * Crée une session de checkout Wave
 */
export async function createWaveCheckoutSession(params: {
  orderNumber: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  successUrl?: string;
  errorUrl?: string;
}): Promise<{ wave_launch_url?: string; error?: string }> {
  try {
    const url = getWavePaymentUrl(params.amount, params.orderNumber);
    return { wave_launch_url: url };
  } catch (err: any) {
    return { error: err?.message || 'Erreur lors de la génération du lien Wave' };
  }
}


