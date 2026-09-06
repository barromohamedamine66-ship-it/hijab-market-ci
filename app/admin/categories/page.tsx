'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X, RefreshCw, Eye, EyeOff, Sparkles, ArrowUpDown } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Category } from '@/lib/supabase/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await DBService.getCategories(true);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setName('');
    setSlug('');
    setEmoji('✨');
    setDescription('');
    setOrderIndex(categories.length + 1);
    setIsActive(true);
    setEditingCategory(null);
    setIsCreating(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setEmoji(cat.emoji || '✨');
    setDescription(cat.description || '');
    setOrderIndex(cat.order_index);
    setIsActive(cat.is_active);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      // Update
      await DBService.updateCategory(editingCategory.id, {
        name: name.trim(),
        slug: slug.trim() || undefined,
        emoji: emoji.trim() || '✨',
        description: description.trim() || undefined,
        order_index: orderIndex,
        is_active: isActive,
      });
    } else {
      // Create
      await DBService.createCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        emoji: emoji.trim() || '✨',
        description: description.trim() || undefined,
        order_index: orderIndex,
      });
    }

    setIsCreating(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleToggleActive = async (cat: Category) => {
    await DBService.updateCategory(cat.id, { is_active: !cat.is_active });
    setCategories(categories.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
  };

  const handleDelete = async (catId: string) => {
    if (confirm('Voulez-vous désactiver ou supprimer cette catégorie ?')) {
      await DBService.deleteCategory(catId);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Rayons Dynamiques Supabase
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Gestion des Catégories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les 11 catégories officielles de mode modeste et traditionnelle ou ajoutez de nouveaux rayons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nouvelle Catégorie
          </button>
        </div>
      </div>

      {/* Modal / Formulaire d'ajout ou d'édition */}
      {(isCreating || editingCategory) && (
        <div className="bg-[#0f171d] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              {editingCategory ? `Modifier : ${editingCategory.name}` : 'Créer une Nouvelle Catégorie'}
            </h3>
            <button
              onClick={() => { setIsCreating(false); setEditingCategory(null); }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nom du rayon *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                  }
                }}
                placeholder="Ex: Boubous Homme"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Identifiant Slug (URL) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: boubous-homme"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emoji / Icône *</label>
              <input
                type="text"
                required
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Ex: 👔"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 text-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Description du rayon</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Grands boubous 3 pièces, ensembles bazin riche..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  min={1}
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  <span>Actif en ligne</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingCategory(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
              >
                {editingCategory ? 'Sauvegarder les modifications' : 'Créer la catégorie'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table des catégories */}
      <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Ordre</th>
                <th className="py-4 px-6">Emoji</th>
                <th className="py-4 px-6">Nom de la Catégorie</th>
                <th className="py-4 px-6">Slug (URL)</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">
                    #{cat.order_index}
                  </td>
                  <td className="py-4 px-6 text-2xl">
                    {cat.emoji || '✨'}
                  </td>
                  <td className="py-4 px-6 font-bold text-white">
                    {cat.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-emerald-400">
                    /products?category={cat.slug}
                  </td>
                  <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                        cat.is_active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                      title="Cliquer pour changer"
                    >
                      {cat.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {cat.is_active ? 'Active' : 'Masquée'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Supprimer / Désactiver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
