import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filename = params.id;
    // Sécurité: empêcher la traversée de répertoires
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = sanitizedFilename.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'gif') contentType = 'image/gif';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Si le fichier local n'existe pas, renvoyer une redirection vers l'image par défaut
      return NextResponse.redirect('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80', 307);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });
  }
}
