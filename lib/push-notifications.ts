// ==============================================================================
// HIJAB MARKET CI — Système de Notifications Push & Réengagement Mobile
// ==============================================================================

const STORAGE_KEYS = {
  PUSH_ENABLED: 'hm_push_notifications_enabled',
  LAST_WELCOME_SENT: 'hm_last_welcome_notif',
  LAST_FLASH_SENT: 'hm_last_flash_notif',
  LAST_CART_REMINDER: 'hm_last_cart_reminder',
  SUBSCRIPTION_DATA: 'hm_push_subscription_data',
};

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Vérifie si les notifications sont supportées par le navigateur
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      'Notification' in window &&
      typeof window.Notification !== 'undefined' &&
      'serviceWorker' in navigator &&
      typeof navigator.serviceWorker !== 'undefined'
    );
  } catch {
    return false;
  }
}

/**
 * Retourne l'état actuel de la permission
 */
export function getNotificationPermissionState(): NotificationPermissionStatus {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    return (window.Notification?.permission as NotificationPermissionStatus) || 'unsupported';
  } catch {
    return 'unsupported';
  }
}

/**
 * Demande la permission à l'utilisateur
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const permission = await window.Notification.requestPermission();
    const isGranted = permission === 'granted';

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, isGranted ? 'true' : 'false');
      } catch (_) {}
    }

    if (isGranted) {
      // Envoyer la notification de bienvenue
      await sendWelcomeNotification();
      // Enregistrer l'abonnement
      await registerPushSubscription();
    }

    return isGranted;
  } catch (err) {
    console.warn('Erreur lors de la demande de permission de notification :', err);
    return false;
  }
}

/**
 * Envoie une notification locale immédiate via le Service Worker
 */
export async function sendLocalPushNotification(options: {
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
}): Promise<boolean> {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'SHOW_LOCAL_NOTIFICATION',
        title: options.title,
        body: options.body,
        url: options.url || '/products',
        image: options.image,
        tag: options.tag || `hm-local-${Date.now()}`,
      });
      return true;
    }
  } catch (err) {
    console.warn('Erreur envoi notification locale :', err);
  }

  // Fallback direct si le service worker n'est pas actif
  try {
    new Notification(options.title, {
      body: options.body,
      icon: '/icon-192x192.png',
      badge: '/favicon.png',
    });
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Notification de Bienvenue lors de l'activation
 */
export async function sendWelcomeNotification(): Promise<void> {
  if (typeof window === 'undefined') return;

  const alreadySent = localStorage.getItem(STORAGE_KEYS.LAST_WELCOME_SENT);
  if (alreadySent) return;

  await sendLocalPushNotification({
    title: 'Bienvenue sur HIJAB MARKET CI ! 🎉🧕',
    body: 'Vous recevrez désormais les alertes de ventes flash, nouveaux arrivages et suivi de vos commandes en Côte d\'Ivoire.',
    url: '/products',
    tag: 'hm-welcome-notif',
  });

  localStorage.setItem(STORAGE_KEYS.LAST_WELCOME_SENT, new Date().toISOString());
}

/**
 * Notification de test immédiate (déclenchée depuis le profil utilisateur)
 */
export async function sendTestNotification(): Promise<boolean> {
  const perm = await requestPushPermission();
  if (!perm) return false;

  return await sendLocalPushNotification({
    title: 'HIJAB MARKET CI — Test Réussi ! 🔔✨',
    body: 'Vos notifications fonctionnent parfaitement sur votre téléphone. Vous ne manquerez aucune opportunité !',
    url: '/products?tag=flash',
    tag: 'hm-test-notif',
  });
}

/**
 * Vérifie et déclenche les alertes d'engagement (Ventes flash quotidiennes & Paniers)
 */
export function initEngagementScheduler(cartCount: number = 0, cartTotal: number = 0): void {
  if (typeof window === 'undefined' || !isPushNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const now = Date.now();

  // 1. Alerte Ventes Flash & Nouveautés (max 1 fois par 24h)
  const lastFlash = localStorage.getItem(STORAGE_KEYS.LAST_FLASH_SENT);
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (!lastFlash || now - parseInt(lastFlash, 10) > oneDayMs) {
    // Programmer après un court délai pour ne pas gêner la session en cours
    setTimeout(() => {
      sendLocalPushNotification({
        title: '🔥 Ventes Flash Mode Modeste du Jour !',
        body: 'Nouvelles soies de Médine, abayas et boubous à prix réduits disponibles aujourd\'hui.',
        url: '/products',
        tag: 'hm-daily-flash',
      });
      localStorage.setItem(STORAGE_KEYS.LAST_FLASH_SENT, now.toString());
    }, 12000); // 12 secondes après le chargement
  }

  // 2. Rappel Panier en attente (si articles dans le panier > 1h)
  if (cartCount > 0) {
    const lastCartReminder = localStorage.getItem(STORAGE_KEYS.LAST_CART_REMINDER);
    const twoHoursMs = 2 * 60 * 60 * 1000;

    if (!lastCartReminder || now - parseInt(lastCartReminder, 10) > twoHoursMs) {
      setTimeout(() => {
        sendLocalPushNotification({
          title: `🛍️ Vos ${cartCount} articles vous attendent !`,
          body: `Votre panier de ${cartTotal.toLocaleString('fr-FR')} FCFA est toujours réservé. Finalisez votre commande avant rupture de stock.`,
          url: '/cart',
          tag: 'hm-cart-reminder',
        });
        localStorage.setItem(STORAGE_KEYS.LAST_CART_REMINDER, now.toString());
      }, 45000); // 45 secondes
    }
  }
}

/**
 * Enregistrement du PushSubscription (Web Push standard)
 */
async function registerPushSubscription(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) return;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ),
      });
    }

    if (subscription) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, JSON.stringify(subscription));
    }
  } catch (err) {
    // Silencieux
  }
}

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
