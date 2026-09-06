'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
  [key: string]: any;
}

export interface Session {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user: User;
  [key: string]: any;
}
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile, UserRole, Shop } from '@/lib/supabase/types';
import { DBService } from '@/lib/supabase/db-service';

// Liste des comptes administrateurs officiels
export const ADMIN_EMAILS = [
  'barromohamedamine66@gmail.com',
  'admin@hijabmarket.ci',
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes('admin');
};

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  shop: Shop | null;
  role: UserRole;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (data: SignUpData) => Promise<{ error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  updateShop: (updates: Partial<Shop>) => Promise<{ error?: string; data?: Shop }>;
  refreshProfile: () => Promise<void>;
}

export interface SignUpData {
  email?: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  role?: UserRole;
  shop_name?: string;
  shop_description?: string;
  commune?: string;
  whatsapp?: string;
}

const LOCAL_USER_KEY = 'hm_auth_user';
const LOCAL_PROFILE_KEY = 'hm_auth_profile';
const LOCAL_SHOP_KEY = 'hm_auth_shop';

/** Normalisation du numéro de téléphone pour l'authentification sans email (Côte d'Ivoire 10 chiffres) */
export const normalizePhoneDigits = (input: string): string => {
  const digits = (input || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger profil et boutique
  const fetchProfileAndShop = useCallback(async (userId: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profData) {
          const role: UserRole = isAdminEmail(profData.email) ? 'admin' : (profData.role as UserRole);
          const finalProfile = { ...profData, role };
          setProfile(finalProfile as Profile);
          try { localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(finalProfile)); } catch {}

          if (isAdminEmail(profData.email) && profData.role !== 'admin') {
            try { await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId); } catch {}
          }

          if (role === 'seller') {
            const userShop = await DBService.getShopByOwnerId(userId);
            setShop(userShop);
            if (userShop) {
              try { localStorage.setItem(LOCAL_SHOP_KEY, JSON.stringify(userShop)); } catch {}

              // Synchronisation automatique des éventuels articles enregistrés hors-ligne ou localement
              try {
                const localProds = JSON.parse(localStorage.getItem('hm_products') || '[]');
                if (Array.isArray(localProds) && localProds.length > 0) {
                  const unsynced = localProds.filter((p: any) => 
                    p && p.name && (p.id?.startsWith('prod-') || p.store_id !== userShop.id)
                  );
                  for (const p of unsynced) {
                    await DBService.createProduct({
                      store_id: userShop.id,
                      category_id: p.category_id || null,
                      name: p.name,
                      description: p.description || '',
                      price: p.price || 5000,
                      old_price: p.old_price,
                      stock: p.stock || 10,
                      material: p.material,
                      colors: p.colors,
                      sizes: p.sizes,
                      badge: p.badge,
                      imageUrl: p.images?.[0]?.image_url,
                    });
                  }
                }
              } catch (syncErr) {
                console.warn('Auto-sync local products:', syncErr);
              }
            }
          }
          return;
        }
      } catch (err) {
        console.warn('Erreur chargement profil Supabase:', err);
      }
    }

    // Fallback local storage
    try {
      const storedProf = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (storedProf) {
        const parsed = JSON.parse(storedProf);
        setProfile(parsed);
        if (parsed.role === 'seller') {
          const userShop = await DBService.getShopByOwnerId(userId);
          setShop(userShop);
        }
      }
    } catch {}
  }, []);

  // Initialisation session
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfileAndShop(session.user.id);
        } else {
          // Check local mock session
          try {
            const localUser = localStorage.getItem(LOCAL_USER_KEY);
            const localProf = localStorage.getItem(LOCAL_PROFILE_KEY);
            const localShop = localStorage.getItem(LOCAL_SHOP_KEY);
            if (localUser && localProf) {
              setUser(JSON.parse(localUser));
              setProfile(JSON.parse(localProf));
              if (localShop) setShop(JSON.parse(localShop));
            }
          } catch {}
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfileAndShop(session.user.id);
        } else {
          setProfile(null);
          setShop(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Supabase non configuré : charger depuis localStorage
      try {
        const localUser = localStorage.getItem(LOCAL_USER_KEY);
        const localProf = localStorage.getItem(LOCAL_PROFILE_KEY);
        const localShop = localStorage.getItem(LOCAL_SHOP_KEY);
        if (localUser && localProf) {
          setUser(JSON.parse(localUser));
          setProfile(JSON.parse(localProf));
          if (localShop) setShop(JSON.parse(localShop));
        }
      } catch {}
      setLoading(false);
    }
  }, [fetchProfileAndShop]);

  // Connexion (prend en charge le numéro de téléphone ou l'email + compte admin)
  const signIn = async (identifier: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    let email = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhoneDigits(identifier);

    // Support de la connexion directe par Téléphone (sans @)
    if (!email.includes('@')) {
      if (isSupabaseConfigured()) {
        try {
          const { data: matchedProfile } = await supabase
            .from('profiles')
            .select('email, phone')
            .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%,phone.eq.${identifier.trim()}`)
            .maybeSingle();
          if (matchedProfile?.email) {
            email = matchedProfile.email;
          } else {
            email = `${cleanPhone}@client.hijabmarket.ci`;
          }
        } catch {
          email = `${cleanPhone}@client.hijabmarket.ci`;
        }
      } else {
        email = `${cleanPhone}@client.hijabmarket.ci`;
      }
    }

    const targetRole: UserRole = isAdminEmail(email)
      ? 'admin'
      : email.includes('vendeur') || email.includes('seller') || email.includes('boutique')
      ? 'seller'
      : 'customer';

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) return { error: authError.message };

        if (authData.user) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          let role: UserRole = isAdminEmail(email) ? 'admin' : ((profData?.role as UserRole) || targetRole);

          // Si le compte est un compte administrateur, garantir le rôle 'admin' dans Supabase
          if (isAdminEmail(email)) {
            role = 'admin';
            if (profData && profData.role !== 'admin') {
              try {
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
              } catch {}
            }
          }

          if (profData) {
            const updatedProf = { ...profData, role };
            setProfile(updatedProf as Profile);
            try { localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updatedProf)); } catch {}
          }
          if (role === 'seller') {
            const s = await DBService.getShopByOwnerId(authData.user.id);
            setShop(s);
          }
          return { role };
        }
      } catch (err: any) {
        return { error: err?.message || 'Erreur lors de la connexion' };
      }
    }

    // Connexion locale réactive (fallback)
    let localFoundProfile: Profile | null = null;
    try {
      const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Profile;
        const storedCleanPhone = parsed.phone ? normalizePhoneDigits(parsed.phone) : '';
        if (
          (parsed.email && parsed.email.toLowerCase() === email.toLowerCase()) ||
          (cleanPhone && storedCleanPhone === cleanPhone) ||
          (parsed.phone && parsed.phone.includes(identifier.trim()))
        ) {
          localFoundProfile = parsed;
        }
      }
    } catch {}

    const mockId = localFoundProfile?.id || `usr-${Date.now()}`;
    const mockUser: User = {
      id: mockId,
      app_metadata: {},
      user_metadata: { full_name: localFoundProfile?.full_name || email.split('@')[0], role: localFoundProfile?.role || targetRole },
      aud: 'authenticated',
      created_at: localFoundProfile?.created_at || new Date().toISOString(),
      email: email,
    } as unknown as User;

    const mockProfile: Profile = localFoundProfile || {
      id: mockId,
      full_name: email.split('@')[0],
      phone: identifier.includes('@') ? '+225 07 00 00 00 00' : identifier.trim(),
      email: email,
      avatar_url: null,
      city: 'Abidjan',
      commune: 'Cocody',
      address: null,
      role: targetRole,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let userShop: Shop | null = null;
    if (targetRole === 'seller') {
      userShop = await DBService.createShop({
        owner_id: mockId,
        name: `Boutique de ${mockProfile.full_name}`,
        phone: mockProfile.phone || undefined,
        city: 'Abidjan',
        commune: 'Cocody',
      });
      setShop(userShop);
      try { localStorage.setItem(LOCAL_SHOP_KEY, JSON.stringify(userShop)); } catch {}
    }

    setUser(mockUser);
    setProfile(mockProfile);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mockProfile));
    } catch {}

    return { role: targetRole };
  };

  // Inscription (réservée aux vendeuses et boutiques)
  const signUp = async (data: SignUpData): Promise<{ error?: string; role?: UserRole }> => {
    if (data.role && data.role === 'customer') {
      return { error: "L'inscription est réservée aux vendeuses partenaires. Aucun compte n'est requis pour les clientes." };
    }

    const rawEmail = (data.email || '').trim().toLowerCase();
    const cleanPhone = normalizePhoneDigits(data.phone || '');

    let email = rawEmail;
    if (!email) {
      if (cleanPhone) {
        email = `${cleanPhone}@vendeuse.hijabmarket.ci`;
      } else {
        return { error: 'Veuillez renseigner un numéro de téléphone valide ou une adresse email.' };
      }
    }

    const role: UserRole = isAdminEmail(email) ? 'admin' : (data.role || 'seller');

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              phone: data.phone,
              city: data.city || 'Abidjan',
              role: role,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
            return { error: 'Un compte existe déjà avec ce numéro de téléphone ou cette adresse email.' };
          }
          console.warn('Erreur Supabase inscription, bascule vers mode réactif:', error.message);
          throw error;
        }

        if (authData.user) {
          // Créer ou mettre à jour le profil avec le rôle approprié
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: data.full_name,
              email: rawEmail || email,
              phone: data.phone || null,
              city: data.city || 'Abidjan',
              commune: data.commune || null,
              role: role,
              is_active: true,
            });
          } catch (profileErr) {
            console.warn('Erreur mise à jour profil Supabase:', profileErr);
          }

          // Établir la session active immédiate pour authentifier les requêtes suivantes
          if (authData.session) {
            setSession(authData.session);
            setUser(authData.user);
          } else {
            try {
              const { data: signInRes } = await supabase.auth.signInWithPassword({
                email,
                password: data.password,
              });
              if (signInRes?.session) {
                setSession(signInRes.session);
                setUser(signInRes.user);
              } else {
                setUser(authData.user);
              }
            } catch {
              setUser(authData.user);
            }
          }

          // Si vendeuse, créer ou synchroniser la boutique
          if (role === 'seller') {
            const shopName = data.shop_name || `Boutique de ${data.full_name}`;
            const createdShop = await DBService.createShop({
              owner_id: authData.user.id,
              name: shopName,
              description: data.shop_description,
              phone: data.phone,
              whatsapp: data.whatsapp || data.phone,
              city: data.city || 'Abidjan',
              commune: data.commune || 'Cocody',
            });
            setShop(createdShop);
          }

          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authData.user));
          } catch {}

          await fetchProfileAndShop(authData.user.id);
          return { role };
        }
      } catch (err: any) {
        console.warn('Bascule sur inscription locale réactive suite à:', err?.message);
      }
    }

    // Inscription locale réactive
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      id: newId,
      app_metadata: {},
      user_metadata: { full_name: data.full_name, role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: email,
    } as unknown as User;

    const newProfile: Profile = {
      id: newId,
      full_name: data.full_name,
      phone: data.phone || null,
      email: rawEmail || email,
      avatar_url: null,
      city: data.city || 'Abidjan',
      commune: data.commune || null,
      address: null,
      role: role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newShop: Shop | null = null;
    if (role === 'seller' && data.shop_name) {
      newShop = await DBService.createShop({
        owner_id: newId,
        name: data.shop_name,
        description: data.shop_description,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        city: data.city || 'Abidjan',
        commune: data.commune || 'Cocody',
      });
      setShop(newShop);
      try { localStorage.setItem(LOCAL_SHOP_KEY, JSON.stringify(newShop)); } catch {}
    }

    setUser(newUser);
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
    } catch {}

    return { role };
  };

  // Déconnexion
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setShop(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_PROFILE_KEY);
      localStorage.removeItem(LOCAL_SHOP_KEY);
    } catch {}
  };

  // Mise à jour de profil
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'Non authentifié' };
    
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) return { error: error.message };
    }

    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      try { localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });

    return {};
  };

  // Mise à jour de la boutique (logo, nom, bio, contacts...) — 100% autonome
  const updateShop = async (updates: Partial<Shop>): Promise<{ error?: string; data?: Shop }> => {
    const currentShopId = shop?.id || (user ? `shop-${user.id}` : 's1000000-0000-0000-0000-000000000001');
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('shops').update(updatedData).eq('id', currentShopId);
      } catch {}
      try {
        await supabase.from('stores').update(updatedData).eq('id', currentShopId);
      } catch {}
    }

    const mergedShop: Shop = {
      id: currentShopId,
      owner_id: user?.id || '',
      name: updates.name || shop?.name || 'Ma Boutique',
      slug: shop?.slug || `boutique-${Date.now()}`,
      description: updates.description !== undefined ? updates.description : (shop?.description || null),
      city: updates.city || shop?.city || 'Abidjan',
      commune: updates.commune !== undefined ? updates.commune : (shop?.commune || 'Cocody'),
      address: shop?.address || null,
      phone: updates.phone !== undefined ? updates.phone : (shop?.phone || null),
      whatsapp: updates.whatsapp !== undefined ? updates.whatsapp : (shop?.whatsapp || null),
      logo_url: updates.logo_url !== undefined ? updates.logo_url : (shop?.logo_url || '/logo.png'),
      banner_url: shop?.banner_url || null,
      status: shop?.status || 'active',
      verified: shop?.verified ?? true,
      commission_rate: shop?.commission_rate ?? 7,
      rating: shop?.rating ?? 5.0,
      total_reviews: shop?.total_reviews ?? 0,
      total_sales: shop?.total_sales ?? 0,
      created_at: shop?.created_at || new Date().toISOString(),
      ...(shop || {}),
      ...updatedData,
    };

    setShop(mergedShop);

    try { localStorage.setItem(LOCAL_SHOP_KEY, JSON.stringify(mergedShop)); } catch {}

    try {
      const stored = localStorage.getItem('hm_shops');
      if (stored) {
        const list = JSON.parse(stored);
        const idx = list.findIndex((s: any) => s.id === currentShopId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...mergedShop };
        } else {
          list.unshift(mergedShop);
        }
        localStorage.setItem('hm_shops', JSON.stringify(list));
      }
    } catch {}

    return { data: mergedShop };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfileAndShop(user.id);
  };

  // Le rôle est 'admin' si l'utilisateur a cet email officiel
  const role: UserRole = (user && isAdminEmail(user.email)) ? 'admin' : (profile?.role ?? 'customer');

  return (
    <AuthContext.Provider value={{ user, session, profile, shop, role, loading, signIn, signUp, signOut, updateProfile, updateShop, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return ctx;
}
