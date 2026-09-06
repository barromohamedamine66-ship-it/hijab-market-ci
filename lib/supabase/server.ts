import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://hdiykdodruimphunpwjf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

/** Client Supabase pour les composants Server (App Router) */
export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value, ...options }); } catch (_) {}
        },
        remove(name: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (_) {}
        },
      },
    }
  );
};

/** Client Admin Supabase (service role) — UNIQUEMENT côté serveur */
export const createSupabaseAdminClient = () => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};
