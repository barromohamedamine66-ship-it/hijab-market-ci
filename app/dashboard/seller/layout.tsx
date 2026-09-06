import Link from 'next/link';

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-secondary-light)',
        padding: 'var(--spacing-md)'
      }}>
        <h2 style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: 'var(--spacing-xl)' }}>
          Espace Vendeur
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <Link href="/dashboard/seller" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', fontWeight: 500 }}>
            Vue d'ensemble
          </Link>
          <Link href="/dashboard/seller/orders" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)' }}>
            Commandes
          </Link>
          <Link href="/dashboard/seller/products" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)' }}>
            Produits
          </Link>
          <Link href="/dashboard/seller/store" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)' }}>
            Ma Boutique
          </Link>
          <Link href="/dashboard/seller/wallet" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)' }}>
            Mon Portefeuille
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
        <div className="container animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
