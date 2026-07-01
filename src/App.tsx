import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Mail,
  X,
  Pencil,
  Trash2,
  Loader2,
  LogOut,
} from 'lucide-react';
import { supabase, Game } from './lib/supabase';

const ADMIN_PASSWORD = 'ludo';
const CONTACT_EMAIL = 'biblio@lalumiere.be';

type FilterAutonomy = 'all' | '100' | '0';

interface GameFormData {
  name: string;
  autonomy: '100' | '0';
  age: number;
  players: string;
  duration: string;
  adapte: boolean;
  content: string;
  copies: number;
}

const emptyFormData: GameFormData = {
  name: '',
  autonomy: '100',
  age: 0,
  players: '',
  duration: '',
  adapte: false,
  content: '',
  copies: 1,
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [autonomyFilter, setAutonomyFilter] = useState<FilterAutonomy>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Add/Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameFormData>(emptyFormData);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Fetch games
  const fetchGames = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      showToast('Erreur lors du chargement des jeux');
    } else {
      setGames(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGames();
    const savedAdmin = sessionStorage.getItem('ludo_admin_mode');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
  }, [fetchGames]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  // Admin login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.toLowerCase() === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('ludo_admin_mode', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
      setAdminError('');
      showToast('Mode administration active !');
    } else {
      setAdminError('Mot de passe incorrect.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('ludo_admin_mode');
    showToast('Mode administration desactive.');
  };

  // Order modal
  const openOrderModal = (game: Game) => {
    setSelectedGame(game);
    setShowOrderModal(true);
  };

  const handleOrder = () => {
    if (!selectedGame) return;
    const subject = encodeURIComponent(`Commande de jeu : ${selectedGame.name}`);
    const body = encodeURIComponent(`Bonjour,

Je souhaite commander le jeu suivant de votre catalogue :
- Nom du jeu : ${selectedGame.name}
- Nombre d'exemplaires disponibles : ${selectedGame.copies}

Merci !`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Add/Edit game
  const openAddModal = () => {
    setEditingGame(null);
    setFormData(emptyFormData);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      autonomy: game.autonomy as '100' | '0',
      age: game.age,
      players: game.players,
      duration: game.duration,
      adapte: game.adapte,
      content: game.content,
      copies: game.copies,
    });
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Le nom du jeu est obligatoire.');
      return;
    }

    setFormSaving(true);
    setFormError('');

    const gameData = {
      name: formData.name.trim(),
      autonomy: formData.autonomy,
      age: formData.age || 0,
      players: formData.players.trim(),
      duration: formData.duration.trim(),
      adapte: formData.adapte,
      content: formData.content.trim(),
      copies: Math.max(1, formData.copies),
    };

    let error;
    if (editingGame) {
      ({ error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', editingGame.id));
    } else {
      ({ error } = await supabase.from('games').insert([gameData]));
    }

    if (error) {
      setFormError('Une erreur est survenue. Reessayez.');
    } else {
      setShowFormModal(false);
      fetchGames();
      showToast(editingGame ? 'Jeu modifie !' : 'Jeu ajoute !');
    }
    setFormSaving(false);
  };

  // Delete game
  const openDeleteModal = (game: Game) => {
    setDeletingGame(game);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGame) return;
    setDeleteSaving(true);

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', deletingGame.id);

    if (error) {
      showToast('Erreur lors de la suppression.');
    } else {
      setShowDeleteModal(false);
      fetchGames();
      showToast('Jeu supprime !');
    }
    setDeleteSaving(false);
  };

  // Filter games
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      !searchQuery ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAutonomy =
      autonomyFilter === 'all' || game.autonomy === autonomyFilter;
    return matchesSearch && matchesAutonomy;
  });

  return (
    <div
      className="min-h-screen w-full text-stone-800"
      style={{ background: 'linear-gradient(rgb(247, 244, 236), rgb(238, 242, 236))' }}
    >
      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-stone-900 text-white px-4 py-2.5 text-sm flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-stone-200">
              Mode Administration Actif
            </span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se deconnecter
          </button>
        </div>
      )}

      {/* Header */}
      <header className="w-full">
        <div className="relative w-full">
          <img
            loading="lazy"
            className="w-full object-cover"
            style={{ height: 'min(34vh, 280px)', minHeight: '220px' }}
            src="https://images.pexels.com/photos/8111259/pexels-photo-8111259.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cartes et jetons de jeux de societe"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(31,58,46,0.25), rgba(31,58,46,0.78))',
            }}
          ></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-white drop-shadow-md text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              Catalogue de nos jeux
            </h1>
            <p className="mt-3 max-w-2xl text-white/95 text-base md:text-lg">
              Parcourez notre collection de jeux accessibles et adaptes.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Filters */}
        <section
          aria-label="Recherche et filtres"
          className="rounded-2xl p-5 mb-8 shadow-sm bg-white"
        >
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            {/* Search */}
            <div>
              <label
                htmlFor="search-input"
                className="block mb-1.5 font-semibold text-stone-700"
              >
                Rechercher un jeu
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-[18px] h-[18px]" />
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus-ring w-full rounded-xl border border-stone-300 bg-white focus:bg-emerald-50 pl-10 pr-3 py-2.5 text-stone-800 transition-colors"
                  placeholder="Nom du jeu ou contenu..."
                />
              </div>
            </div>

            {/* Autonomy Filter */}
            <div className="flex flex-wrap gap-5">
              <div>
                <span className="block mb-1.5 font-semibold text-stone-700">
                  Autonomie
                </span>
                <div
                  className="inline-flex rounded-xl border border-stone-300 overflow-hidden bg-white"
                  role="group"
                  aria-label="Filtre autonomie"
                >
                  {[
                    { value: 'all' as const, label: 'Tous' },
                    { value: '100' as const, label: '100% autonomie' },
                    { value: '0' as const, label: '0% autonomie' },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      type="button"
                      aria-pressed={autonomyFilter === btn.value}
                      onClick={() => setAutonomyFilter(btn.value)}
                      className="seg-btn focus-ring px-3.5 py-2 text-sm font-medium border-r border-stone-200 text-stone-700 last:border-r-0"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Result count & Add button */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500" aria-live="polite">
              {filteredGames.length} jeu{filteredGames.length !== 1 ? 'x' : ''}{' '}
              affiche{filteredGames.length !== 1 ? 's' : ''}
            </p>
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold shadow-sm bg-emerald-800 text-white hover:bg-emerald-900 transition"
              >
                <Plus className="w-4 h-4" />
                Ajouter un jeu
              </button>
            )}
          </div>
        </section>

        {/* Empty State */}
        {!loading && filteredGames.length === 0 && (
          <p className="text-center py-16 text-stone-500">
            Aucun jeu trouve. Modifiez vos filtres ou ajoutez un jeu.
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
            <p className="mt-4 text-stone-500">Chargement des jeux...</p>
          </div>
        )}

        {/* Game Grid */}
        {!loading && filteredGames.length > 0 && (
          <div className="game-grid w-full">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdmin={isAdmin}
                onOrder={() => openOrderModal(game)}
                onEdit={() => openEditModal(game)}
                onDelete={() => openDeleteModal(game)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/60 mt-4">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-stone-500 mb-3">
            Catalogue de jeux - collection accessible et adaptee
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm mb-4">
            <span className="font-semibold text-stone-500">
              En savoir plus sur les jeux :
            </span>
            <a
              href="https://wikiludo.bibenligne.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-emerald-800 focus-ring rounded px-2 py-1 transition"
            >
              Wikiludo (Explications)
            </a>
            <a
              href="https://ludovox.fr/category/video/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-emerald-800 focus-ring rounded px-2 py-1 transition"
            >
              Ludochrono (Videos)
            </a>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-stone-400 hover:text-stone-700 underline focus-ring rounded px-2 py-1 transition"
            >
              Acces Administrateur
            </button>
          )}
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <Modal onClose={() => setShowAdminLogin(false)}>
          <h2 className="mb-2 text-stone-800 text-lg font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
            Connexion Administrateur
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Saisissez le mot de passe pour pouvoir ajouter, modifier ou supprimer des jeux.
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Mot de passe"
              className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
              autoFocus
            />
            {adminError && (
              <p className="text-sm text-red-600" aria-live="polite">
                {adminError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="focus-ring bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="focus-ring bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl font-semibold"
              >
                Se connecter
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedGame && (
        <Modal onClose={() => setShowOrderModal(false)}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-emerald-800 text-lg font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              Commander ce jeu
            </h2>
            <button
              onClick={() => setShowOrderModal(false)}
              className="text-stone-400 hover:text-stone-600 focus-ring rounded-lg p-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-stone-500 mb-5">
            Cliquez sur le bouton ci-dessous pour ouvrir votre messagerie avec un message pre-rempli.
          </p>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-5">
            <p className="font-semibold text-stone-800 mb-2">{selectedGame.name}</p>
            <div className="text-sm text-stone-600 space-y-1">
              {selectedGame.age > 0 && <p>Des {selectedGame.age} ans</p>}
              {selectedGame.players && <p>{selectedGame.players}</p>}
              {selectedGame.duration && <p>{selectedGame.duration}</p>}
              <p>{selectedGame.copies} exemplaire{selectedGame.copies > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowOrderModal(false)}
              className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold flex-1 bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              Fermer
            </button>
            <button
              onClick={handleOrder}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold flex-1 bg-emerald-800 text-white hover:bg-emerald-900"
            >
              <Mail className="w-4 h-4" />
              Commander
            </button>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <Modal onClose={() => setShowFormModal(false)}>
          <div className="mb-4">
            <h2 className="text-emerald-800 text-xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              {editingGame ? 'Modifier le jeu' : 'Ajouter un jeu'}
            </h2>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="f-name"
                className="block mb-1.5 font-semibold text-stone-700"
              >
                Nom du jeu
              </label>
              <input
                id="f-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block mb-1.5 font-semibold text-stone-700">
                  Autonomie
                </span>
                <div
                  className="inline-flex rounded-xl border border-stone-300 overflow-hidden bg-white"
                  role="group"
                >
                  <button
                    type="button"
                    aria-pressed={formData.autonomy === '100'}
                    onClick={() => setFormData({ ...formData, autonomy: '100' })}
                    className={`seg-btn focus-ring px-3.5 py-2 text-sm font-medium border-r border-stone-200 ${
                      formData.autonomy === '100'
                        ? ''
                        : 'text-stone-700'
                    }`}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    aria-pressed={formData.autonomy === '0'}
                    onClick={() => setFormData({ ...formData, autonomy: '0' })}
                    className={`seg-btn focus-ring px-3.5 py-2 text-sm font-medium ${
                      formData.autonomy === '0' ? '' : 'text-stone-700'
                    }`}
                  >
                    0%
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.adapte}
                    onChange={(e) =>
                      setFormData({ ...formData, adapte: e.target.checked })
                    }
                    className="focus-ring h-5 w-5 rounded border-stone-300"
                  />
                  <span className="font-semibold text-stone-700">Jeu adapte</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="f-age"
                  className="block mb-1.5 font-semibold text-stone-700"
                >
                  Age min.
                </label>
                <input
                  id="f-age"
                  type="number"
                  min="0"
                  value={formData.age || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
                />
              </div>
              <div>
                <label
                  htmlFor="f-copies"
                  className="block mb-1.5 font-semibold text-stone-700"
                >
                  Exemplaires
                </label>
                <input
                  id="f-copies"
                  type="number"
                  min="1"
                  value={formData.copies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      copies: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
                />
              </div>
              <div>
                <label
                  htmlFor="f-players"
                  className="block mb-1.5 font-semibold text-stone-700"
                >
                  Joueurs
                </label>
                <input
                  id="f-players"
                  type="text"
                  value={formData.players}
                  onChange={(e) =>
                    setFormData({ ...formData, players: e.target.value })
                  }
                  className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="f-duration"
                className="block mb-1.5 font-semibold text-stone-700"
              >
                Duree
              </label>
              <input
                id="f-duration"
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
              />
            </div>

            <div>
              <label
                htmlFor="f-content"
                className="block mb-1.5 font-semibold text-stone-700"
              >
                Contenu de la boite
              </label>
              <textarea
                id="f-content"
                rows={3}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="focus-ring w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800"
              />
              <p className="mt-1 text-xs text-stone-400">
                separez les elements par une barre verticale « | »
              </p>
            </div>

            {formError && (
              <p className="text-sm text-red-600" aria-live="polite">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                disabled={formSaving}
                className="focus-ring rounded-xl px-4 py-2.5 font-semibold bg-stone-100 text-stone-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold shadow-sm bg-emerald-800 text-white"
              >
                {formSaving && <Loader2 className="w-4 h-4 spin" />}
                Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingGame && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <h2 className="mb-2 text-emerald-800 text-xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
              Supprimer ce jeu ?
            </h2>
            <p className="mb-5 text-stone-600">
              Cette action est definitive. Le jeu sera retire de votre catalogue.
            </p>
            <p className="mb-5 font-semibold text-stone-800">
              {deletingGame.name}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteSaving}
                className="focus-ring rounded-xl px-4 py-2.5 font-semibold bg-stone-100 text-stone-700"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteSaving}
                className="focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold bg-red-600 text-white"
              >
                {deleteSaving && <Loader2 className="w-4 h-4 spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-emerald-800 px-4 py-3 text-sm text-white shadow-lg"
          role="alert"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// Game Card Component
function GameCard({
  game,
  isAdmin,
  onOrder,
  onEdit,
  onDelete,
}: {
  game: Game;
  isAdmin: boolean;
  onOrder: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const displayName =
    game.copies > 1 ? `${game.name} x${game.copies}` : game.name;

  const metaBits: string[] = [];
  if (game.age > 0) metaBits.push(`Des ${game.age} ans`);
  if (game.players) metaBits.push(game.players);
  if (game.duration) metaBits.push(game.duration);

  return (
    <article className="game-card-wrap">
      <div className="rounded-2xl p-5 shadow-sm border border-stone-100 h-full bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="leading-tight text-emerald-800 font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
            {displayName}
          </h3>
          {isAdmin && (
            <div className="flex shrink-0 gap-1">
              <button
                onClick={onEdit}
                className="focus-ring rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Modifier ce jeu"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="focus-ring rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50"
                aria-label="Supprimer ce jeu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {game.autonomy === '100' ? (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
              100% autonomie
            </span>
          ) : (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
              0% autonomie
            </span>
          )}
          {game.adapte && (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
              Jeu adapte
            </span>
          )}
        </div>

        {/* Meta */}
        {metaBits.length > 0 && (
          <p className="text-sm text-stone-500 mb-3">{metaBits.join(' - ')}</p>
        )}

        {/* Content */}
        {game.content && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">
              Contenu
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              {game.content.replace(/\s*\|\s*/g, ' - ')}
            </p>
          </div>
        )}

        {/* Order Button */}
        <div className="pt-3 mt-auto border-t border-stone-100 flex justify-end">
          <button
            onClick={onOrder}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors bg-emerald-800 text-white hover:bg-emerald-900"
          >
            <Mail className="w-3.5 h-3.5" />
            Commander
          </button>
        </div>
      </div>
    </article>
  );
}

// Modal Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(31,58,46,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
