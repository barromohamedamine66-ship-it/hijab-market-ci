'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2250152182840?text=Bonjour%20Service%20Client%20HIJAB%20MARKET%20CI%2C%20j%27ai%20besoin%20d%27assistance"
      target="_blank"
      rel="noopener noreferrer"
      id="floating-whatsapp-btn"
      title="Service Client WhatsApp : 01 52 18 28 40"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/20 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white group"
      aria-label="Contacter le service client sur WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
      <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
        CI
      </span>
      <span className="absolute right-16 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
        Besoin d'aide ? Écrivez-nous 💬
      </span>
    </a>
  );
}
