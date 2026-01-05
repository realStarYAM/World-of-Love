/**
 * World of Love — Card Game
 * Module de stockage (localStorage)
 * 
 * Gère la persistance des données joueur :
 * - Sauvegarde automatique
 * - Chargement au démarrage
 * - Export/Import JSON
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY_USERS = 'worldoflove_users';
const STORAGE_KEY_CURRENT_USER = 'worldoflove_current_user';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface Card {
    id: string;              // ID unique de la carte
    countryCode: string;     // Code ISO du pays
    countryName: string;     // Nom du pays
    continent: Continent;    // Continent
    rarity: Rarity;          // Rareté obtenue
    level: number;           // Niveau (1-5)
    lovePower: number;       // Puissance d'amour
    flag: string;            // Emoji drapeau
    obtainedAt: number;      // Timestamp d'obtention
}

interface Mission {
    id: string;
    type: 'open_pack' | 'fuse_card' | 'get_rare' | 'play_game' | 'collect';
    description: string;
    target: number;
    progress: number;
    completed: boolean;
    rewardCoins: number;
    rewardXp: number;
}

interface Player {
    username: string;
    passwordHash: string;
    level: number;
    coins: number;
    gems: number;
    xp: number;
    xpToNextLevel: number;
    deck: Card[];           // Cartes possédées (avec doublons possibles)
    collection: string[];   // Codes pays uniques découverts
    favorites: string[];    // IDs de cartes favorites
    lastDailyRewardDate: string | null;
    dailyMissions: Mission[];
    lastMissionsDate: string | null;
    lastLoveMatchTime: number;
    stats: {
        packsOpened: number;
        cardsFused: number;
        gamesPlayed: number;
        gamesWon: number;
    };
    createdAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STOCKAGE LOCAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Récupère tous les utilisateurs stockés
 */
function getAllUsers(): Record<string, Player> {
    try {
        const data = localStorage.getItem(STORAGE_KEY_USERS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Erreur lecture users:', e);
        return {};
    }
}

/**
 * Sauvegarde tous les utilisateurs
 */
function saveAllUsers(users: Record<string, Player>): void {
    try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
        console.error('Erreur sauvegarde users:', e);
    }
}

/**
 * Récupère le nom d'utilisateur actuel
 */
function getCurrentUsername(): string | null {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER);
}

/**
 * Définit l'utilisateur actuel
 */
function setCurrentUsername(username: string | null): void {
    if (username) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, username);
    } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
}

/**
 * Charge le profil du joueur actuel
 */
function loadPlayer(): Player | null {
    const username = getCurrentUsername();
    if (!username) return null;

    const users = getAllUsers();
    return users[username] || null;
}

/**
 * Sauvegarde le profil joueur
 */
function savePlayer(player: Player): void {
    const users = getAllUsers();
    users[player.username] = player;
    saveAllUsers(users);
}

/**
 * Vérifie si un utilisateur existe
 */
function userExists(username: string): boolean {
    const users = getAllUsers();
    return !!users[username];
}

/**
 * Récupère un utilisateur par nom
 */
function getUser(username: string): Player | null {
    const users = getAllUsers();
    return users[username] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporte la sauvegarde du joueur actuel en JSON
 */
function exportSave(): void {
    const player = loadPlayer();
    if (!player) {
        showToast('Aucun joueur connecté !', 'error');
        return;
    }

    // Créer une copie sans le hash du mot de passe pour la sécurité
    const exportData = {
        ...player,
        passwordHash: '[PROTECTED]',
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `worldoflove_${player.username}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Sauvegarde exportée !', 'success');
}

/**
 * Importe une sauvegarde depuis un fichier JSON
 */
function importSave(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                // Validation basique
                if (!data.username || !data.deck || !data.collection) {
                    showToast('Fichier de sauvegarde invalide !', 'error');
                    resolve(false);
                    return;
                }

                // Récupérer le joueur actuel pour garder son mot de passe
                const currentPlayer = loadPlayer();
                if (!currentPlayer) {
                    showToast('Connectez-vous d\'abord !', 'error');
                    resolve(false);
                    return;
                }

                // Fusionner les données importées avec le joueur actuel
                const updatedPlayer: Player = {
                    ...data,
                    username: currentPlayer.username, // Garder le nom actuel
                    passwordHash: currentPlayer.passwordHash, // Garder le mot de passe
                };

                savePlayer(updatedPlayer);
                showToast('Sauvegarde importée avec succès !', 'success');
                resolve(true);
            } catch (err) {
                console.error('Erreur import:', err);
                showToast('Erreur lors de l\'import !', 'error');
                resolve(false);
            }
        };

        reader.onerror = () => {
            showToast('Erreur lecture fichier !', 'error');
            resolve(false);
        };

        reader.readAsText(file);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Génère un ID unique
 */
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Obtient la date du jour au format YYYY-MM-DD
 */
function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}
