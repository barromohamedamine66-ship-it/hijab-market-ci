"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function StoreSettingsPage() {
  const { user, profile, shop } = useAuth();
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    city: shop?.city || 'Abidjan',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // En production, il faudrait faire un fetch pour récupérer les infos existantes.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/seller/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Boutique enregistrée avec succès !');
      } else {
        setMessage(data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
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
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Ma Boutique</h1>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {message && (
          <div style={{
            padding: 'var(--spacing-sm)',
            backgroundColor: message.includes('succès') ? '#e8f5e9' : '#ffebee',
            color: message.includes('succès') ? 'var(--color-success)' : 'var(--color-error)',
            marginBottom: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-sm)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
            Nom de la boutique
          </label>
          <input 
            style={inputStyle}
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Les Voiles de Babi"
            required
          />

          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
            Description
          </label>
          <textarea 
            style={{...inputStyle, minHeight: '100px'}}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Décrivez votre boutique..."
          />

          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
            Ville
          </label>
          <select 
            style={inputStyle}
            value={formData.city}
            onChange={e => setFormData({...formData, city: e.target.value})}
            required
          >
            <option value="">Sélectionnez une ville</option>
            <option value="Abidjan">Abidjan</option>
            <option value="Bouaké">Bouaké</option>
            <option value="Yamoussoukro">Yamoussoukro</option>
            <option value="San-Pédro">San-Pédro</option>
          </select>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer ma boutique'}
          </button>
        </form>
      </div>
    </div>
  );
}
