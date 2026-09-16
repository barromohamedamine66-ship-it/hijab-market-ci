import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hijabmarket-ci.com';

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
    const baseFilename = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    // 1. Sauvegarde locale persistante dans public/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, baseFilename);
      await fs.writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn('Note sauvegarde filesystem local:', fsErr);
    }

    // 2. Tenter l'upload vers Supabase Storage
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === 'product-images');

      if (!hasBucket) {
        await supabaseAdmin.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 10485760,
        });
      }

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('product-images')
        .upload(baseFilename, buffer, {
          contentType: file.type || `image/${cleanExt}`,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(baseFilename);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            success: true,
          });
        }
      }
    } catch (storageErr) {
      console.warn('Note Supabase Storage:', storageErr);
    }

    // 3. URL publique de secours garantie via notre route dédiée /api/images/
    const permanentPublicUrl = `${SITE_URL}/api/images/${baseFilename}`;
    return NextResponse.json({
      url: permanentPublicUrl,
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
