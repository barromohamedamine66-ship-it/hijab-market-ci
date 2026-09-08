'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Play, Pause, Volume2, VolumeX, Sparkles, Store, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { DBService } from '@/lib/supabase/db-service';
import type { Story } from '@/lib/supabase/types';

// Helper pour déterminer avec certitude si l'URL est une vidéo
function isVideoMedia(url: string, explicitType?: string): boolean {
  if (explicitType === 'video') return true;
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg')
  );
}

// Helper pour YouTube
function getYouTubeEmbedId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Contrôles média
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    DBService.getStories().then((data) => {
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

  // Progression automatique avec gestion pause
  useEffect(() => {
    if (activeStoryIndex !== null && !isPaused) {
      const timer = setTimeout(() => {
        handleNext();
      }, 15000); // 15 secondes par story
      return () => clearTimeout(timer);
    }
  }, [activeStoryIndex, isPaused]);

  // Synchronisation lecture vidéo
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Autoplay fallback
        });
      }
    }
  }, [isPaused, activeStoryIndex]);

  if (loading || stories.length === 0) {
    return null;
  }

  const shopName = activeStory?.store?.name || 'Boutique Partenaire';
  const shopLogo = activeStory?.store?.logo_url || '/logo.png';
  const mediaUrl = activeStory?.media_url || '';
  const isVideo = isVideoMedia(mediaUrl, activeStory?.media_type);
  const youtubeId = getYouTubeEmbedId(mediaUrl);

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
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
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

      {/* MODAL STORY PLEIN ÉCRAN */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center">
          {/* Container du contenu style TikTok / Instagram */}
          <div className="relative w-full h-full sm:w-[420px] sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-gray-950 shadow-2xl flex flex-col justify-between">
            {/* Zones tactiles latérales pour naviguer (gauche = précédent, droite = suivant) */}
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

            {/* Arrière-plan Média (Vidéo, Image, YouTube ou Fallback) */}
            <div className="absolute inset-0 z-0">
              {mediaError || !mediaUrl ? (
                /* Fallback élégant si le média est indisponible */
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
              ) : youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=0&loop=1&playlist=${youtubeId}`}
                  className="w-full h-full object-cover pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : isVideo ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  webkit-playsinline="true"
                  className="w-full h-full object-cover"
                  onError={() => setMediaError(true)}
                />
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

            {/* En-tête : Barre de progression & Boutons de contrôle */}
            <div className="relative z-30 p-4 sm:p-5 flex flex-col gap-3">
              {/* Barres de progression segments style Instagram */}
              <div className="flex gap-1.5 w-full">
                {stories.map((s, idx) => (
                  <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
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

              {/* Barre supérieure : Boutique & Boutons (Fermer, Son, Pause) */}
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
                  {/* Bouton Son pour les vidéos */}
                  {isVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition shadow-md"
                      title={isMuted ? 'Activer le son' : 'Couper le son'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  )}

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

      {/* Keyframes pour zoom doux (Ken Burns) & barre de progression */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
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
      `,
        }}
      />
    </div>
  );
}
