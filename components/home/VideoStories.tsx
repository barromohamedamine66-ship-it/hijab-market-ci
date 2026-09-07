'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Données factices pour les stories
const MOCK_STORIES = [
  {
    id: 'story-1',
    shopName: 'Les Voiles de Babi',
    shopLogo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    videoThumb: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=400&h=800',
    productName: 'Abaya Dubaï Perle Noire',
    price: 35000,
    shopSlug: 'les-voiles-de-babi',
    productSlug: 'abaya-dubai-perle-noire',
    isUnread: true,
  },
  {
    id: 'story-2',
    shopName: 'Modesty Style CI',
    shopLogo: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=100&h=100',
    videoThumb: 'https://images.unsplash.com/photo-1583391733958-d15319a5120b?auto=format&fit=crop&q=80&w=400&h=800',
    productName: 'Kimono Chic',
    price: 25000,
    shopSlug: 'modesty-style-ci',
    productSlug: 'kimono-chic',
    isUnread: true,
  },
  {
    id: 'story-3',
    shopName: 'Maison du Hijab',
    shopLogo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&q=80&w=100&h=100',
    videoThumb: 'https://images.unsplash.com/photo-1596455119429-c5cce611a144?auto=format&fit=crop&q=80&w=400&h=800',
    productName: 'Hijab Soie de Médine',
    price: 5000,
    shopSlug: 'maison-du-hijab',
    productSlug: 'hijab-soie-de-medine',
    isUnread: false,
  },
  {
    id: 'story-4',
    shopName: 'Yass Fashion',
    shopLogo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=100&h=100',
    videoThumb: 'https://images.unsplash.com/photo-1621570168340-e2b8344e1dcb?auto=format&fit=crop&q=80&w=400&h=800',
    productName: 'Ensemble Mastour',
    price: 18000,
    shopSlug: 'yass-fashion',
    productSlug: 'ensemble-mastour',
    isUnread: true,
  },
  {
    id: 'story-5',
    shopName: 'Elegance Abidjan',
    shopLogo: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&q=80&w=100&h=100',
    videoThumb: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&q=80&w=400&h=800',
    productName: 'Robe de Prière',
    price: 12000,
    shopSlug: 'elegance-abidjan',
    productSlug: 'robe-de-priere',
    isUnread: false,
  },
];

export default function VideoStories() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const activeStory = activeStoryIndex !== null ? MOCK_STORIES[activeStoryIndex] : null;

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < MOCK_STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null); // Fermer si c'est la dernière
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  // Progression automatique
  useEffect(() => {
    if (activeStoryIndex !== null) {
      const timer = setTimeout(() => {
        handleNext();
      }, 15000); // Passe à la suivante après 15 secondes
      return () => clearTimeout(timer);
    }
  }, [activeStoryIndex]);

  return (
    <div className="bg-white border-b border-gray-100 py-3 sm:py-4">
      <div className="container overflow-x-auto no-scrollbar">
        <div className="flex gap-4 sm:gap-6 min-w-max px-2">
          {MOCK_STORIES.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 group outline-none"
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 sm:p-1 transition-transform group-hover:scale-105 ${
                  story.isUnread
                    ? 'bg-gradient-to-tr from-amber-400 via-emerald-500 to-emerald-600'
                    : 'bg-gray-200'
                }`}
              >
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 relative">
                  <img
                    src={story.shopLogo}
                    alt={story.shopName}
                    className="w-full h-full object-cover"
                  />
                  {story.isUnread && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-700 w-16 sm:w-20 truncate text-center">
                {story.shopName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL STORY PLEIN ÉCRAN */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          {/* Bouton Fermer */}
          <button
            onClick={() => setActiveStoryIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zones de clic pour naviguer */}
          <div className="absolute inset-0 z-40 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Container du contenu style TikTok (aspect ratio portrait) */}
          <div className="relative w-full h-full sm:w-[400px] sm:h-[80vh] sm:rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
            {/* L'image de fond avec un effet de zoom lent pour simuler une vidéo (Ken Burns) */}
            <div className="absolute inset-0 animate-ken-burns">
              <img
                src={activeStory.videoThumb}
                alt={activeStory.productName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* Barre de progression style Instagram */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
              {MOCK_STORIES.map((s, idx) => (
                <div key={s.id} className="h-0.5 sm:h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < activeStoryIndex! ? 'w-full' : idx === activeStoryIndex ? 'w-full animate-story-progress' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Infos Boutique (Haut) */}
            <div className="absolute top-6 left-4 z-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg">
                <img src={activeStory.shopLogo} alt={activeStory.shopName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold shadow-black drop-shadow-md">
                  {activeStory.shopName}
                </span>
                <span className="text-white/80 text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Nouveauté
                </span>
              </div>
            </div>

            {/* Infos Produit & Call-to-action (Bas) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-50 flex flex-col gap-4">
              <div>
                <h3 className="text-white text-xl sm:text-2xl font-extrabold font-heading drop-shadow-md leading-tight">
                  {activeStory.productName}
                </h3>
                <div className="inline-block mt-2 bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                  {activeStory.price.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <Link
                href={`/products/${activeStory.productSlug}`}
                className="w-full py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors relative z-50 shadow-xl"
                onClick={(e) => e.stopPropagation()} // Évite de passer à la story suivante
              >
                Voir cet article <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Ajout des keyframes pour l'effet vidéo Ken Burns et la progress bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-ken-burns {
          animation: ken-burns 15s ease-out forwards;
        }
        @keyframes story-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-story-progress {
          animation: story-progress 15s linear forwards;
        }
      `}} />
    </div>
  );
}
