"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryName: 'Hijabs', // default
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Produit ajouté avec succès !');
        // Rediriger vers la liste des produits après un court délai
        setTimeout(() => router.push('/dashboard/seller/products'), 1500);
      } else {
        setMessage(data.message || 'Erreur lors de l\'ajout du produit');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1>Ajouter un produit</h1>
        <Link href="/dashboard/seller/products" className="btn-secondary">
          Annuler
        </Link>
      </div>

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
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Nom du produit</label>
          <input 
            style={inputStyle}
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Hijab en mousseline Premium"
            required
          />

          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Description</label>
          <textarea 
            style={{...inputStyle, minHeight: '100px'}}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Prix (FCFA)</label>
              <input 
                type="number"
                style={inputStyle}
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Stock</label>
              <input 
                type="number"
                style={inputStyle}
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                required
              />
            </div>
          </div>

          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Catégorie Principale</label>
          <select 
            style={inputStyle}
            value={formData.categoryName}
            onChange={e => setFormData({...formData, categoryName: e.target.value})}
          >
            <option value="Hijabs">Hijabs</option>
            <option value="Mode Modeste">Mode Modeste</option>
            <option value="Accessoires">Accessoires</option>
          </select>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Publication...' : 'Publier le produit'}
          </button>
        </form>
      </div>
    </div>
  );
}
