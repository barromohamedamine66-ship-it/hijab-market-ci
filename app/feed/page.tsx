'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingBag,
  Sparkles,
  Store,
  ChevronUp,
  ChevronDown,
  Check,
  Plus,
  Send,
  ExternalLink,
  Info,
  X,
  Video as VideoIcon
} from 'lucide-react';

interface ReelItem {
  id: string;
  media_url: string;
  poster_url: string;
  media_type: 'video' | 'image';
  caption: string;
  sound_title: string;
  category: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  store: {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    city: string;
    commune?: string;
    is_verified?: boolean;
    followers_count?: number;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    old_price?: number;
    cover_image: string;
    stock: number;
    rating: number;
    colors?: string[];
    sizes?: string[];
  } | null;
}

const CATEGORIES = [
  { id: 'all', label: '✨ Tout' },
  { id: 'hijabs', label: '🧕 Hijabs & Voiles' },
  { id: 'abayas', label: '✨ Abayas Dubaï' },
  { id: 'tutos', label: '🎬 Tutos & Looks' },
  { id: 'bazins', label: '👗 Bazins & Fêtes' },
  { id: 'muscs', label: '🌸 Muscs & Parfums' },
];

export default function FeedPage() {
  const router = useRouter();
  const { user, role, shop } = useAuth();
  const { addItem, count: cartCount } = useCart();

  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');

  // Lecteur & Contrôles
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [followedShops, setFollowedShops] = useState<Record<string, boolean>>({});
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  // Tiroirs / Modales
  const [activeDrawer, setActiveDrawer] = useState<'comments' | 'share' | 'product' | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: 'c1', user: 'Aminata K.', text: 'Magnifique le drapé ! Est-ce que le tissu est transparent au soleil ?', time: 'Il y a 10 min' },
    { id: 'c2', user: 'Fatoumata D.', text: 'Je viens de commander en Vert Sauge pour la Tabaski, trop hâte !!', time: 'Il y a 45 min' },
    { id: 'c3', user: 'Boutique (Vendeuse)', text: 'Bonjour Aminata, non 100% opaque et ultra doux en soie de Médine 🥰', time: 'Il y a 5 min' },
  ]);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  // Charger les Reels depuis l'API
  useEffect(() => {
    setLoading(true);
    const catQuery = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
    fetch(`/api/reels${catQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reels && Array.isArray(data.reels)) {
          setReels(data.reels);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement reels:', err);
        setLoading(false);
      });
  }, [selectedCategory]);

  // Synchroniser la lecture vidéo de l'index actif
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.muted = isMuted;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Autoplay bloqué sans interaction utilisateur
              setIsPlaying(false);
            });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Mettre à jour les variantes par défaut pour le produit courant
    const currentReel = reels[currentIndex];
    if (currentReel?.product) {
      if (currentReel.product.colors?.[0]) setSelectedColor(currentReel.product.colors[0]);
      if (currentReel.product.sizes?.[0]) setSelectedSize(currentReel.product.sizes[0]);
    }
  }, [currentIndex, reels, isMuted]);

  // Navigation vers reel précédent / suivant
  const goToReel = useCallback((index: number) => {
    if (index < 0 || index >= reels.length) return;
    setCurrentIndex(index);
    setIsPlaying(true);
  }, [reels.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      goToReel(currentIndex + 1);
    }
  }, [currentIndex, reels.length, goToReel]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      goToReel(currentIndex - 1);
    }
  }, [currentIndex, goToReel]);

  // Gestion des touches clavier (Flèches, Espace, Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDrawer) return; // Ne pas intercepter si un tiroir/champ texte est ouvert
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, activeDrawer]);

  // Gestes tactiles (Swipe Vertical)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 45; // Seuil minimum de swipe
    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    const activeVideo = videoRefs.current[currentIndex];
    if (!activeVideo) return;

    if (activeVideo.paused) {
      activeVideo.play();
      setIsPlaying(true);
    } else {
      activeVideo.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach((v) => {
      if (v) v.muted = !isMuted;
    });
  };

  // Like avec explosion de cœur
  const handleToggleLike = (reelId: string) => {
    setLikedReels((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  // Double tap sur la vidéo
  const handleDoubleTap = (reelId: string) => {
    if (!likedReels[reelId]) {
      handleToggleLike(reelId);
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 800);
  };

  // Suivre boutique
  const handleToggleFollow = (shopId: string) => {
    setFollowedShops((prev) => ({
      ...prev,
      [shopId]: !prev[shopId],
    }));
  };

  // Ajouter au panier directement depuis la vidéo
  const handleAddToCart = (e: React.MouseEvent, reel: ReelItem) => {
    e.stopPropagation();
    if (!reel.product) return;

    addItem({
      product_id: reel.product.id,
      product_name: reel.product.name,
      product_image: reel.product.cover_image,
      price: reel.product.price,
      quantity: 1,
      selected_color: selectedColor || reel.product.colors?.[0] || undefined,
      selected_size: selectedSize || reel.product.sizes?.[0] || undefined,
      store_id: reel.store.id,
      store_name: reel.store.name,
    });

    setAddedProductIds((prev) => ({ ...prev, [reel.product!.id]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [reel.product!.id]: false }));
    }, 2000);
  };

  // Envoyer un commentaire
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      user: user?.email ? user.email.split('@')[0] : 'Cliente Hijab Market',
      text: commentText.trim(),
      time: 'À l’instant',
    };
    setCommentsList([newComment, ...commentsList]);
    setCommentText('');
  };

  const currentReel = reels[currentIndex];
  const isCurrentLiked = currentReel ? !!likedReels[currentReel.id] : false;
  const isCurrentFollowed = currentReel ? !!followedShops[currentReel.store.id] : false;
  const isCurrentAdded = currentReel?.product ? !!addedProductIds[currentReel.product.id] : false;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col select-none overflow-hidden relative">
      {/* Barre supérieure compacte translucide */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/85 via-black/40 to-transparent pt-3 pb-4 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo & Titre */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gray-950 overflow-hidden border border-emerald-500/60 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-extrabold font-heading text-white tracking-wide hidden xs:inline">
            HIJAB MARKET <span className="text-emerald-400">CI</span>
          </span>
        </Link>

        {/* Onglets Découverte / Abonnements */}
        <div className="flex items-center gap-6 text-sm font-black tracking-wide drop-shadow-md">
          <button
            onClick={() => setFeedType('following')}
            className={`transition pb-0.5 border-b-2 ${
              feedType === 'following'
                ? 'text-white border-white scale-105'
                : 'text-white/60 border-transparent hover:text-white/90'
            }`}
          >
            Abonnements
          </button>
          <span className="text-white/30 text-xs">•</span>
          <button
            onClick={() => setFeedType('foryou')}
            className={`transition pb-0.5 border-b-2 flex items-center gap-1.5 ${
              feedType === 'foryou'
                ? 'text-white border-emerald-400 scale-105'
                : 'text-white/60 border-transparent hover:text-white/90'
            }`}
          >
            <span>Pour Vous</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          </button>
        </div>

        {/* Droite : Raccourcis Panier & Son */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition cursor-pointer text-white shadow-md"
            title={isMuted ? 'Activer le son (M)' : 'Couper le son (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <Link
            href="/cart"
            className="relative w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition text-white shadow-md"
            title="Mon Panier"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {role === 'seller' && (
            <Link
              href="/seller/stories"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-xs font-bold text-white shadow-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publier</span>
            </Link>
          )}
        </div>
      </header>

      {/* Barre de Filtres Catégories Horizontale */}
      <div className="fixed top-14 left-0 right-0 z-40 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar mask-fade-edges pointer-events-auto">
        <div className="flex items-center gap-2 mx-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap backdrop-blur-md border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-md scale-105'
                  : 'bg-black/40 text-white/80 border-white/10 hover:bg-black/60 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Principale : Conteneur Plein Écran */}
      <main
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full h-screen flex items-center justify-center relative overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-white/70 animate-pulse">Chargement des vidéos tendance...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="max-w-sm text-center p-6 bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/10 space-y-4">
            <VideoIcon className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold">Aucune vidéo dans cette catégorie</h3>
            <p className="text-xs text-white/60">Soyez la première boutique à publier un tutoriel ou une présentation !</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="btn btn-primary btn-sm px-6 py-2 rounded-xl text-xs font-bold"
            >
              Voir toutes les vidéos
            </button>
          </div>
        ) : (
          <div className="w-full h-full max-w-[480px] mx-auto relative flex items-center justify-center bg-black shadow-2xl">
            {/* L'Écran Vidéo Actuel */}
            {reels.map((reel, idx) => {
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={reel.id}
                  className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  onClick={togglePlayPause}
                  onDoubleClick={() => handleDoubleTap(reel.id)}
                >
                  {/* Fond flouté pour un look ultra-immersif */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-125"
                    style={{ backgroundImage: `url(${reel.poster_url})` }}
                  />

                  {/* Vidéo HTML5 principale */}
                  {reel.media_type === 'video' ? (
                    <video
                      ref={(el) => (videoRefs.current[idx] = el)}
                      src={reel.media_url}
                      poster={reel.poster_url}
                      playsInline
                      loop
                      muted={isMuted}
                      className="w-full h-full object-cover object-center relative z-0 cursor-pointer"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center relative z-0 animate-ken-burns"
                      style={{ backgroundImage: `url(${reel.media_url || reel.poster_url})` }}
                    />
                  )}

                  {/* Dégradés d'ombrage pour lisibilité parfaite des textes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none z-10" />

                  {/* Animation Play/Pause centrale */}
                  {showPlayIcon && isCurrent && (
                    <div className="absolute z-30 pointer-events-none flex items-center justify-center animate-ping duration-300">
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                        {isPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
                      </div>
                    </div>
                  )}

                  {/* Animation Explosion Cœur lors du double tap */}
                  {showDoubleTapHeart && isCurrent && (
                    <div className="absolute z-30 pointer-events-none flex items-center justify-center animate-bounce duration-500">
                      <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* CONTENU SUPERPOSÉ : BAS GAUCHE (Infos Boutique, Titre & Produit Shoppable) */}
            {currentReel && (
              <div className="absolute bottom-6 left-4 right-18 z-30 flex flex-col gap-3 pointer-events-auto">
                {/* Info Boutique */}
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/boutique/${currentReel.store.slug}`}
                    className="w-10 h-10 rounded-full border-2 border-emerald-400 overflow-hidden bg-gray-900 flex-shrink-0 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={currentReel.store.logo_url}
                      alt={currentReel.store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </Link>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/boutique/${currentReel.store.slug}`}
                        className="font-extrabold text-sm text-white hover:text-emerald-300 drop-shadow-md transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currentReel.store.name}
                      </Link>
                      {currentReel.store.is_verified && (
                        <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/70 font-medium">
                      📍 {currentReel.store.commune || currentReel.store.city}
                    </span>
                  </div>

                  {/* Bouton Suivre Boutique */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(currentReel.store.id);
                    }}
                    className={`ml-2 px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1 shadow-md ${
                      isCurrentFollowed
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isCurrentFollowed ? (
                      <>
                        <Check className="w-3 h-3" /> Abonné(e)
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Suivre
                      </>
                    )}
                  </button>
                </div>

                {/* Légende / Description de la vidéo */}
                <p className="text-xs sm:text-sm text-white font-medium drop-shadow-md line-clamp-2 leading-relaxed">
                  {currentReel.caption}
                </p>

                {/* Titre audio défilant */}
                <div className="flex items-center gap-2 text-white/80 text-[11px] font-semibold">
                  <span className="animate-spin duration-3000">🎵</span>
                  <span className="truncate max-w-[220px]">{currentReel.sound_title}</span>
                </div>

                {/* CARTE PRODUIT SHOPPABLE (LE CŒUR DE TIKTOK SHOP CI) */}
                {currentReel.product && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-3 transition"
                  >
                    <Link
                      href={`/products/${currentReel.product.slug}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0 group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 border border-white/30 flex-shrink-0 relative">
                        <img
                          src={currentReel.product.cover_image}
                          alt={currentReel.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <span className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-tl">
                          TOP
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                          {currentReel.product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-emerald-400">
                            {currentReel.product.price.toLocaleString('fr-FR')} FCFA
                          </span>
                          {currentReel.product.old_price && (
                            <span className="text-[10px] text-white/50 line-through">
                              {currentReel.product.old_price.toLocaleString('fr-FR')} FCFA
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Bouton Ajouter au Panier 1-Clic */}
                    <button
                      onClick={(e) => handleAddToCart(e, currentReel)}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg flex-shrink-0 ${
                        isCurrentAdded
                          ? 'bg-emerald-500 text-white scale-105'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold hover:scale-105 active:scale-95'
                      }`}
                      title="Ajouter au panier instantanément"
                    >
                      {isCurrentAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Ajouté !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Acheter</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* COLONNE D'ACTIONS LATÉRALE DROITE (Style TikTok) */}
            {currentReel && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 bottom-8 z-30 flex flex-col items-center gap-4 pointer-events-auto"
              >
                {/* Avatar Boutique avec bouton (+) */}
                <div className="relative mb-2">
                  <Link
                    href={`/boutique/${currentReel.store.slug}`}
                    className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-900 block shadow-xl"
                  >
                    <img
                      src={currentReel.store.logo_url}
                      alt={currentReel.store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </Link>
                  {!isCurrentFollowed && (
                    <button
                      onClick={() => handleToggleFollow(currentReel.store.id)}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Bouton Like / Cœur */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleToggleLike(currentReel.id)}
                    className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-75 shadow-lg cursor-pointer"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        isCurrentLiked
                          ? 'fill-rose-500 text-rose-500 scale-110'
                          : 'text-white hover:text-rose-400'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-white drop-shadow-md mt-1">
                    {((currentReel.likes_count || 1200) + (isCurrentLiked ? 1 : 0)).toLocaleString('fr-FR')}
                  </span>
                </div>

                {/* Bouton Commentaires / Questions */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveDrawer('comments')}
                    className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-75 shadow-lg text-white cursor-pointer"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <span className="text-[11px] font-bold text-white drop-shadow-md mt-1">
                    {commentsList.length}
                  </span>
                </div>

                {/* Bouton Partager (WhatsApp & Lien) */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveDrawer('share')}
                    className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-75 shadow-lg text-white cursor-pointer"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-[11px] font-bold text-white drop-shadow-md mt-1">
                    Partager
                  </span>
                </div>

                {/* Bouton Détails Produit */}
                {currentReel.product && (
                  <div className="flex flex-col items-center">
                    <Link
                      href={`/products/${currentReel.product.slug}`}
                      className="w-11 h-11 rounded-full bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-md border border-white/20 flex items-center justify-center transition active:scale-75 shadow-lg text-white cursor-pointer"
                      title="Voir la fiche article détaillée"
                    >
                      <Info className="w-5 h-5" />
                    </Link>
                    <span className="text-[10px] font-bold text-white drop-shadow-md mt-1">
                      Détails
                    </span>
                  </div>
                )}

                {/* Disque Vinyle Rotatif (Audio) */}
                <div className="mt-2 relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gray-950 via-gray-800 to-gray-900 border-2 border-white/40 flex items-center justify-center shadow-xl animate-spin duration-4000">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FLÈCHES DE NAVIGATION DESKTOP */}
            <div className="hidden lg:flex flex-col gap-3 absolute -right-16 top-1/2 -translate-y-1/2 z-30">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                title="Vidéo précédente (Haut / K)"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === reels.length - 1}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                title="Vidéo suivante (Bas / J)"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* TIROIR MODAL : COMMENTAIRES & QUESTIONS À LA VENDEUSE */}
      {/* ======================================================== */}
      {activeDrawer === 'comments' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-gray-950 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[600px] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">Questions & Avis ({commentsList.length})</h3>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste des commentaires */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {commentsList.map((c) => (
                <div key={c.id} className="flex gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    {c.user[0]}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl p-2.5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/90">{c.user}</span>
                      <span className="text-[10px] text-white/40">{c.time}</span>
                    </div>
                    <p className="text-white/80 mt-1 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Champ de saisie question */}
            <form onSubmit={handleSendComment} className="pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Poser une question à la vendeuse..."
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-emerald-400 transition"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TIROIR MODAL : PARTAGE VIRAL WHATSAPP & LIEN */}
      {/* ======================================================== */}
      {activeDrawer === 'share' && currentReel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-gray-950 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Partager ce Reel</h3>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/70">
              Partagez cette découverte avec vos amies, sur vos groupes de prière ou vos statuts !
            </p>

            {/* Bouton WhatsApp direct */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Regarde ce superbe article en vidéo sur HIJAB MARKET CI : ${currentReel.caption}\n\n🔗 Découvre et commande ici : https://hijabmarket-ci.com/feed`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl transition"
            >
              <span className="text-lg">💬</span>
              <span>Partager sur WhatsApp (Statut ou Message)</span>
            </a>

            {/* Copier le lien */}
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié dans le presse-papier !');
                  setActiveDrawer(null);
                }
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <span>📋 Copier le lien du Reel</span>
            </button>
          </div>
        </div>
      )}

      {/* Style Animations personnalisées */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-ken-burns {
          animation: ken-burns 12s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
}
