export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background)',
      padding: 'var(--spacing-md)'
    }}>
      <div className="animate-fade-in" style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-2xl)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        {/* Logo Placement */}
        <h1 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)' }}>
          HIJAB MARKET CI
        </h1>
        {children}
      </div>
    </div>
  );
}
