"use client";

import { useState } from 'react';

export default function SellerWalletPage() {
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [beneficiaryNum, setBeneficiaryNum] = useState('');
  const [message, setMessage] = useState('');

  // Données fictives pour le MVP UI
  const walletData = {
    pendingBalance: 25000,
    availableBalance: 45000,
    withdrawnBalance: 120000,
    commissionRate: 7 // 7%
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (parseInt(withdrawalAmount) < 5000) {
        setMessage('Le montant minimum de retrait est de 5 000 FCFA.');
      } else if (parseInt(withdrawalAmount) > walletData.availableBalance) {
        setMessage('Solde disponible insuffisant.');
      } else {
        setMessage('✅ Demande de retrait envoyée ! Elle sera traitée sous 24h.');
        setWithdrawalAmount('');
      }
      setLoading(false);
    }, 1500);
  };

  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-sm)',
    flex: 1
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-secondary-light)',
    borderRadius: 'var(--border-radius-md)',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Mon Portefeuille</h1>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
        <div style={{ ...cardStyle, borderTop: '4px solid var(--color-success)' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>Solde Disponible</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-success)', marginTop: 'var(--spacing-sm)' }}>
            {walletData.availableBalance.toLocaleString()} FCFA
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Argent prêt à être retiré.</p>
        </div>
        
        <div style={{ ...cardStyle, borderTop: '4px solid var(--color-warning)' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>Solde en Attente</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: 'var(--spacing-sm)' }}>
            {walletData.pendingBalance.toLocaleString()} FCFA
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Commandes non encore livrées (Délai de sécurité 24h).</p>
        </div>

        <div style={{ ...cardStyle, borderTop: '4px solid var(--color-primary)' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>Total Retiré</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: 'var(--spacing-sm)' }}>
            {walletData.withdrawnBalance.toLocaleString()} FCFA
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Historique de vos retraits.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
        
        <div style={{ ...cardStyle, flex: 2 }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Faire une demande de retrait</h3>
          
          {message && (
            <div style={{
              padding: 'var(--spacing-sm)',
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
              color: message.includes('✅') ? 'var(--color-success)' : 'var(--color-error)',
              marginBottom: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius-sm)'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleWithdrawal}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
              Montant (FCFA)
            </label>
            <input 
              type="number"
              style={inputStyle}
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="Ex: 10000 (Min. 5000)"
              required
            />

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                  Moyen de réception
                </label>
                <select style={inputStyle} value={withdrawalMethod} onChange={(e) => setWithdrawalMethod(e.target.value)} required>
                  <option value="">Sélectionner...</option>
                  <option value="WAVE">Wave Mobile Money</option>
                  <option value="ORANGE">Orange Money</option>
                  <option value="MTN">MTN Mobile Money</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                  Numéro du compte
                </label>
                <input 
                  type="text"
                  style={inputStyle}
                  value={beneficiaryNum}
                  onChange={(e) => setBeneficiaryNum(e.target.value)}
                  placeholder="Ex: 0102030405"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '15px' }}>
              {loading ? 'Traitement...' : 'Demander un retrait'}
            </button>
            <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Commission HIJAB MARKET CI : {walletData.commissionRate}% prélevée à la source (sur les ventes, pas sur le retrait).
            </p>
          </form>
        </div>

        <div style={{ ...cardStyle, flex: 1 }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Derniers Mouvements</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Vente #HMCI-001-A</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+ 13 950 F</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Aujourd'hui - Solde en attente</div>
            </li>
            <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Retrait Wave</span>
                <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>- 20 000 F</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Hier - Terminé</div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
