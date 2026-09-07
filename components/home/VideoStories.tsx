'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { DBService } from '@/lib/supabase/db-service';
import type { Story } from '@/lib/supabase/types';

export default function VideoStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    DBService.getStories().then((data) => {
      setStories(data);
      setLoading(false);
    });
  }, []);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
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

  if (loading || stories.length === 0) {
    return null; // On cache la section si aucune story réelle
  }

  return (
    <div className="bg-white border-b border-gray-100 py-3 sm:py-4">
      <div className="container overflow-x-auto no-scrollbar">
        <div className="flex gap-4 sm:gap-6 min-w-max px-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 group outline-none"
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 sm:p-1 transition-transform group-hover:scale-105 bg-gradient-to-tr from-amber-400 via-emerald-500 to-emerald-600"
              >
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 relative">
                  <img
                    src={story.store?.logo_url || '/logo.png'}
                    alt={story.store?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-700 w-16 sm:w-20 truncate text-center">
                {story.store?.name}
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
              {activeStory.media_type === 'video' ? (
                <video 
                  src={activeStory.media_url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.media_url}
                  alt={activeStory.product?.name || activeStory.store?.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* Barre de progression style Instagram */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
              {stories.map((s, idx) => (
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
                <img src={activeStory.store?.logo_url || '/logo.png'} alt={activeStory.store?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold shadow-black drop-shadow-md">
                  {activeStory.store?.name}
                </span>
                <span className="text-white/80 text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Vendeuse Partenaire
                </span>
              </div>
            </div>

            {/* Infos Produit & Call-to-action (Bas) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-50 flex flex-col gap-4">
              {activeStory.product && (
                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-extrabold font-heading drop-shadow-md leading-tight">
                    {activeStory.product.name}
                  </h3>
                  <div className="inline-block mt-2 bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                    {activeStory.product.price.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              )}

              {activeStory.product && (
                <Link
                  href={`/products/${activeStory.product.slug}`}
                  className="w-full py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors relative z-50 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir cet article <ExternalLink className="w-4 h-4" />
                </Link>
              )}
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
