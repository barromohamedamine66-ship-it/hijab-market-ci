'use client';

import { useState, useEffect } from 'react';
import { X, Play, Pause, Sparkles, Store, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';

export default function VideoStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    DBService.getStories().then((data) => {
      // Filtrer les stories valides
      setStories(data || []);
      setLoading(false);
    });
  }, []);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Réinitialiser les états lors du changement de story
  useEffect(() => {
    setMediaError(false);
    setIsPaused(false);
  }, [activeStoryIndex]);

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  // Progression automatique : 7 secondes par photo story
  useEffect(() => {
    if (activeStoryIndex !== null && !isPaused) {
      const timer = setTimeout(() => {
        handleNext();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeStoryIndex, isPaused]);

  if (loading || stories.length === 0) {
    return null;
  }

  const shopName = activeStory?.store?.name || 'Boutique Partenaire';
  const shopLogo = activeStory?.store?.logo_url || '/logo.png';
  const mediaUrl = activeStory?.media_url || '';

  return (
    <div className="bg-white border-b border-gray-100 py-3 sm:py-4">
      <div className="container overflow-x-auto no-scrollbar">
        <div className="flex gap-4 sm:gap-6 min-w-max px-2">
          {stories.map((story, index) => {
            const sName = story.store?.name || 'Boutique';
            const sLogo = story.store?.logo_url || '/logo.png';

            return (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(index)}
                className="flex flex-col items-center gap-1.5 sm:gap-2 group outline-none"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 sm:p-1 transition-transform group-hover:scale-105 bg-gradient-to-tr from-amber-400 via-emerald-500 to-emerald-600 shadow-sm">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 relative flex items-center justify-center">
                    <img
                      src={sLogo}
                      alt={sName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-800 w-16 sm:w-20 truncate text-center">
                  {sName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL STORY PHOTO PLEIN ÉCRAN */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center">
          {/* Boutons de navigation bureau */}
          {activeStoryIndex! > 0 && (
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition"
              title="Story précédente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activeStoryIndex! < stories.length - 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition"
              title="Story suivante"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Container du contenu style Instagram Stories */}
          <div className="relative w-full h-full sm:w-[420px] sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-gray-950 shadow-2xl flex flex-col justify-between">
            {/* Zones tactiles latérales pour naviguer */}
            <div className="absolute inset-0 z-20 flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={handlePrev}
                title="Story précédente"
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={handleNext}
                title="Story suivante"
              />
            </div>

            {/* Photo / Média */}
            <div className="absolute inset-0 z-0 bg-gray-900">
              {mediaError || !mediaUrl ? (
                <div className="w-full h-full bg-gradient-to-b from-gray-900 via-emerald-950 to-black flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center mb-4 shadow-xl">
                    <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-extrabold">{shopName}</h3>
                  <p className="text-xs text-emerald-300 font-semibold mt-1">Story officielle en boutique</p>
                  {activeStory.product && (
                    <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs">
                      <p className="text-sm font-bold text-white">{activeStory.product.name}</p>
                      <p className="text-emerald-400 font-extrabold text-sm mt-0.5">
                        {activeStory.product.price?.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full animate-ken-burns">
                  <img
                    src={mediaUrl}
                    alt={activeStory.product?.name || shopName}
                    className="w-full h-full object-cover"
                    onError={() => setMediaError(true)}
                  />
                </div>
              )}

              {/* Voile sombre pour lisibilité des textes */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
            </div>

            {/* En-tête : Barre de progression & Boutique */}
            <div className="relative z-30 p-4 sm:p-5 flex flex-col gap-3">
              {/* Barres de progression */}
              <div className="flex gap-1.5 w-full">
                {stories.map((s, idx) => (
                  <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all ${
                        idx < activeStoryIndex!
                          ? 'w-full'
                          : idx === activeStoryIndex && !isPaused
                          ? 'w-full animate-story-progress'
                          : idx === activeStoryIndex && isPaused
                          ? 'w-1/2'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Barre supérieure : Boutique & Boutons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/80 overflow-hidden shadow-lg bg-gray-800">
                    <img
                      src={shopLogo}
                      alt={shopName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-white text-sm font-extrabold drop-shadow-md block">
                      {shopName}
                    </span>
                    <span className="text-white/80 text-[10px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Vendeuse Partenaire
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton Pause / Lecture */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPaused(!isPaused);
                    }}
                    className="w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition shadow-md"
                    title={isPaused ? 'Reprendre' : 'Mettre en pause'}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
                  </button>

                  {/* Bouton Fermer */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStoryIndex(null);
                    }}
                    className="w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition shadow-md"
                    title="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bas : Infos Produit & Call-to-action */}
            <div className="relative z-30 p-5 sm:p-6 flex flex-col gap-3.5">
              {activeStory.product ? (
                <div>
                  <h3 className="text-white text-lg sm:text-xl font-extrabold font-heading drop-shadow-md leading-snug">
                    {activeStory.product.name}
                  </h3>
                  <div className="inline-block mt-1.5 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                    {activeStory.product.price?.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-white/70 text-xs font-medium">Boutique</span>
                  <h3 className="text-white text-lg font-bold drop-shadow-md">
                    Découvrez la collection de {shopName}
                  </h3>
                </div>
              )}

              {/* Bouton d'action */}
              {activeStory.product ? (
                <Link
                  href={`/products/${activeStory.product.slug}`}
                  className="w-full py-3.5 bg-white text-gray-950 hover:bg-emerald-50 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  Commander cet article →
                </Link>
              ) : activeStory.store?.slug ? (
                <Link
                  href={`/boutique/${activeStory.store.slug}`}
                  className="w-full py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Store className="w-4 h-4" />
                  Visiter la boutique
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Keyframes pour effet Ken Burns doux et progression */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        .animate-ken-burns {
          animation: ken-burns 7s ease-out forwards;
        }
        @keyframes story-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-story-progress {
          animation: story-progress 7s linear forwards;
        }
      `,
        }}
      />
    </div>
  );
}
