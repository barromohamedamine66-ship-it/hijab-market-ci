'use client';

import { useEffect } from 'react';
import PwaInstallPrompt from './PwaInstallPrompt';
import PwaUpdateToast from './PwaUpdateToast';

export default function PwaRegistry() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Vérifier si un worker est déjà en attente
        if (registration.waiting) {
          window.dispatchEvent(
            new CustomEvent('sw-update-available', {
              detail: { worker: registration.waiting },
            })
          );
        }

        // Écouter les mises à jour futures
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(
                new CustomEvent('sw-update-available', {
                  detail: { worker: newWorker },
                })
              );
            }
          });
        });

        // Vérifier régulièrement les mises à jour (toutes les heures)
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (error) {
        console.warn('Enregistrement Service Worker échoué :', error);
      }
    };

    // Enregistrer après le chargement complet de la page pour ne pas ralentir le FCP
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  return (
    <>
      <PwaInstallPrompt />
      <PwaUpdateToast />
    </>
  );
}
