// ==============================================================================
// HIJAB MARKET CI — Système de Commission Marketplace (7%)
// ==============================================================================

export const PLATFORM_COMMISSION_PERCENT = 7; // Taux officiel : 7%

export interface CommissionBreakdown {
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  sellerNetAmount: number;
  deliveryFee: number;
  totalPaid: number;
}

/**
 * Calcule la répartition financière d'une commande
 * @param subtotal Montant brut des articles vendus
 * @param deliveryFee Frais de livraison (reversés au livreur)
 */
export function calculateOrderCommission(subtotal: number, deliveryFee: number = 1500): CommissionBreakdown {
  const commissionAmount = Math.round((subtotal * PLATFORM_COMMISSION_PERCENT) / 100);
  const sellerNetAmount = subtotal - commissionAmount;
  const totalPaid = subtotal + deliveryFee;

  return {
    subtotal,
    commissionRate: PLATFORM_COMMISSION_PERCENT,
    commissionAmount,
    sellerNetAmount,
    deliveryFee,
    totalPaid,
  };
}
