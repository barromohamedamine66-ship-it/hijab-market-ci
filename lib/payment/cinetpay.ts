// ==============================================================================
// HIJAB MARKET CI — Service d'Intégration CinetPay & Mobile Money Côte d'Ivoire
// ==============================================================================

declare global {
  interface Window {
    CinetPay?: {
      setConfig: (config: {
        apikey: string;
        site_id: string;
        notify_url: string;
        close_after_ma?: boolean;
        mode?: 'PRODUCTION' | 'TEST';
      }) => void;
      getCheckout: (data: {
        transaction_id: string;
        amount: number;
        currency: string;
        channels: string;
        description: string;
        customer_name?: string;
        customer_surname?: string;
        customer_email?: string;
        customer_phone_number?: string;
        customer_address?: string;
        customer_city?: string;
        customer_country?: string;
        customer_state?: string;
        customer_zip_code?: string;
      }) => void;
      waitResponse: (callback: (data: { status: string; operator_id?: string }) => void) => void;
      onError: (callback: (error: any) => void) => void;
      onClose?: (callback: () => void) => void;
    };
  }
}

export interface CinetPayPaymentParams {
  transactionId: string;
  amount: number;
  description: string;
  channel?: 'wave' | 'orange_money' | 'mtn_momo' | 'all';
  customer: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
  };
  onSuccess: (data: { status: string; operator_id?: string; transaction_id: string }) => void;
  onError: (error: any) => void;
  onClose?: () => void;
}

/**
 * Charge dynamiquement le script officiel CinetPay Seamless
 */
export function loadCinetPayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);

    if (window.CinetPay) {
      return resolve(true);
    }

    const existingScript = document.getElementById('cinetpay-seamless-sdk');
    if (existingScript) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.id = 'cinetpay-seamless-sdk';
    script.src = 'https://seamless.cinetpay.com/cinetpay.prod.min.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Impossible de charger le SDK CinetPay en ligne.');
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Vérifie si les identifiants marchands CinetPay sont configurés
 */
export function isCinetPayConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
  const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;
  return Boolean(apiKey && siteId && !apiKey.includes('placeholder'));
}

/**
 * Déclenche le guichet de paiement CinetPay
 */
export async function launchCinetPayCheckout(params: CinetPayPaymentParams): Promise<void> {
  const isLoaded = await loadCinetPayScript();

  const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY || '';
  const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '';

  // Si pas de clés configurées, on simule ou on bascule vers le transfert direct
  if (!apiKey || !siteId || !isLoaded || !window.CinetPay) {
    console.warn('CinetPay non configuré ou indisponible. Bascule sur le mode direct.');
    throw new Error('CINETPAY_NOT_CONFIGURED');
  }

  // Déterminer les canaux autorisés selon le choix du client
  let channels = 'ALL';
  if (params.channel === 'wave') channels = 'WALLET,MOBILE_MONEY';
  else if (params.channel === 'orange_money') channels = 'MOBILE_MONEY';
  else if (params.channel === 'mtn_momo') channels = 'MOBILE_MONEY';

  const notifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/payments/cinetpay/notify`
    : 'https://hijab-market-ci.vercel.app/api/payments/cinetpay/notify';

  window.CinetPay.setConfig({
    apikey: apiKey,
    site_id: siteId,
    notify_url: notifyUrl,
    close_after_ma: true,
    mode: 'PRODUCTION',
  });

  window.CinetPay.getCheckout({
    transaction_id: params.transactionId,
    amount: params.amount,
    currency: 'XOF',
    channels: channels,
    description: params.description,
    customer_name: params.customer.name,
    customer_surname: '',
    customer_email: params.customer.email || `${params.customer.phone.replace(/\D/g, '')}@client.hijabmarket.ci`,
    customer_phone_number: params.customer.phone.replace(/\D/g, ''),
    customer_address: params.customer.address || 'Abidjan',
    customer_city: params.customer.city || 'Abidjan',
    customer_country: 'CI',
    customer_state: 'CI',
    customer_zip_code: '00225',
  });

  window.CinetPay.waitResponse((data) => {
    if (data.status === 'ACCEPTED') {
      params.onSuccess({
        status: data.status,
        operator_id: data.operator_id,
        transaction_id: params.transactionId,
      });
    } else {
      params.onError(new Error(`Paiement refusé : ${data.status}`));
    }
  });

  window.CinetPay.onError((err) => {
    params.onError(err);
  });
}
