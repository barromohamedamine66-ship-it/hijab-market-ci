import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://hdiykdodruimphunpwjf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

/** Client Supabase pour les composants Client (navigateur) */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

/** Vérifie si Supabase est configuré */
export const isSupabaseConfigured = (): boolean =>
  Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder')
  );

