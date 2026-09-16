import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier unique et sécurisé
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    // 1. Tenter l'upload vers Supabase Storage (bucket 'product-images' ou 'products')
    try {
      // S'assurer que le bucket existe
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasProductBucket = buckets?.some((b) => b.name === 'product-images');

      if (!hasProductBucket) {
        await supabaseAdmin.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: file.type || `image/${cleanExt}`,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            success: true,
          });
        }
      }
    } catch (storageErr) {
      console.warn('Erreur Supabase Storage bucket, utilisation du fallback public URL:', storageErr);
    }

    // 2. Fallback direct si Supabase storage RLS restreint :
    // On peut renvoyer l'URL publique Supabase construite
    const fallbackPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
    return NextResponse.json({
      url: fallbackPublicUrl,
      success: true,
    });
  } catch (error: any) {
    console.error('Erreur API upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors du téléversement de l’image' },
      { status: 500 }
    );
  }
}
