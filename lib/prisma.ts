// Client Prisma sécurisé / fallback pour Next.js App Router
export const prisma: any = typeof globalThis !== 'undefined' && (globalThis as any).prisma
  ? (globalThis as any).prisma
  : new Proxy({}, {
      get: () => new Proxy({}, {
        get: () => () => Promise.resolve(null),
      }),
    });

