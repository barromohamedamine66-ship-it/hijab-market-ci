'use client';

import { useState, useEffect } from 'react';
import { DBService } from '@/lib/supabase/db-service';
import { Search, User, Filter, AlertTriangle, ShieldOff, Trash2, Heart, Store, MessageCircle, Calendar, BellRing } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

export default function AdminUsersPage() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userLikes, setUserLikes] = useState<any[]>([]);
  const [userFollows, setUserFollows] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Notification state
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    const data = await DBService.getAllClients();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openUserDetails = async (user: Profile) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    const [likes, follows] = await Promise.all([
      DBService.getLikedProducts(user.id),
      DBService.getFollowedShops(user.id)
    ]);
    setUserLikes(likes);
    setUserFollows(follows);
    setLoadingDetails(false);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setUserLikes([]);
    setUserFollows([]);
  };

  const handleSuspend = async (user: Profile) => {
    const isSuspended = !user.is_suspended;
    if (confirm(`Voulez-vous vraiment ${isSuspended ? 'suspendre' : 'réactiver'} le compte de ${user.full_name} ?`)) {
      await DBService.suspendUser(user.id, isSuspended);
      fetchClients();
      if (selectedUser?.id === user.id) closeUserDetails();
    }
  };

  const handleDelete = async (user: Profile) => {
    if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le compte de ${user.full_name} ? Cette action est irréversible.`)) {
      await DBService.deleteUser(user.id);
      fetchClients();
      if (selectedUser?.id === user.id) closeUserDetails();
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !notifTitle || !notifMsg) return;
    
    await DBService.sendNotification(selectedUser.id, notifTitle, notifMsg, 'system');
    alert(`Notification envoyée à ${selectedUser.full_name}`);
    setShowNotifModal(false);
    setNotifTitle('');
    setNotifMsg('');
  };

  const filteredClients = clients.filter(c => 
    (c.full_name?.toLowerCase().includes(search.toLowerCase()) || '') ||
    (c.phone?.includes(search) || '') ||
    (c.email?.toLowerCase().includes(search.toLowerCase()) || '')
  );

  return (
    <div className="p-4 md:p-8 ml-0 md:ml-64 bg-[#070b0e] min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
              <User className="w-8 h-8 text-emerald-400" />
              Gestion des Clients & Utilisateurs
            </h1>
            <p className="text-sm text-slate-400 mt-1">Gérez la base de données de vos clients et modérez la communauté.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-[#0a1014] border border-slate-800 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Clients</p>
              <p className="text-xl font-black text-emerald-400">{clients.length}</p>
            </div>
            <div className="bg-[#0a1014] border border-slate-800 rounded-2xl px-4 py-2 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Actifs</p>
              <p className="text-xl font-black text-blue-400">{clients.filter(c => !c.is_suspended).length}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#0a1014] border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Rechercher par nom, téléphone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#070b0e] border border-slate-700/50 focus:border-emerald-500 rounded-xl outline-none text-sm text-white transition"
            />
          </div>
          <button className="btn btn-outline border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0">
            <Filter className="w-4 h-4" /> Filtres
          </button>
        </div>

        {/* Datagrid */}
        <div className="bg-[#0a1014] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#070b0e] text-slate-400 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Localisation</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Aucun client trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {client.avatar_url ? (
                              <img src={client.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-slate-400">{client.full_name?.substring(0, 2).toUpperCase() || 'HM'}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-emerald-400 transition cursor-pointer" onClick={() => openUserDetails(client)}>
                              {client.full_name || 'Client Inconnu'}
                            </p>
                            <p className="text-[10px] text-slate-500">Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 font-medium">{client.phone || 'Non renseigné'}</p>
                        <p className="text-xs text-slate-500">{client.email || 'Pas d\'email'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300">{client.city}</p>
                        <p className="text-xs text-slate-500">{client.commune || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {client.is_suspended ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Suspendu
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openUserDetails(client)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Identity Modal / Drawer */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeUserDetails} />
            <div className="w-full max-w-md bg-[#0a1014] border-l border-slate-800 h-full overflow-y-auto relative animate-in slide-in-from-right duration-300 shadow-2xl">
              
              <div className="p-6 border-b border-slate-800 sticky top-0 bg-[#0a1014]/95 backdrop-blur-xl z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-emerald-500">{selectedUser.full_name?.substring(0, 2).toUpperCase() || 'HM'}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-heading text-white">{selectedUser.full_name}</h2>
                    <p className="text-xs text-slate-400">{selectedUser.phone} • {selectedUser.city}</p>
                  </div>
                </div>
                <button onClick={closeUserDetails} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition">
                  <User className="w-4 h-4 rotate-45" /> {/* Just using something as close icon */}
                </button>
              </div>

              <div className="p-6 space-y-8">
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#070b0e] p-4 rounded-2xl border border-slate-800/80">
                    <Heart className="w-5 h-5 text-rose-500 mb-2" />
                    <p className="text-2xl font-black text-white">{userLikes.length}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Produits Favoris</p>
                  </div>
                  <div className="bg-[#070b0e] p-4 rounded-2xl border border-slate-800/80">
                    <Store className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-2xl font-black text-white">{userFollows.length}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Abonnements</p>
                  </div>
                </div>

                {/* Personnal Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Infos Complémentaires</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#070b0e] rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" /> Date de Naissance
                      </div>
                      <span className="font-bold text-emerald-400">{selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#070b0e] rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <BellRing className="w-4 h-4 text-slate-500" /> Notifications Push
                      </div>
                      <span className={`font-bold ${selectedUser.push_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {selectedUser.push_enabled ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Administratives */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Actions Administratives</h3>
                  <div className="space-y-3">
                    <button onClick={() => setShowNotifModal(true)} className="w-full flex items-center justify-between p-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl transition text-sky-400 group">
                      <span className="font-bold text-sm">Envoyer une Notification</span>
                      <BellRing className="w-4 h-4 group-hover:scale-110 transition" />
                    </button>
                    
                    <button onClick={() => handleSuspend(selectedUser)} className="w-full flex items-center justify-between p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl transition text-orange-400 group">
                      <span className="font-bold text-sm">{selectedUser.is_suspended ? 'Réactiver le compte' : 'Suspendre le compte'}</span>
                      <ShieldOff className="w-4 h-4 group-hover:scale-110 transition" />
                    </button>

                    <button onClick={() => handleDelete(selectedUser)} className="w-full flex items-center justify-between p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition text-rose-400 group">
                      <span className="font-bold text-sm">Supprimer définitivement</span>
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        {showNotifModal && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNotifModal(false)} />
            <div className="bg-[#0a1014] border border-slate-700 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-white mb-2">Envoyer une Notification</h3>
              <p className="text-xs text-slate-400 mb-6">Un message sera envoyé directement à {selectedUser.full_name}.</p>
              
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Titre du message</label>
                  <input 
                    type="text" required value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 focus:border-sky-500 rounded-xl outline-none text-sm text-white transition"
                    placeholder="Ex: Bonne nouvelle !"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contenu</label>
                  <textarea 
                    required value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 focus:border-sky-500 rounded-xl outline-none text-sm text-white transition resize-none"
                    placeholder="Votre message..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowNotifModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-sm">Annuler</button>
                  <button type="submit" className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition shadow-[0_0_15px_rgba(14,165,233,0.4)] text-sm flex items-center justify-center gap-2">
                    <BellRing className="w-4 h-4" /> Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
