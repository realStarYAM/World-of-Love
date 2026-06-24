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
const APP_SAVE_VERSION = '1.1.2';

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

type MissionType = 'open_pack' | 'fuse_card' | 'get_rare' | 'play_game' | 'win_game' | 'collect';

interface Mission {
    id: string;
    type: MissionType;
    description: string;
    target: number;
    progress: number;
    completed: boolean;
    rewardCoins: number;
    rewardXp: number;
}

interface PlayerStats {
    packsOpened: number;
    basicPacksOpened: number;
    premiumPacksOpened: number;
    cardsFused: number;
    gamesPlayed: number;
    gamesWon: number;
    rareCardsFound: number;
    legendaryCardsFound: number;
    dailyRewardsClaimed: number;
    bestLovePower: number;
}

interface PlayerSettings {
    autoSave: boolean;
    darkMode: boolean;
    reducedMotion: boolean;
    notifications: boolean;
    uiThemeId: string;
}

interface AchievementRecord {
    [achievementId: string]: number;
}

interface Player {
    version: string;
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
    stats: PlayerStats;
    xpTotal: number;
    unlockedAchievements: string[];
    achievementDates: AchievementRecord;
    settings: PlayerSettings;
    createdAt: number;
    lastLoginAt: number;
    lastSavedAt: number;
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

function normalizePlayer(player: Player): Player {
    const now = Date.now();
    const legacyStats = (player.stats || {}) as Partial<PlayerStats>;
    const settings = (player.settings || {}) as Partial<PlayerSettings>;

    player.version = APP_SAVE_VERSION;
    player.deck = Array.isArray(player.deck) ? player.deck : [];
    player.collection = Array.isArray(player.collection) ? player.collection : [];
    player.favorites = Array.isArray(player.favorites) ? player.favorites : [];
    player.dailyMissions = Array.isArray(player.dailyMissions) ? player.dailyMissions : [];

    const discoveredCodes = [
        ...player.collection,
        ...player.deck.map(card => card.countryCode)
    ].filter(Boolean);
    player.collection = Array.from(new Set(discoveredCodes));

    player.stats = {
        packsOpened: legacyStats.packsOpened || 0,
        basicPacksOpened: legacyStats.basicPacksOpened || 0,
        premiumPacksOpened: legacyStats.premiumPacksOpened || 0,
        cardsFused: legacyStats.cardsFused || 0,
        gamesPlayed: legacyStats.gamesPlayed || 0,
        gamesWon: legacyStats.gamesWon || 0,
        rareCardsFound: legacyStats.rareCardsFound || player.deck.filter(card => card.rarity !== 'Common').length,
        legendaryCardsFound: legacyStats.legendaryCardsFound || player.deck.filter(card => card.rarity === 'Legendary').length,
        dailyRewardsClaimed: legacyStats.dailyRewardsClaimed || 0,
        bestLovePower: legacyStats.bestLovePower || player.deck.reduce((best, card) => Math.max(best, card.lovePower || 0), 0),
    };

    player.xp = Math.max(0, player.xp || 0);
    player.xpToNextLevel = Math.max(100, player.xpToNextLevel || 100);
    player.level = Math.max(1, player.level || 1);
    player.coins = Math.max(0, player.coins || 0);
    player.gems = Math.max(0, player.gems || 0);
    player.xpTotal = Math.max(player.xp || 0, player.xpTotal || player.xp || 0);
    player.unlockedAchievements = Array.isArray(player.unlockedAchievements) ? player.unlockedAchievements : [];
    player.achievementDates = player.achievementDates || {};
    player.settings = {
        autoSave: settings.autoSave !== false,
        darkMode: settings.darkMode !== false,
        reducedMotion: settings.reducedMotion === true,
        notifications: settings.notifications !== false,
        uiThemeId: typeof settings.uiThemeId === 'string' ? settings.uiThemeId : DEFAULT_UI_THEME_ID,
    };
    player.createdAt = player.createdAt || now;
    player.lastLoginAt = player.lastLoginAt || now;
    player.lastSavedAt = player.lastSavedAt || now;

    return player;
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
    const player = users[username] || null;
    if (!player) return null;

    const needsMigration = player.version !== APP_SAVE_VERSION ||
        !player.settings ||
        typeof player.settings.uiThemeId !== 'string' ||
        !player.unlockedAchievements ||
        !player.achievementDates ||
        !player.stats ||
        typeof player.stats.basicPacksOpened !== 'number';

    normalizePlayer(player);

    if (needsMigration) {
        users[player.username] = player;
        saveAllUsers(users);
    }

    return player;
}

/**
 * Sauvegarde le profil joueur
 */
function savePlayer(player: Player): void {
    const users = getAllUsers();
    normalizePlayer(player);

    if (typeof syncPlayerProgress === 'function') {
        syncPlayerProgress(player);
    }

    player.version = APP_SAVE_VERSION;
    player.lastSavedAt = Date.now();
    users[player.username] = player;
    saveAllUsers(users);

    window.dispatchEvent(new CustomEvent('wol:autosave', {
        detail: {
            username: player.username,
            savedAt: player.lastSavedAt,
        }
    }));
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

                normalizePlayer(updatedPlayer);
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
