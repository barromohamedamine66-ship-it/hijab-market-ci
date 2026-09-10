import { PrismaClient } from '@prisma/client';

// ============================================================
// Singleton Prisma — Pattern recommandé pour Next.js
// Évite la création de centaines de connexions en dev (HMR)
// et optimise les connexions en production.
// ============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // Connection pooling optimisé pour Supabase Free (60 connexions max)
    // On limite à 10 pour laisser de la marge aux autres process
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// En développement, on réutilise le client entre les hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
