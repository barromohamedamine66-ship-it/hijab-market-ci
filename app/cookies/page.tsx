export default function CookiesPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-20 animate-fade-in space-y-8">
      <h1 className="text-3xl font-black font-heading text-gray-900">Gestion des Cookies</h1>
      <div className="prose prose-emerald max-w-none text-sm text-gray-600">
        <p>HIJAB MARKET CI utilise des cookies pour améliorer votre expérience utilisateur.</p>
        <ul className="list-disc pl-5 mt-4 space-y-2">
          <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (session de connexion, panier d'achat).</li>
          <li><strong>Cookies d'analyse :</strong> Nous aident à comprendre comment vous utilisez le site pour l'améliorer.</li>
        </ul>
        <p className="mt-4">Vous pouvez configurer votre navigateur pour bloquer ces cookies, mais certaines fonctionnalités du site pourraient ne plus fonctionner.</p>
      </div>
    </div>
  );
}
