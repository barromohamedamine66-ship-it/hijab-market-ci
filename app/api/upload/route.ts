import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

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

    // Déterminer s'il s'agit d'une vidéo ou d'une image
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'ogg', 'm4v'].includes(rawExt);
    
    let cleanExt = 'jpg';
    let mediaType: 'image' | 'video' = 'image';

    if (isVideo) {
      mediaType = 'video';
      cleanExt = ['mp4', 'webm', 'mov', 'ogg', 'm4v'].includes(rawExt) ? rawExt : 'mp4';
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'La vidéo ne doit pas dépasser 50 Mo' }, { status: 400 });
      }
    } else {
      mediaType = 'image';
      cleanExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'L\'image ne doit pas dépasser 20 Mo' }, { status: 400 });
      }
    }

    const prefix = isVideo ? 'video' : 'prod';
    const baseFilename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const mimeType = file.type || (isVideo ? `video/${cleanExt === 'mov' ? 'quicktime' : cleanExt}` : `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`);
    const localPublicUrl = `/uploads/${baseFilename}`;

    // 1. Sauvegarde locale (garantit l'accès direct et immédiat dans /uploads/...)
    let savedLocally = false;
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, baseFilename);
      await fs.writeFile(filePath, buffer);
      savedLocally = true;
    } catch (fsErr) {
      console.warn('Note sauvegarde locale uploads:', fsErr);
    }

    // 2. Tenter l'upload vers Supabase Storage
    try {
      const bucketName = isVideo ? 'product-videos' : 'product-images';
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === bucketName);

      if (!hasBucket) {
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: isVideo ? 52428800 : 20971520,
        });
      }

      const { error: uploadErr } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(baseFilename, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(baseFilename);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            mediaType,
            success: true,
          });
        }
      }
    } catch (storageErr) {
      console.warn('Note Supabase Storage:', storageErr);
    }

    // 3. Si sauvegarde locale réussie, renvoyer l'URL relative /uploads/...
    if (savedLocally) {
      return NextResponse.json({
        url: localPublicUrl,
        mediaType,
        success: true,
      });
    }

    // 4. Dernier recours pour les petites images : Base64 data URI
    if (!isVideo && buffer.length < 5 * 1024 * 1024) {
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        url: base64Data,
        mediaType,
        success: true,
      });
    }

    return NextResponse.json(
      { error: 'Échec de l\'enregistrement du fichier.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Erreur API upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors du téléversement du média' },
      { status: 500 }
    );
  }
}
