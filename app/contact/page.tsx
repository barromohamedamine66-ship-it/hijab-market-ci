export default function ContactPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-20 animate-fade-in space-y-8">
      <h1 className="text-3xl font-black font-heading text-gray-900">Nous Contacter</h1>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <p className="text-gray-600">
          Une question ? Un problème avec une commande ? Ou vous souhaitez simplement nous faire part de vos suggestions ?
        </p>
        <div className="space-y-4 text-sm font-medium text-gray-800">
          <p className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <strong>WhatsApp / Appel :</strong> +225 07 77 39 38 13
          </p>
          <p className="flex items-center gap-3">
            <span className="text-2xl">✉️</span>
            <strong>Email :</strong> support@hijabmarket.ci
          </p>
          <p className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <strong>Adresse :</strong> Abidjan, Côte d'Ivoire
          </p>
        </div>
        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Notre service client est disponible du Lundi au Samedi, de 08h30 à 18h30.
          </p>
        </div>
      </div>
    </div>
  );
}
