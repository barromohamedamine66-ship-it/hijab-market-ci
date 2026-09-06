'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Store, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur accède directement à /auth/register, on l'oriente vers la page vendeuse après un court instant ou immédiat
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 font-heading mb-2">
          Aucun compte requis pour commander !
        </h1>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Sur <span className="font-bold text-gray-900">HIJAB MARKET CI</span>, nous avons simplifié votre expérience : les clientes n&apos;ont plus besoin de créer de compte. Vous commandez directement avec votre numéro de téléphone et votre adresse de livraison.
        </p>

        <div className="space-y-3">
          <Link
            href="/products"
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Découvrir les hijabs & commander
          </Link>

          <Link
            href="/auth/register/vendor"
            className="w-full py-3 px-6 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold rounded-full transition flex items-center justify-center gap-2 text-sm"
          >
            <Store className="w-4 h-4 text-amber-600" />
            Vous êtes vendeuse ? Créer une boutique
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          Vous avez déjà une boutique enregistrée ?{' '}
          <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
