export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-20 animate-fade-in space-y-8">
      <h1 className="text-3xl font-black font-heading text-gray-900">Politique de Confidentialité</h1>
      <div className="prose prose-emerald max-w-none text-sm text-gray-600">
        <p>La protection de vos données personnelles est une priorité pour HIJAB MARKET CI.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Collecte des données</h2>
        <p>Nous collectons uniquement les informations nécessaires au traitement de vos commandes (Nom, Téléphone, Adresse de livraison).</p>
        <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Partage des informations</h2>
        <p>Vos coordonnées de livraison sont transmises exclusivement à la boutique auprès de laquelle vous avez commandé, ainsi qu'au livreur mandaté.</p>
      </div>
    </div>
  );
}
