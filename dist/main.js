/**
 * World of Love — Card Game
 * Module d'authentification
 *
 * Gère :
 * - Inscription (signup)
 * - Connexion (login)
 * - Déconnexion (logout)
 * - Hash simple du mot de passe (demo)
 */
// ═══════════════════════════════════════════════════════════════════════════
// HASH MOT DE PASSE (DEMO - PAS SÉCURISÉ)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Hash simple d'un mot de passe (DEMO UNIQUEMENT)
 * En production, utiliser bcrypt ou similaire côté serveur
 */
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir en 32-bit
    }
    // Ajouter un salt simple et encoder en base64
    const salted = `wol_${hash}_${password.length}`;
    return btoa(salted);
}
/**
 * Vérifie si un mot de passe correspond au hash
 */
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}
// ═══════════════════════════════════════════════════════════════════════════
// CRÉATION DE PROFIL
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Crée un nouveau profil joueur avec les valeurs par défaut
 */
function createNewPlayer(username, passwordHash) {
    return {
        username,
        passwordHash,
        level: 1,
        coins: 500, // Coins de départ
        gems: 10, // Gems de départ
        xp: 0,
        xpToNextLevel: 100,
        deck: [],
        collection: [],
        favorites: [],
        lastDailyRewardDate: null,
        dailyMissions: [],
        lastMissionsDate: null,
        lastLoveMatchTime: 0,
        stats: {
            packsOpened: 0,
            cardsFused: 0,
            gamesPlayed: 0,
            gamesWon: 0,
        },
        createdAt: Date.now(),
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Inscription d'un nouveau joueur
 */
function signup(username, password) {
    // Validation
    username = username.trim();
    if (!username || username.length < 3) {
        return { success: false, message: 'Le pseudo doit faire au moins 3 caractères.' };
    }
    if (username.length > 20) {
        return { success: false, message: 'Le pseudo ne peut pas dépasser 20 caractères.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, message: 'Le pseudo ne peut contenir que des lettres, chiffres et _' };
    }
    if (!password || password.length < 4) {
        return { success: false, message: 'Le mot de passe doit faire au moins 4 caractères.' };
    }
    // Vérifier si l'utilisateur existe déjà
    if (userExists(username)) {
        return { success: false, message: 'Ce pseudo est déjà pris !' };
    }
    // Créer le nouveau joueur
    const passwordHash = hashPassword(password);
    const player = createNewPlayer(username, passwordHash);
    // Donner 3 cartes de départ aléatoires
    const starterCards = generateStarterPack();
    player.deck = starterCards;
    player.collection = [...new Set(starterCards.map(c => c.countryCode))];
    // Sauvegarder
    savePlayer(player);
    setCurrentUsername(username);
    return { success: true, message: 'Compte créé avec succès ! Bienvenue !' };
}
/**
 * Connexion d'un joueur existant
 */
function login(username, password) {
    username = username.trim();
    if (!username || !password) {
        return { success: false, message: 'Veuillez remplir tous les champs.' };
    }
    const player = getUser(username);
    if (!player) {
        return { success: false, message: 'Utilisateur non trouvé.' };
    }
    if (!verifyPassword(password, player.passwordHash)) {
        return { success: false, message: 'Mot de passe incorrect.' };
    }
    // Connexion réussie
    setCurrentUsername(username);
    return { success: true, message: `Bon retour, ${username} !` };
}
/**
 * Déconnexion du joueur actuel
 */
function logout() {
    setCurrentUsername(null);
    showToast('Déconnexion réussie !', 'info');
    navigateTo('login');
}
/**
 * Vérifie si un joueur est connecté
 */
function isLoggedIn() {
    return getCurrentUsername() !== null && loadPlayer() !== null;
}
/**
 * Génère un pack de départ (3 cartes communes)
 */
function generateStarterPack() {
    const cards = [];
    const commonCountries = COUNTRIES.filter(c => c.rarityBase === 'Common');
    // Mélanger et prendre 3 pays différents
    const shuffled = [...commonCountries].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    for (const country of selected) {
        cards.push(createCard(country, 'Common'));
    }
    return cards;
}
/**
 * Crée une instance de carte
 */
function createCard(country, rarity) {
    const level = 1;
    const lovePower = calculateLovePower(rarity, level);
    return {
        id: generateId(),
        countryCode: country.code,
        countryName: country.nameFR,
        continent: country.continent,
        rarity,
        level,
        lovePower,
        flag: country.flag,
        obtainedAt: Date.now(),
    };
}
/**
 * Calcule la Love Power d'une carte
 */
function calculateLovePower(rarity, level) {
    const baseValues = {
        'Common': 10,
        'Rare': 25,
        'Epic': 50,
        'Legendary': 100,
    };
    const base = baseValues[rarity];
    const multiplier = 1 + (level - 1) * 0.5; // +50% par niveau
    return Math.floor(base * multiplier);
}
/**
 * World of Love — Card Game
 * Module de logique de jeu
 *
 * Gère :
 * - Ouverture de packs (Basic, Premium)
 * - Probabilités de rareté
 * - Fusion de cartes
 * - Missions quotidiennes
 * - Daily reward
 * - Mini-jeu "Love Match"
 */
// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════
const PACK_BASIC_COST = 100; // Coût en coins
const PACK_BASIC_CARDS = 3; // Nombre de cartes
const PACK_PREMIUM_COST = 30; // Coût en gems
const PACK_PREMIUM_CARDS = 5; // Nombre de cartes
const LOVE_MATCH_COOLDOWN = 30000; // 30 secondes
const LOVE_MATCH_REWARD_COINS = 25;
const LOVE_MATCH_REWARD_XP = 15;
const LOVE_MATCH_PENALTY = 5;
// Probabilités des raretés (en pourcentage)
const RARITY_PROBS_BASIC = {
    'Common': 75,
    'Rare': 20,
    'Epic': 4,
    'Legendary': 1,
};
const RARITY_PROBS_PREMIUM = {
    'Common': 55,
    'Rare': 30,
    'Epic': 12,
    'Legendary': 3,
};
const XP_PER_LEVEL_BASE = 100;
const XP_LEVEL_MULTIPLIER = 1.5;
/**
 * Ouvre un pack et retourne les cartes obtenues
 */
function openPack(packType) {
    const player = loadPlayer();
    if (!player) {
        return { success: false, message: 'Non connecté !', cards: [] };
    }
    // Vérifier les ressources
    if (packType === 'basic') {
        if (player.coins < PACK_BASIC_COST) {
            return { success: false, message: `Pas assez de coins ! (${PACK_BASIC_COST} requis)`, cards: [] };
        }
        player.coins -= PACK_BASIC_COST;
    }
    else {
        if (player.gems < PACK_PREMIUM_COST) {
            return { success: false, message: `Pas assez de gems ! (${PACK_PREMIUM_COST} requis)`, cards: [] };
        }
        player.gems -= PACK_PREMIUM_COST;
    }
    // Générer les cartes
    const numCards = packType === 'basic' ? PACK_BASIC_CARDS : PACK_PREMIUM_CARDS;
    const probs = packType === 'basic' ? RARITY_PROBS_BASIC : RARITY_PROBS_PREMIUM;
    const cards = [];
    for (let i = 0; i < numCards; i++) {
        const card = generateRandomCard(probs);
        cards.push(card);
        player.deck.push(card);
        // Ajouter à la collection si nouveau
        if (!player.collection.includes(card.countryCode)) {
            player.collection.push(card.countryCode);
        }
    }
    // Statistiques
    player.stats.packsOpened++;
    // Mission "ouvrir pack"
    updateMissionProgress(player, 'open_pack', 1);
    // Mission "obtenir rare+"
    const hasRarePlus = cards.some(c => c.rarity !== 'Common');
    if (hasRarePlus) {
        updateMissionProgress(player, 'get_rare', 1);
    }
    // XP pour ouverture de pack
    addXp(player, 10);
    savePlayer(player);
    return {
        success: true,
        message: `Pack ${packType === 'basic' ? 'Basic' : 'Premium'} ouvert !`,
        cards
    };
}
/**
 * Génère une carte aléatoire selon les probabilités
 */
function generateRandomCard(probs) {
    // Tirer la rareté
    const rarity = rollRarity(probs);
    // Choisir un pays de cette rareté (ou proche)
    const country = pickRandomCountry(rarity);
    return createCard(country, rarity);
}
/**
 * Tire une rareté selon les probabilités
 */
function rollRarity(probs) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarity, prob] of Object.entries(probs)) {
        cumulative += prob;
        if (roll < cumulative) {
            return rarity;
        }
    }
    return 'Common'; // Fallback
}
/**
 * Choisit un pays aléatoire, favorisant ceux de la rareté indiquée
 */
function pickRandomCountry(preferredRarity) {
    // 70% de chance de prendre un pays de la rareté exacte
    if (Math.random() < 0.7) {
        const matching = COUNTRIES.filter(c => c.rarityBase === preferredRarity);
        if (matching.length > 0) {
            return matching[Math.floor(Math.random() * matching.length)];
        }
    }
    // Sinon, n'importe quel pays
    return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}
/**
 * Fusionne deux cartes identiques pour augmenter le niveau
 */
function fuseCards(cardId1, cardId2) {
    const player = loadPlayer();
    if (!player) {
        return { success: false, message: 'Non connecté !', silent: true };
    }
    const card1 = player.deck.find(c => c.id === cardId1);
    const card2 = player.deck.find(c => c.id === cardId2);
    // Erreur silencieuse : les cartes peuvent ne plus exister après un re-rendu
    if (!card1 || !card2) {
        return { success: false, message: 'Cartes non trouvées !', silent: true };
    }
    if (card1.countryCode !== card2.countryCode) {
        return { success: false, message: 'Les cartes doivent être du même pays !' };
    }
    if (card1.id === card2.id) {
        return { success: false, message: 'Sélectionnez deux cartes différentes !' };
    }
    // Garder la carte avec le plus haut niveau
    const baseCard = card1.level >= card2.level ? card1 : card2;
    const sacrificeCard = baseCard === card1 ? card2 : card1;
    if (baseCard.level >= 5) {
        return { success: false, message: 'Niveau maximum (5) déjà atteint !' };
    }
    // Augmenter le niveau
    baseCard.level++;
    baseCard.lovePower = calculateLovePower(baseCard.rarity, baseCard.level);
    // Retirer la carte sacrifiée
    const sacrificeIndex = player.deck.findIndex(c => c.id === sacrificeCard.id);
    if (sacrificeIndex !== -1) {
        player.deck.splice(sacrificeIndex, 1);
    }
    // Retirer des favoris si nécessaire
    player.favorites = player.favorites.filter(id => id !== sacrificeCard.id);
    // Statistiques
    player.stats.cardsFused++;
    // Mission "fusionner"
    updateMissionProgress(player, 'fuse_card', 1);
    // XP bonus
    addXp(player, 20);
    savePlayer(player);
    return {
        success: true,
        message: `Fusion réussie ! ${baseCard.countryName} passe au niveau ${baseCard.level} !`,
        resultCard: baseCard
    };
}
/**
 * Trouve les paires de cartes fusionnables
 */
function findFusablePairs(player) {
    const pairs = [];
    const processed = new Set();
    for (const card1 of player.deck) {
        if (card1.level >= 5)
            continue; // Déjà max
        if (processed.has(card1.id))
            continue;
        for (const card2 of player.deck) {
            if (card1.id === card2.id)
                continue;
            if (processed.has(card2.id))
                continue;
            if (card1.countryCode !== card2.countryCode)
                continue;
            pairs.push({ card1, card2 });
            processed.add(card1.id);
            processed.add(card2.id);
            break;
        }
    }
    return pairs;
}
// ═══════════════════════════════════════════════════════════════════════════
// MISSIONS QUOTIDIENNES
// ═══════════════════════════════════════════════════════════════════════════
const MISSION_TEMPLATES = [
    { type: 'open_pack', description: 'Ouvrir 1 pack', target: 1, rewardCoins: 50, rewardXp: 20 },
    { type: 'open_pack', description: 'Ouvrir 2 packs', target: 2, rewardCoins: 100, rewardXp: 40 },
    { type: 'fuse_card', description: 'Fusionner 1 carte', target: 1, rewardCoins: 75, rewardXp: 30 },
    { type: 'get_rare', description: 'Obtenir une carte Rare+', target: 1, rewardCoins: 60, rewardXp: 25 },
    { type: 'play_game', description: 'Jouer 2 parties de Love Match', target: 2, rewardCoins: 40, rewardXp: 20 },
    { type: 'play_game', description: 'Gagner 1 partie de Love Match', target: 1, rewardCoins: 80, rewardXp: 35 },
    { type: 'collect', description: 'Collecter 3 nouveaux pays', target: 3, rewardCoins: 100, rewardXp: 50 },
];
/**
 * Génère les missions quotidiennes si nécessaire
 */
function checkAndGenerateDailyMissions(player) {
    const today = getTodayDateString();
    if (player.lastMissionsDate !== today) {
        player.dailyMissions = generateDailyMissions();
        player.lastMissionsDate = today;
        savePlayer(player);
    }
}
/**
 * Génère 3 missions quotidiennes aléatoires
 */
function generateDailyMissions() {
    const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return selected.map((template, index) => ({
        ...template,
        id: `mission_${Date.now()}_${index}`,
        progress: 0,
        completed: false,
    }));
}
/**
 * Met à jour la progression d'une mission
 */
function updateMissionProgress(player, type, amount) {
    for (const mission of player.dailyMissions) {
        if (mission.type === type && !mission.completed) {
            mission.progress = Math.min(mission.progress + amount, mission.target);
            if (mission.progress >= mission.target) {
                mission.completed = true;
                // Ne pas donner la récompense automatiquement, le joueur doit la réclamer
            }
        }
    }
}
/**
 * Réclame la récompense d'une mission complétée
 */
function claimMissionReward(missionId) {
    const player = loadPlayer();
    if (!player) {
        return { success: false, message: 'Non connecté !' };
    }
    const mission = player.dailyMissions.find(m => m.id === missionId);
    if (!mission) {
        return { success: false, message: 'Mission non trouvée !' };
    }
    if (!mission.completed) {
        return { success: false, message: 'Mission non complétée !' };
    }
    // Vérifier si déjà réclamée (on utilise un flag négatif sur progress)
    if (mission.progress < 0) {
        return { success: false, message: 'Récompense déjà réclamée !' };
    }
    // Donner les récompenses
    player.coins += mission.rewardCoins;
    addXp(player, mission.rewardXp);
    // Marquer comme réclamée
    mission.progress = -1;
    savePlayer(player);
    return {
        success: true,
        message: `+${mission.rewardCoins} coins, +${mission.rewardXp} XP !`
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// RÉCOMPENSE QUOTIDIENNE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Réclame la récompense quotidienne
 */
function claimDailyReward() {
    const player = loadPlayer();
    if (!player) {
        return { success: false, message: 'Non connecté !' };
    }
    const today = getTodayDateString();
    if (player.lastDailyRewardDate === today) {
        return { success: false, message: 'Récompense déjà réclamée aujourd\'hui !' };
    }
    // Calculer la récompense (bonus selon le niveau)
    const reward = {
        coins: 50 + (player.level * 10),
        gems: Math.floor(player.level / 5) + 1,
    };
    player.coins += reward.coins;
    player.gems += reward.gems;
    player.lastDailyRewardDate = today;
    addXp(player, 15);
    savePlayer(player);
    return {
        success: true,
        message: `Récompense quotidienne ! +${reward.coins} coins, +${reward.gems} gems !`,
        reward
    };
}
/**
 * Vérifie si la récompense quotidienne est disponible
 */
function isDailyRewardAvailable() {
    const player = loadPlayer();
    if (!player)
        return false;
    return player.lastDailyRewardDate !== getTodayDateString();
}
let currentLoveMatch = null;
/**
 * Vérifie si Love Match est disponible (cooldown)
 */
function isLoveMatchAvailable() {
    const player = loadPlayer();
    if (!player)
        return { available: false, remainingMs: 0 };
    const elapsed = Date.now() - player.lastLoveMatchTime;
    const remaining = LOVE_MATCH_COOLDOWN - elapsed;
    return {
        available: remaining <= 0,
        remainingMs: Math.max(0, remaining),
    };
}
/**
 * Démarre une partie de Love Match
 */
function startLoveMatch() {
    const player = loadPlayer();
    if (!player) {
        return { success: false, message: 'Non connecté !' };
    }
    const availability = isLoveMatchAvailable();
    if (!availability.available) {
        const seconds = Math.ceil(availability.remainingMs / 1000);
        return { success: false, message: `Attendez encore ${seconds}s avant de rejouer !` };
    }
    // Générer 5 cartes aléatoires
    const cards = [];
    for (let i = 0; i < 5; i++) {
        const rarity = rollRarity(RARITY_PROBS_BASIC);
        const country = pickRandomCountry(rarity);
        cards.push(createCard(country, rarity));
    }
    // Trouver celle avec la meilleure Love Power
    let maxPower = 0;
    let correctIndex = 0;
    cards.forEach((card, index) => {
        if (card.lovePower > maxPower) {
            maxPower = card.lovePower;
            correctIndex = index;
        }
    });
    currentLoveMatch = {
        cards,
        correctIndex,
        isActive: true,
    };
    return {
        success: true,
        message: 'Trouvez la carte avec la meilleure Love Power !',
        game: currentLoveMatch
    };
}
/**
 * Soumet une réponse au Love Match
 */
function submitLoveMatchAnswer(chosenIndex) {
    const player = loadPlayer();
    if (!player || !currentLoveMatch || !currentLoveMatch.isActive) {
        return { success: false, correct: false, message: 'Aucune partie en cours !' };
    }
    const correct = chosenIndex === currentLoveMatch.correctIndex;
    currentLoveMatch.isActive = false;
    // Mettre à jour le cooldown
    player.lastLoveMatchTime = Date.now();
    player.stats.gamesPlayed++;
    if (correct) {
        player.coins += LOVE_MATCH_REWARD_COINS;
        player.stats.gamesWon++;
        addXp(player, LOVE_MATCH_REWARD_XP);
        updateMissionProgress(player, 'play_game', 1);
        savePlayer(player);
        return {
            success: true,
            correct: true,
            message: `Bravo ! +${LOVE_MATCH_REWARD_COINS} coins, +${LOVE_MATCH_REWARD_XP} XP !`,
            correctCard: currentLoveMatch.cards[currentLoveMatch.correctIndex]
        };
    }
    else {
        player.coins = Math.max(0, player.coins - LOVE_MATCH_PENALTY);
        savePlayer(player);
        return {
            success: true,
            correct: false,
            message: `Dommage ! -${LOVE_MATCH_PENALTY} coins.`,
            correctCard: currentLoveMatch.cards[currentLoveMatch.correctIndex]
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// SYSTÈME D'XP ET NIVEAU
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Ajoute de l'XP au joueur et gère le level up
 */
function addXp(player, amount) {
    player.xp += amount;
    let leveledUp = false;
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_MULTIPLIER, player.level - 1));
        leveledUp = true;
        // Bonus de level up
        player.coins += 100 * player.level;
        player.gems += Math.floor(player.level / 2);
    }
    return leveledUp;
}
// ═══════════════════════════════════════════════════════════════════════════
// FAVORIS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Toggle le statut favori d'une carte
 */
function toggleFavorite(cardId) {
    const player = loadPlayer();
    if (!player)
        return false;
    const index = player.favorites.indexOf(cardId);
    if (index === -1) {
        player.favorites.push(cardId);
    }
    else {
        player.favorites.splice(index, 1);
    }
    savePlayer(player);
    return index === -1; // Retourne true si ajouté aux favoris
}
/**
 * Vérifie si une carte est en favoris
 */
function isFavorite(cardId) {
    const player = loadPlayer();
    if (!player)
        return false;
    return player.favorites.includes(cardId);
}
/**
 * i18n - Internationalization module for World of Love
 *
 * Features:
 * - 25 languages supported
 * - No fetch() or dynamic imports (Safari iOS compatible)
 * - Offline-first with localStorage persistence
 * - Automatic RTL support for Arabic
 *
 * Compatible avec tsconfig "module": "None" + outFile
 */
// ============================================================================
// TRANSLATIONS - Toutes les langues embarquées statiquement
// ============================================================================
const I18N_TRANSLATIONS = {
    fr: {
        welcome: "Bienvenue",
        collect: "Collecter",
        cards: "Cartes",
        collection: "Collection",
        level: "Niveau",
        dailyReward: "Récompense quotidienne",
        openPack: "Ouvrir un paquet",
        loveMatch: "Match d'amour",
        shop: "Boutique",
        missions: "Missions",
        profile: "Profil",
        save: "Sauvegarder",
        export: "Exporter",
        import: "Importer",
        languageChanged: "Langue modifiée",
        logout: "Déconnexion"
    },
    en: {
        welcome: "Welcome",
        collect: "Collect",
        cards: "Cards",
        collection: "Collection",
        level: "Level",
        dailyReward: "Daily Reward",
        openPack: "Open Pack",
        loveMatch: "Love Match",
        shop: "Shop",
        missions: "Missions",
        profile: "Profile",
        save: "Save",
        export: "Export",
        import: "Import",
        languageChanged: "Language changed",
        logout: "Logout"
    },
    es: {
        welcome: "Bienvenido",
        collect: "Coleccionar",
        cards: "Cartas",
        collection: "Colección",
        level: "Nivel",
        dailyReward: "Recompensa diaria",
        openPack: "Abrir paquete",
        loveMatch: "Match de amor",
        shop: "Tienda",
        missions: "Misiones",
        profile: "Perfil",
        save: "Guardar",
        export: "Exportar",
        import: "Importar",
        languageChanged: "Idioma cambiado",
        logout: "Cerrar sesión"
    },
    de: {
        welcome: "Willkommen",
        collect: "Sammeln",
        cards: "Karten",
        collection: "Sammlung",
        level: "Stufe",
        dailyReward: "Tägliche Belohnung",
        openPack: "Paket öffnen",
        loveMatch: "Liebes-Match",
        shop: "Laden",
        missions: "Missionen",
        profile: "Profil",
        save: "Speichern",
        export: "Exportieren",
        import: "Importieren",
        languageChanged: "Sprache geändert",
        logout: "Abmelden"
    },
    it: {
        welcome: "Benvenuto",
        collect: "Colleziona",
        cards: "Carte",
        collection: "Collezione",
        level: "Livello",
        dailyReward: "Premio giornaliero",
        openPack: "Apri pacchetto",
        loveMatch: "Match d'amore",
        shop: "Negozio",
        missions: "Missioni",
        profile: "Profilo",
        save: "Salva",
        export: "Esporta",
        import: "Importa",
        languageChanged: "Lingua cambiata",
        logout: "Esci"
    },
    pt: {
        welcome: "Bem-vindo",
        collect: "Coletar",
        cards: "Cartas",
        collection: "Coleção",
        level: "Nível",
        dailyReward: "Recompensa diária",
        openPack: "Abrir pacote",
        loveMatch: "Match de amor",
        shop: "Loja",
        missions: "Missões",
        profile: "Perfil",
        save: "Salvar",
        export: "Exportar",
        import: "Importar",
        languageChanged: "Idioma alterado",
        logout: "Sair"
    },
    nl: {
        welcome: "Welkom",
        collect: "Verzamelen",
        cards: "Kaarten",
        collection: "Collectie",
        level: "Niveau",
        dailyReward: "Dagelijkse beloning",
        openPack: "Pakket openen",
        loveMatch: "Liefdes-match",
        shop: "Winkel",
        missions: "Missies",
        profile: "Profiel",
        save: "Opslaan",
        export: "Exporteren",
        import: "Importeren",
        languageChanged: "Taal gewijzigd",
        logout: "Uitloggen"
    },
    ru: {
        welcome: "Добро пожаловать",
        collect: "Собрать",
        cards: "Карты",
        collection: "Коллекция",
        level: "Уровень",
        dailyReward: "Ежедневная награда",
        openPack: "Открыть набор",
        loveMatch: "Любовный матч",
        shop: "Магазин",
        missions: "Миссии",
        profile: "Профиль",
        save: "Сохранить",
        export: "Экспорт",
        import: "Импорт",
        languageChanged: "Язык изменён",
        logout: "Выйти"
    },
    uk: {
        welcome: "Ласкаво просимо",
        collect: "Зібрати",
        cards: "Карти",
        collection: "Колекція",
        level: "Рівень",
        dailyReward: "Щоденна нагорода",
        openPack: "Відкрити набір",
        loveMatch: "Любовний матч",
        shop: "Магазин",
        missions: "Місії",
        profile: "Профіль",
        save: "Зберегти",
        export: "Експорт",
        import: "Імпорт",
        languageChanged: "Мову змінено",
        logout: "Вийти"
    },
    pl: {
        welcome: "Witaj",
        collect: "Zbieraj",
        cards: "Karty",
        collection: "Kolekcja",
        level: "Poziom",
        dailyReward: "Codzienna nagroda",
        openPack: "Otwórz paczkę",
        loveMatch: "Miłosny mecz",
        shop: "Sklep",
        missions: "Misje",
        profile: "Profil",
        save: "Zapisz",
        export: "Eksportuj",
        import: "Importuj",
        languageChanged: "Język zmieniony",
        logout: "Wyloguj"
    },
    tr: {
        welcome: "Hoş geldiniz",
        collect: "Topla",
        cards: "Kartlar",
        collection: "Koleksiyon",
        level: "Seviye",
        dailyReward: "Günlük ödül",
        openPack: "Paket aç",
        loveMatch: "Aşk eşleşmesi",
        shop: "Mağaza",
        missions: "Görevler",
        profile: "Profil",
        save: "Kaydet",
        export: "Dışa aktar",
        import: "İçe aktar",
        languageChanged: "Dil değiştirildi",
        logout: "Çıkış"
    },
    ar: {
        welcome: "مرحباً",
        collect: "جمع",
        cards: "بطاقات",
        collection: "مجموعة",
        level: "المستوى",
        dailyReward: "المكافأة اليومية",
        openPack: "افتح الحزمة",
        loveMatch: "مباراة الحب",
        shop: "متجر",
        missions: "المهام",
        profile: "الملف الشخصي",
        save: "حفظ",
        export: "تصدير",
        import: "استيراد",
        languageChanged: "تم تغيير اللغة",
        logout: "تسجيل الخروج"
    },
    ja: {
        welcome: "ようこそ",
        collect: "集める",
        cards: "カード",
        collection: "コレクション",
        level: "レベル",
        dailyReward: "デイリー報酬",
        openPack: "パックを開く",
        loveMatch: "ラブマッチ",
        shop: "ショップ",
        missions: "ミッション",
        profile: "プロフィール",
        save: "保存",
        export: "エクスポート",
        import: "インポート",
        languageChanged: "言語が変更されました",
        logout: "ログアウト"
    },
    zh: {
        welcome: "欢迎",
        collect: "收集",
        cards: "卡牌",
        collection: "收藏",
        level: "等级",
        dailyReward: "每日奖励",
        openPack: "开启卡包",
        loveMatch: "爱情配对",
        shop: "商店",
        missions: "任务",
        profile: "个人资料",
        save: "保存",
        export: "导出",
        import: "导入",
        languageChanged: "语言已更改",
        logout: "退出登录"
    },
    ko: {
        welcome: "환영합니다",
        collect: "수집",
        cards: "카드",
        collection: "컬렉션",
        level: "레벨",
        dailyReward: "일일 보상",
        openPack: "팩 열기",
        loveMatch: "러브 매치",
        shop: "상점",
        missions: "미션",
        profile: "프로필",
        save: "저장",
        export: "내보내기",
        import: "가져오기",
        languageChanged: "언어가 변경되었습니다",
        logout: "로그아웃"
    },
    hi: {
        welcome: "स्वागत है",
        collect: "इकट्ठा करें",
        cards: "कार्ड",
        collection: "संग्रह",
        level: "स्तर",
        dailyReward: "दैनिक पुरस्कार",
        openPack: "पैक खोलें",
        loveMatch: "प्रेम मैच",
        shop: "दुकान",
        missions: "मिशन",
        profile: "प्रोफ़ाइल",
        save: "सहेजें",
        export: "निर्यात",
        import: "आयात",
        languageChanged: "भाषा बदल गई",
        logout: "लॉग आउट"
    },
    id: {
        welcome: "Selamat datang",
        collect: "Kumpulkan",
        cards: "Kartu",
        collection: "Koleksi",
        level: "Level",
        dailyReward: "Hadiah harian",
        openPack: "Buka paket",
        loveMatch: "Pertandingan cinta",
        shop: "Toko",
        missions: "Misi",
        profile: "Profil",
        save: "Simpan",
        export: "Ekspor",
        import: "Impor",
        languageChanged: "Bahasa diubah",
        logout: "Keluar"
    },
    th: {
        welcome: "ยินดีต้อนรับ",
        collect: "สะสม",
        cards: "การ์ด",
        collection: "คอลเลกชัน",
        level: "ระดับ",
        dailyReward: "รางวัลประจำวัน",
        openPack: "เปิดแพ็ค",
        loveMatch: "เกมจับคู่รัก",
        shop: "ร้านค้า",
        missions: "ภารกิจ",
        profile: "โปรไฟล์",
        save: "บันทึก",
        export: "ส่งออก",
        import: "นำเข้า",
        languageChanged: "เปลี่ยนภาษาแล้ว",
        logout: "ออกจากระบบ"
    },
    vi: {
        welcome: "Chào mừng",
        collect: "Thu thập",
        cards: "Thẻ bài",
        collection: "Bộ sưu tập",
        level: "Cấp độ",
        dailyReward: "Phần thưởng hàng ngày",
        openPack: "Mở gói",
        loveMatch: "Ghép đôi tình yêu",
        shop: "Cửa hàng",
        missions: "Nhiệm vụ",
        profile: "Hồ sơ",
        save: "Lưu",
        export: "Xuất",
        import: "Nhập",
        languageChanged: "Đã thay đổi ngôn ngữ",
        logout: "Đăng xuất"
    },
    sv: {
        welcome: "Välkommen",
        collect: "Samla",
        cards: "Kort",
        collection: "Samling",
        level: "Nivå",
        dailyReward: "Daglig belöning",
        openPack: "Öppna paket",
        loveMatch: "Kärleksmatch",
        shop: "Butik",
        missions: "Uppdrag",
        profile: "Profil",
        save: "Spara",
        export: "Exportera",
        import: "Importera",
        languageChanged: "Språk ändrat",
        logout: "Logga ut"
    },
    no: {
        welcome: "Velkommen",
        collect: "Samle",
        cards: "Kort",
        collection: "Samling",
        level: "Nivå",
        dailyReward: "Daglig belønning",
        openPack: "Åpne pakke",
        loveMatch: "Kjærlighetsmatch",
        shop: "Butikk",
        missions: "Oppdrag",
        profile: "Profil",
        save: "Lagre",
        export: "Eksporter",
        import: "Importer",
        languageChanged: "Språk endret",
        logout: "Logg ut"
    },
    da: {
        welcome: "Velkommen",
        collect: "Saml",
        cards: "Kort",
        collection: "Samling",
        level: "Niveau",
        dailyReward: "Daglig belønning",
        openPack: "Åbn pakke",
        loveMatch: "Kærlighedsmatch",
        shop: "Butik",
        missions: "Missioner",
        profile: "Profil",
        save: "Gem",
        export: "Eksporter",
        import: "Importer",
        languageChanged: "Sprog ændret",
        logout: "Log ud"
    },
    fi: {
        welcome: "Tervetuloa",
        collect: "Kerää",
        cards: "Kortit",
        collection: "Kokoelma",
        level: "Taso",
        dailyReward: "Päivittäinen palkinto",
        openPack: "Avaa paketti",
        loveMatch: "Rakkausottelu",
        shop: "Kauppa",
        missions: "Tehtävät",
        profile: "Profiili",
        save: "Tallenna",
        export: "Vie",
        import: "Tuo",
        languageChanged: "Kieli vaihdettu",
        logout: "Kirjaudu ulos"
    },
    el: {
        welcome: "Καλώς ήρθατε",
        collect: "Συλλογή",
        cards: "Κάρτες",
        collection: "Συλλογή",
        level: "Επίπεδο",
        dailyReward: "Ημερήσια ανταμοιβή",
        openPack: "Άνοιγμα πακέτου",
        loveMatch: "Αγώνας αγάπης",
        shop: "Κατάστημα",
        missions: "Αποστολές",
        profile: "Προφίλ",
        save: "Αποθήκευση",
        export: "Εξαγωγή",
        import: "Εισαγωγή",
        languageChanged: "Η γλώσσα άλλαξε",
        logout: "Αποσύνδεση"
    },
    ro: {
        welcome: "Bine ați venit",
        collect: "Colectează",
        cards: "Cărți",
        collection: "Colecție",
        level: "Nivel",
        dailyReward: "Recompensă zilnică",
        openPack: "Deschide pachet",
        loveMatch: "Potrivire de dragoste",
        shop: "Magazin",
        missions: "Misiuni",
        profile: "Profil",
        save: "Salvează",
        export: "Exportă",
        import: "Importă",
        languageChanged: "Limba a fost schimbată",
        logout: "Deconectare"
    }
};
// ============================================================================
// LANGUAGE METADATA
// ============================================================================
const I18N_LANG_META = {
    fr: { name: 'Français', nameEn: 'French', rtl: false },
    en: { name: 'English', nameEn: 'English', rtl: false },
    es: { name: 'Español', nameEn: 'Spanish', rtl: false },
    de: { name: 'Deutsch', nameEn: 'German', rtl: false },
    it: { name: 'Italiano', nameEn: 'Italian', rtl: false },
    pt: { name: 'Português', nameEn: 'Portuguese', rtl: false },
    nl: { name: 'Nederlands', nameEn: 'Dutch', rtl: false },
    ru: { name: 'Русский', nameEn: 'Russian', rtl: false },
    uk: { name: 'Українська', nameEn: 'Ukrainian', rtl: false },
    pl: { name: 'Polski', nameEn: 'Polish', rtl: false },
    tr: { name: 'Türkçe', nameEn: 'Turkish', rtl: false },
    ar: { name: 'العربية', nameEn: 'Arabic', rtl: true },
    ja: { name: '日本語', nameEn: 'Japanese', rtl: false },
    zh: { name: '中文', nameEn: 'Chinese', rtl: false },
    ko: { name: '한국어', nameEn: 'Korean', rtl: false },
    hi: { name: 'हिन्दी', nameEn: 'Hindi', rtl: false },
    id: { name: 'Bahasa Indonesia', nameEn: 'Indonesian', rtl: false },
    th: { name: 'ไทย', nameEn: 'Thai', rtl: false },
    vi: { name: 'Tiếng Việt', nameEn: 'Vietnamese', rtl: false },
    sv: { name: 'Svenska', nameEn: 'Swedish', rtl: false },
    no: { name: 'Norsk', nameEn: 'Norwegian', rtl: false },
    da: { name: 'Dansk', nameEn: 'Danish', rtl: false },
    fi: { name: 'Suomi', nameEn: 'Finnish', rtl: false },
    el: { name: 'Ελληνικά', nameEn: 'Greek', rtl: false },
    ro: { name: 'Română', nameEn: 'Romanian', rtl: false }
};
// ============================================================================
// STATE
// ============================================================================
const I18N_STORAGE_KEY = 'wol_lang';
const I18N_DEFAULT_LANG = 'fr';
let i18nCurrentLang = I18N_DEFAULT_LANG;
// ============================================================================
// INTERNAL FUNCTIONS
// ============================================================================
/**
 * Check if a string is a valid language code
 */
function i18nIsValidLang(code) {
    return code in I18N_TRANSLATIONS;
}
/**
 * Apply text direction (LTR/RTL) to document
 */
function i18nApplyDirection() {
    const meta = I18N_LANG_META[i18nCurrentLang];
    if (meta) {
        document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = i18nCurrentLang;
    }
}
/**
 * Initialize i18n system
 */
function i18nInit() {
    // Try to load from localStorage
    try {
        const saved = localStorage.getItem(I18N_STORAGE_KEY);
        if (saved && i18nIsValidLang(saved)) {
            i18nCurrentLang = saved;
        }
        else {
            // Try browser language
            const browserLang = navigator.language.split('-')[0];
            if (i18nIsValidLang(browserLang)) {
                i18nCurrentLang = browserLang;
            }
        }
    }
    catch (e) {
        // localStorage unavailable, use default
    }
    // Apply RTL if needed
    i18nApplyDirection();
}
// ============================================================================
// PUBLIC API (Global Functions)
// ============================================================================
/**
 * Get translation for a key
 * @param key - Translation key
 * @returns Translated string, or key if not found
 */
function t(key) {
    const translations = I18N_TRANSLATIONS[i18nCurrentLang];
    if (translations && key in translations) {
        return translations[key];
    }
    // Fallback to English
    if (i18nCurrentLang !== 'en' && I18N_TRANSLATIONS.en && key in I18N_TRANSLATIONS.en) {
        return I18N_TRANSLATIONS.en[key];
    }
    // Return key as last resort
    return key;
}
/**
 * Set the current language
 * @param lang - Language code to switch to
 * @returns true if language was changed, false if invalid
 */
function setLang(lang) {
    if (!i18nIsValidLang(lang)) {
        console.warn(`[i18n] Invalid language code: ${lang}`);
        return false;
    }
    i18nCurrentLang = lang;
    // Persist to localStorage
    try {
        localStorage.setItem(I18N_STORAGE_KEY, i18nCurrentLang);
    }
    catch (e) {
        console.warn('[i18n] localStorage unavailable');
    }
    // Apply RTL if needed
    i18nApplyDirection();
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('langchange', {
        detail: { lang: i18nCurrentLang }
    }));
    return true;
}
/**
 * Get current language code
 */
function getLang() {
    return i18nCurrentLang;
}
/**
 * Get list of all available language codes
 */
function getAvailableLangs() {
    return Object.keys(I18N_TRANSLATIONS);
}
/**
 * Get metadata for a language
 */
function getLangMeta(lang) {
    return I18N_LANG_META[lang] || null;
}
/**
 * Check if current language is RTL
 */
function isRtl() {
    const meta = I18N_LANG_META[i18nCurrentLang];
    return meta ? meta.rtl : false;
}
// ============================================================================
// AUTO-INIT on script load
// ============================================================================
i18nInit();
/**
 * World of Love — Card Game
 * Point d'entrée principal
 *
 * Initialise l'application au chargement de la page.
 */
// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Point d'entrée de l'application
 */
function initApp() {
    console.log('🌍 World of Love — Card Game');
    console.log('💕 Initialisation...');
    console.log(`🌐 Langue: ${getLang()} (${getLangMeta(getLang())?.name})`);
    // Initialiser l'interface utilisateur
    initUI();
    // Signaler que l'app est chargée (pour iOS error handler)
    if (typeof window.__markAppLoaded === 'function') {
        window.__markAppLoaded();
    }
    console.log('✅ Application prête !');
}
// Lancer l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', initApp);
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
// STOCKAGE LOCAL
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Récupère tous les utilisateurs stockés
 */
function getAllUsers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_USERS);
        return data ? JSON.parse(data) : {};
    }
    catch (e) {
        console.error('Erreur lecture users:', e);
        return {};
    }
}
/**
 * Sauvegarde tous les utilisateurs
 */
function saveAllUsers(users) {
    try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
    catch (e) {
        console.error('Erreur sauvegarde users:', e);
    }
}
/**
 * Récupère le nom d'utilisateur actuel
 */
function getCurrentUsername() {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER);
}
/**
 * Définit l'utilisateur actuel
 */
function setCurrentUsername(username) {
    if (username) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, username);
    }
    else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
}
/**
 * Charge le profil du joueur actuel
 */
function loadPlayer() {
    const username = getCurrentUsername();
    if (!username)
        return null;
    const users = getAllUsers();
    return users[username] || null;
}
/**
 * Sauvegarde le profil joueur
 */
function savePlayer(player) {
    const users = getAllUsers();
    users[player.username] = player;
    saveAllUsers(users);
}
/**
 * Vérifie si un utilisateur existe
 */
function userExists(username) {
    const users = getAllUsers();
    return !!users[username];
}
/**
 * Récupère un utilisateur par nom
 */
function getUser(username) {
    const users = getAllUsers();
    return users[username] || null;
}
// ═══════════════════════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Exporte la sauvegarde du joueur actuel en JSON
 */
function exportSave() {
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
function importSave(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result);
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
                const updatedPlayer = {
                    ...data,
                    username: currentPlayer.username, // Garder le nom actuel
                    passwordHash: currentPlayer.passwordHash, // Garder le mot de passe
                };
                savePlayer(updatedPlayer);
                showToast('Sauvegarde importée avec succès !', 'success');
                resolve(true);
            }
            catch (err) {
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
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
/**
 * Obtient la date du jour au format YYYY-MM-DD
 */
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}
/**
 * World of Love — Card Game
 * Module d'interface utilisateur
 *
 * Gère :
 * - Routage (hash)
 * - Rendu des pages
 * - Modals
 * - Toasts
 * - Événements
 */
const uiState = {
    currentPage: 'login',
    searchQuery: '',
    filterContinent: 'all',
    filterRarity: 'all',
    filterFavorites: false,
    selectedCards: [],
    packOpening: false,
    packCards: [],
    loveMatchGame: null,
};
// Langue actuelle (gérée par i18n.ts)
// Note: Les fonctions t(), setLang(), getLang() sont définies globalement dans i18n.ts
// Protection anti-double clic pour les fusions
let fusionInProgress = false;
// (L'ancien système de traduction FR/EN a été remplacé par i18n.ts avec 25 langues)
// ═══════════════════════════════════════════════════════════════════════════
// DRAPEAUX SVG — Gestion des images de drapeaux
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Placeholder SVG inline — affiché si le drapeau n'existe pas
 * Design : globe gris neutre avec symbole "?"
 */
const FLAG_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75" class="flag-placeholder">
    <rect width="100" height="75" fill="#2a2a3e" rx="4"/>
    <circle cx="50" cy="37" r="25" fill="none" stroke="#4a4a6a" stroke-width="2"/>
    <text x="50" y="45" text-anchor="middle" fill="#6a6a8a" font-size="24" font-family="sans-serif">?</text>
</svg>`;
/**
 * Retourne le chemin vers le fichier SVG du drapeau
 * @param code - Code pays ISO (majuscules ou minuscules)
 * @returns Chemin relatif vers le SVG
 */
function getFlagPath(code) {
    // Normaliser le code en minuscules (les fichiers sont en minuscules)
    const normalizedCode = code.toLowerCase();
    return `./flag-icons/${normalizedCode}.svg`;
}
/**
 * Génère le HTML pour afficher un drapeau avec fallback automatique
 * @param code - Code pays ISO
 * @param countryName - Nom du pays (pour l'attribut alt)
 * @param size - Taille CSS ('normal' | 'mini' | 'large')
 * @returns HTML du drapeau avec gestion d'erreur
 */
function renderFlagImage(code, countryName, size = 'normal') {
    const path = getFlagPath(code);
    const sizeClass = `flag-img flag-${size}`;
    // On encode le placeholder pour l'utiliser sans danger dans l'attribut HTML
    const fallbackSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(FLAG_PLACEHOLDER_SVG)}`;
    return `
        <img 
            src="${path}" 
            alt="Drapeau ${countryName}"
            class="${sizeClass}"
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackSrc}'"
        >
    `;
}
// ═══════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Initialise le routeur hash
 */
function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
/**
 * Gère le changement de route
 */
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    // Si non connecté, forcer login (sauf si déjà sur login)
    if (!isLoggedIn() && hash !== 'login') {
        navigateTo('login');
        return;
    }
    // Si connecté et sur login, aller à home
    if (isLoggedIn() && hash === 'login') {
        navigateTo('home');
        return;
    }
    const validPages = ['login', 'home', 'collection', 'shop', 'missions', 'profile'];
    const page = validPages.includes(hash) ? hash : 'home';
    uiState.currentPage = page;
    renderPage(page);
    updateNavActive(page);
}
/**
 * Navigation vers une page
 */
function navigateTo(page) {
    window.location.hash = page;
}
/**
 * Met à jour l'élément actif dans la navigation
 */
function updateNavActive(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// RENDU DES PAGES
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Affiche une page
 */
function renderPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent)
        return;
    // Afficher/masquer header selon la page
    const header = document.getElementById('header');
    if (header) {
        header.style.display = page === 'login' ? 'none' : 'flex';
    }
    switch (page) {
        case 'login':
            renderLoginPage(mainContent);
            break;
        case 'home':
            renderHomePage(mainContent);
            break;
        case 'collection':
            renderCollectionPage(mainContent);
            break;
        case 'shop':
            renderShopPage(mainContent);
            break;
        case 'missions':
            renderMissionsPage(mainContent);
            break;
        case 'profile':
            renderProfilePage(mainContent);
            break;
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE LOGIN
// ═══════════════════════════════════════════════════════════════════════════
function renderLoginPage(container) {
    container.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div class="login-logo">
                    <span class="logo-icon">💕</span>
                    <h1>World of Love</h1>
                    <p class="subtitle">Card Game</p>
                </div>
                
                <div class="login-tabs">
                    <button class="tab-btn active" data-tab="login">Connexion</button>
                    <button class="tab-btn" data-tab="signup">Inscription</button>
                </div>
                
                <form id="auth-form" class="auth-form">
                    <div class="form-group">
                        <label for="username">Pseudo</label>
                        <input type="text" id="username" placeholder="Entrez votre pseudo" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" placeholder="Entrez votre mot de passe" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full" id="auth-submit">
                        Se connecter
                    </button>
                </form>
                
                <p class="login-info">
                    💡 Vos données sont stockées localement dans votre navigateur.
                </p>
            </div>
        </div>
    `;
    // Événements
    let isLogin = true;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            isLogin = btn.getAttribute('data-tab') === 'login';
            const submitBtn = document.getElementById('auth-submit');
            if (submitBtn) {
                submitBtn.textContent = isLogin ? 'Se connecter' : 'Créer un compte';
            }
        });
    });
    const form = document.getElementById('auth-form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const result = isLogin ? login(username, password) : signup(username, password);
        if (result.success) {
            showToast(result.message, 'success');
            navigateTo('home');
        }
        else {
            showToast(result.message, 'error');
        }
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE ACCUEIL
// ═══════════════════════════════════════════════════════════════════════════
function renderHomePage(container) {
    const player = loadPlayer();
    if (!player)
        return;
    checkAndGenerateDailyMissions(player);
    const dailyAvailable = isDailyRewardAvailable();
    const loveMatchAvail = isLoveMatchAvailable();
    container.innerHTML = `
        <div class="page-home">
            <div class="welcome-banner">
                <h2>Bienvenue, ${player.username} ! 💕</h2>
                <p>Collectionnez les 196 pays du monde !</p>
            </div>
            
            <div class="stats-cards">
                <div class="stat-card">
                    <span class="stat-icon">🎴</span>
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">Cartes</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🌍</span>
                    <span class="stat-value">${player.collection.length}/196</span>
                    <span class="stat-label">Collection</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">${player.level}</span>
                    <span class="stat-label">Niveau</span>
                </div>
            </div>
            
            <div class="xp-bar-container">
                <div class="xp-bar">
                    <div class="xp-fill" style="width: ${(player.xp / player.xpToNextLevel) * 100}%"></div>
                </div>
                <span class="xp-text">${player.xp} / ${player.xpToNextLevel} XP</span>
            </div>
            
            <div class="action-buttons">
                ${dailyAvailable ? `
                    <button class="btn btn-glow" id="claim-daily">
                        🎁 Récompense quotidienne
                    </button>
                ` : ''}
                
                <button class="btn btn-primary btn-large" id="quick-pack">
                    📦 Ouvrir un Pack Basic
                </button>
                
                <button class="btn btn-secondary ${!loveMatchAvail.available ? 'disabled' : ''}" id="play-love-match">
                    💘 Love Match ${!loveMatchAvail.available ? `(${Math.ceil(loveMatchAvail.remainingMs / 1000)}s)` : ''}
                </button>
            </div>
            
            <div class="recent-cards">
                <h3>Dernières cartes obtenues</h3>
                <div class="cards-row">
                    ${player.deck.slice(-5).reverse().map(card => renderMiniCard(card)).join('')}
                </div>
            </div>
        </div>
    `;
    // Événements
    document.getElementById('claim-daily')?.addEventListener('click', () => {
        const result = claimDailyReward();
        showToast(result.message, result.success ? 'success' : 'error');
        if (result.success)
            renderHomePage(container);
    });
    document.getElementById('quick-pack')?.addEventListener('click', () => {
        openPackWithAnimation('basic');
    });
    document.getElementById('play-love-match')?.addEventListener('click', () => {
        if (isLoveMatchAvailable().available) {
            startLoveMatchGame();
        }
    });
    // Rafraîchir le timer Love Match
    if (!loveMatchAvail.available) {
        setTimeout(() => {
            if (uiState.currentPage === 'home') {
                renderHomePage(container);
            }
        }, 1000);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE COLLECTION
// ═══════════════════════════════════════════════════════════════════════════
function renderCollectionPage(container) {
    const player = loadPlayer();
    if (!player)
        return;
    let filteredCards = [...player.deck];
    // Appliquer les filtres
    if (uiState.searchQuery) {
        const query = uiState.searchQuery.toLowerCase();
        filteredCards = filteredCards.filter(c => c.countryName.toLowerCase().includes(query) ||
            c.countryCode.toLowerCase().includes(query));
    }
    if (uiState.filterContinent !== 'all') {
        filteredCards = filteredCards.filter(c => c.continent === uiState.filterContinent);
    }
    if (uiState.filterRarity !== 'all') {
        filteredCards = filteredCards.filter(c => c.rarity === uiState.filterRarity);
    }
    if (uiState.filterFavorites) {
        filteredCards = filteredCards.filter(c => player.favorites.includes(c.id));
    }
    // Trier par Love Power décroissant
    filteredCards.sort((a, b) => b.lovePower - a.lovePower);
    const fusablePairs = findFusablePairs(player);
    container.innerHTML = `
        <div class="page-collection">
            <div class="collection-header">
                <h2>Ma Collection</h2>
                <div class="collection-stats">
                    <span>🎴 ${player.deck.length} cartes</span>
                    <span>🌍 ${player.collection.length}/196 pays</span>
                </div>
            </div>
            
            <div class="collection-filters">
                <div class="search-box">
                    <input type="text" id="search-input" placeholder="🔍 Rechercher un pays..." value="${uiState.searchQuery}">
                </div>
                
                <div class="filter-row">
                    <select id="filter-continent">
                        <option value="all">Tous les continents</option>
                        <option value="Europe" ${uiState.filterContinent === 'Europe' ? 'selected' : ''}>🌍 Europe</option>
                        <option value="Afrique" ${uiState.filterContinent === 'Afrique' ? 'selected' : ''}>🌍 Afrique</option>
                        <option value="Asie" ${uiState.filterContinent === 'Asie' ? 'selected' : ''}>🌏 Asie</option>
                        <option value="Amérique" ${uiState.filterContinent === 'Amérique' ? 'selected' : ''}>🌎 Amérique</option>
                        <option value="Océanie" ${uiState.filterContinent === 'Océanie' ? 'selected' : ''}>🏝️ Océanie</option>
                    </select>
                    
                    <select id="filter-rarity">
                        <option value="all">Toutes les raretés</option>
                        <option value="Common" ${uiState.filterRarity === 'Common' ? 'selected' : ''}>⚪ Common</option>
                        <option value="Rare" ${uiState.filterRarity === 'Rare' ? 'selected' : ''}>🔵 Rare</option>
                        <option value="Epic" ${uiState.filterRarity === 'Epic' ? 'selected' : ''}>🟣 Epic</option>
                        <option value="Legendary" ${uiState.filterRarity === 'Legendary' ? 'selected' : ''}>🟡 Legendary</option>
                    </select>
                    
                    <button class="btn btn-icon ${uiState.filterFavorites ? 'active' : ''}" id="filter-favorites" title="Favoris uniquement">
                        ❤️
                    </button>
                </div>
            </div>
            
            ${fusablePairs.length > 0 ? `
                <div class="fusion-banner">
                    <span>✨ ${fusablePairs.length} fusion(s) possible(s) !</span>
                    <button class="btn btn-small btn-glow" id="show-fusions">Fusionner</button>
                </div>
            ` : ''}
            
            <div class="cards-grid">
                ${filteredCards.length > 0
        ? filteredCards.map(card => renderCard(card, player.favorites.includes(card.id))).join('')
        : '<p class="no-cards">Aucune carte trouvée.</p>'}
            </div>
        </div>
    `;
    // Événements filtres
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        uiState.searchQuery = e.target.value;
        renderCollectionPage(container);
    });
    document.getElementById('filter-continent')?.addEventListener('change', (e) => {
        uiState.filterContinent = e.target.value;
        renderCollectionPage(container);
    });
    document.getElementById('filter-rarity')?.addEventListener('change', (e) => {
        uiState.filterRarity = e.target.value;
        renderCollectionPage(container);
    });
    document.getElementById('filter-favorites')?.addEventListener('click', () => {
        uiState.filterFavorites = !uiState.filterFavorites;
        renderCollectionPage(container);
    });
    document.getElementById('show-fusions')?.addEventListener('click', () => {
        showFusionModal(fusablePairs);
    });
    // Événements cartes
    document.querySelectorAll('.card').forEach(cardEl => {
        cardEl.addEventListener('click', () => {
            const cardId = cardEl.getAttribute('data-id');
            if (cardId)
                showCardDetailModal(cardId);
        });
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE BOUTIQUE
// ═══════════════════════════════════════════════════════════════════════════
function renderShopPage(container) {
    const player = loadPlayer();
    if (!player)
        return;
    container.innerHTML = `
        <div class="page-shop">
            <div class="shop-header">
                <h2>Boutique</h2>
                <div class="currency-display">
                    <span class="currency coins">🪙 ${player.coins}</span>
                    <span class="currency gems">💎 ${player.gems}</span>
                </div>
            </div>
            
            <div class="packs-grid">
                <div class="pack-card pack-basic">
                    <div class="pack-glow"></div>
                    <div class="pack-content">
                        <div class="pack-icon">📦</div>
                        <h3>Pack Basic</h3>
                        <p class="pack-desc">3 cartes aléatoires</p>
                        <div class="pack-chances">
                            <span>⚪ 75%</span>
                            <span>🔵 20%</span>
                            <span>🟣 4%</span>
                            <span>🟡 1%</span>
                        </div>
                        <button class="btn btn-primary ${player.coins < 100 ? 'disabled' : ''}" data-pack="basic">
                            🪙 100 Coins
                        </button>
                    </div>
                </div>
                
                <div class="pack-card pack-premium">
                    <div class="pack-glow"></div>
                    <div class="pack-content">
                        <div class="pack-icon">🎁</div>
                        <h3>Pack Premium</h3>
                        <p class="pack-desc">5 cartes + meilleures chances</p>
                        <div class="pack-chances">
                            <span>⚪ 55%</span>
                            <span>🔵 30%</span>
                            <span>🟣 12%</span>
                            <span>🟡 3%</span>
                        </div>
                        <button class="btn btn-glow ${player.gems < 30 ? 'disabled' : ''}" data-pack="premium">
                            💎 30 Gems
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="shop-info">
                <h3>💡 Conseils</h3>
                <ul>
                    <li>Les packs Premium ont 3x plus de chances d'obtenir des cartes Legendary !</li>
                    <li>Fusionnez vos doublons pour augmenter la Love Power de vos cartes.</li>
                    <li>Complétez les missions quotidiennes pour gagner des récompenses.</li>
                </ul>
            </div>
        </div>
    `;
    // Événements
    document.querySelectorAll('[data-pack]').forEach(btn => {
        btn.addEventListener('click', () => {
            const packType = btn.getAttribute('data-pack');
            openPackWithAnimation(packType);
        });
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE MISSIONS
// ═══════════════════════════════════════════════════════════════════════════
function renderMissionsPage(container) {
    const player = loadPlayer();
    if (!player)
        return;
    checkAndGenerateDailyMissions(player);
    const dailyAvailable = isDailyRewardAvailable();
    container.innerHTML = `
        <div class="page-missions">
            <div class="missions-header">
                <h2>Missions Quotidiennes</h2>
                <p class="missions-date">📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            
            ${dailyAvailable ? `
                <div class="daily-reward-card">
                    <div class="reward-icon">🎁</div>
                    <div class="reward-info">
                        <h3>Récompense quotidienne</h3>
                        <p>Réclamez vos récompenses journalières !</p>
                    </div>
                    <button class="btn btn-glow" id="claim-daily-mission">Réclamer</button>
                </div>
            ` : `
                <div class="daily-reward-card claimed">
                    <div class="reward-icon">✅</div>
                    <div class="reward-info">
                        <h3>Récompense quotidienne</h3>
                        <p>Déjà réclamée aujourd'hui. Revenez demain !</p>
                    </div>
                </div>
            `}
            
            <div class="missions-list">
                ${player.dailyMissions.map(mission => renderMission(mission)).join('')}
            </div>
        </div>
    `;
    // Événements
    document.getElementById('claim-daily-mission')?.addEventListener('click', () => {
        const result = claimDailyReward();
        showToast(result.message, result.success ? 'success' : 'error');
        if (result.success)
            renderMissionsPage(container);
    });
    document.querySelectorAll('.claim-mission-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const missionId = btn.getAttribute('data-mission');
            if (missionId) {
                const result = claimMissionReward(missionId);
                showToast(result.message, result.success ? 'success' : 'error');
                if (result.success)
                    renderMissionsPage(container);
            }
        });
    });
}
function renderMission(mission) {
    const progress = Math.max(0, mission.progress);
    const progressPercent = mission.completed ? 100 : (progress / mission.target) * 100;
    const isClaimed = mission.progress < 0;
    return `
        <div class="mission-card ${mission.completed ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}">
            <div class="mission-icon">${getMissionIcon(mission.type)}</div>
            <div class="mission-info">
                <h4>${mission.description}</h4>
                <div class="mission-progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="mission-progress-text">${progress}/${mission.target}</span>
            </div>
            <div class="mission-reward">
                <span>🪙 ${mission.rewardCoins}</span>
                <span>⭐ ${mission.rewardXp} XP</span>
            </div>
            ${mission.completed && !isClaimed ? `
                <button class="btn btn-small btn-glow claim-mission-btn" data-mission="${mission.id}">
                    Réclamer
                </button>
            ` : isClaimed ? '<span class="claimed-badge">✅</span>' : ''}
        </div>
    `;
}
function getMissionIcon(type) {
    const icons = {
        'open_pack': '📦',
        'fuse_card': '✨',
        'get_rare': '💎',
        'play_game': '🎮',
        'collect': '🌍',
    };
    return icons[type] || '📋';
}
// ═══════════════════════════════════════════════════════════════════════════
// PAGE PROFIL
// ═══════════════════════════════════════════════════════════════════════════
function renderProfilePage(container) {
    const player = loadPlayer();
    if (!player)
        return;
    container.innerHTML = `
        <div class="page-profile">
            <div class="profile-header">
                <div class="profile-avatar">
                    <span class="avatar-emoji">💕</span>
                </div>
                <div class="profile-info">
                    <h2>${player.username}</h2>
                    <span class="profile-level">Niveau ${player.level}</span>
                    <span class="profile-date">Membre depuis ${new Date(player.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            
            <div class="profile-stats-grid">
                <div class="profile-stat">
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">Cartes</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.collection.length}</span>
                    <span class="stat-label">Pays uniques</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.packsOpened}</span>
                    <span class="stat-label">Packs ouverts</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.cardsFused}</span>
                    <span class="stat-label">Fusions</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.gamesPlayed}</span>
                    <span class="stat-label">Parties jouées</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.gamesWon}</span>
                    <span class="stat-label">Victoires</span>
                </div>
            </div>
            
            <div class="profile-resources">
                <div class="resource">
                    <span class="resource-icon">🪙</span>
                    <span class="resource-value">${player.coins}</span>
                    <span class="resource-label">Coins</span>
                </div>
                <div class="resource">
                    <span class="resource-icon">💎</span>
                    <span class="resource-value">${player.gems}</span>
                    <span class="resource-label">Gems</span>
                </div>
            </div>
            
            <div class="profile-actions">
                <h3>💾 Sauvegarde</h3>
                <div class="action-row">
                    <button class="btn btn-secondary" id="export-save">
                        📤 Exporter
                    </button>
                    <label class="btn btn-secondary">
                        📥 Importer
                        <input type="file" id="import-save" accept=".json" hidden>
                    </label>
                </div>
            </div>
            
            <div class="profile-actions">
                <h3>🌍 Langue</h3>
                <select id="lang-select" class="lang-select">
                    ${getAvailableLangs().map(lang => {
        const meta = getLangMeta(lang);
        return `<option value="${lang}" ${getLang() === lang ? 'selected' : ''}>${meta?.name} (${meta?.nameEn})</option>`;
    }).join('')}
                </select>
            </div>
            
            <button class="btn btn-danger" id="logout-btn">
                🚪 Déconnexion
            </button>
        </div>
    `;
    // Événements
    document.getElementById('export-save')?.addEventListener('click', exportSave);
    document.getElementById('import-save')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const success = await importSave(file);
            if (success) {
                renderProfilePage(container);
            }
        }
    });
    document.getElementById('lang-select')?.addEventListener('change', (e) => {
        const lang = e.target.value;
        if (setLang(lang)) {
            showToast(t('languageChanged'), 'success');
            renderProfilePage(container);
        }
    });
    document.getElementById('logout-btn')?.addEventListener('click', logout);
}
// ═══════════════════════════════════════════════════════════════════════════
// RENDU DES CARTES
// ═══════════════════════════════════════════════════════════════════════════
function renderCard(card, isFavorite) {
    return `
        <div class="card rarity-${card.rarity.toLowerCase()}" data-id="${card.id}">
            <div class="card-inner">
                <div class="card-flag">
                    ${renderFlagImage(card.countryCode, card.countryName, 'normal')}
                </div>
                <div class="card-name">${card.countryName}</div>
                <div class="card-info">
                    <span class="card-continent">${card.continent}</span>
                    <span class="card-rarity">${card.rarity}</span>
                </div>
                <div class="card-stats">
                    <span class="love-power">💕 ${card.lovePower}</span>
                    <span class="card-level">Nv.${card.level}</span>
                </div>
                ${isFavorite ? '<span class="favorite-badge">❤️</span>' : ''}
            </div>
        </div>
    `;
}
function renderMiniCard(card) {
    return `
        <div class="mini-card rarity-${card.rarity.toLowerCase()}">
            <span class="mini-flag">
                ${renderFlagImage(card.countryCode, card.countryName, 'mini')}
            </span>
            <span class="mini-name">${card.countryCode}</span>
        </div>
    `;
}
// ═══════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════
function showModal(content, onClose) {
    const existing = document.getElementById('modal-overlay');
    if (existing)
        existing.remove();
    const modal = document.createElement('div');
    modal.id = 'modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    // Animation d'entrée
    requestAnimationFrame(() => modal.classList.add('active'));
    // Fermeture
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            onClose?.();
        }, 200);
    };
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal)
            closeModal();
    });
}
function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    }
}
function showCardDetailModal(cardId) {
    const player = loadPlayer();
    if (!player)
        return;
    const card = player.deck.find(c => c.id === cardId);
    if (!card)
        return;
    const isFav = player.favorites.includes(card.id);
    const samCards = player.deck.filter(c => c.countryCode === card.countryCode && c.id !== card.id);
    const canFuse = samCards.length > 0 && card.level < 5;
    showModal(`
        <div class="card-detail">
            <div class="card-detail-flag">${card.flag}</div>
            <h2>${card.countryName}</h2>
            <div class="card-detail-rarity rarity-${card.rarity.toLowerCase()}">${card.rarity}</div>
            
            <div class="card-detail-stats">
                <div class="detail-stat">
                    <span class="label">Love Power</span>
                    <span class="value">💕 ${card.lovePower}</span>
                </div>
                <div class="detail-stat">
                    <span class="label">Niveau</span>
                    <span class="value">⭐ ${card.level}/5</span>
                </div>
                <div class="detail-stat">
                    <span class="label">Continent</span>
                    <span class="value">🌍 ${card.continent}</span>
                </div>
            </div>
            
            <div class="card-detail-actions">
                <button class="btn ${isFav ? 'btn-danger' : 'btn-secondary'}" id="toggle-fav">
                    ${isFav ? '💔 Retirer des favoris' : '❤️ Ajouter aux favoris'}
                </button>
                ${canFuse ? `
                    <button class="btn btn-glow" id="fuse-this">
                        ✨ Fusionner (${samCards.length} disponible${samCards.length > 1 ? 's' : ''})
                    </button>
                ` : ''}
            </div>
            
            <p class="card-detail-date">Obtenue le ${new Date(card.obtainedAt).toLocaleDateString('fr-FR')}</p>
        </div>
    `);
    document.getElementById('toggle-fav')?.addEventListener('click', () => {
        toggleFavorite(card.id);
        closeModal();
        const mainContent = document.getElementById('main-content');
        if (mainContent)
            renderCollectionPage(mainContent);
        showToast(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris !', 'success');
    });
    document.getElementById('fuse-this')?.addEventListener('click', () => {
        // Protection anti-double clic
        if (fusionInProgress)
            return;
        fusionInProgress = true;
        closeModal();
        if (samCards.length > 0) {
            const result = fuseCards(card.id, samCards[0].id);
            if (result.success) {
                showFusionSuccessModal(result.resultCard);
            }
            else if (!result.silent) {
                // Afficher le toast uniquement si l'erreur n'est pas silencieuse
                showToast(result.message, 'error');
            }
        }
        // Réinitialiser après un court délai
        setTimeout(() => { fusionInProgress = false; }, 500);
    });
}
function showFusionModal(pairs) {
    // Toujours recalculer les paires fusionnables pour avoir des données fraîches
    const player = loadPlayer();
    if (!player)
        return;
    const freshPairs = findFusablePairs(player);
    // Si aucune fusion disponible, afficher un message
    if (freshPairs.length === 0) {
        showModal(`
            <div class="fusion-modal">
                <h2>✨ Fusions disponibles</h2>
                <p>Aucune fusion disponible pour le moment.</p>
                <button class="btn btn-primary" onclick="closeModal()">OK</button>
            </div>
        `);
        return;
    }
    showModal(`
        <div class="fusion-modal">
            <h2>✨ Fusions disponibles</h2>
            <div class="fusion-list">
                ${freshPairs.map(pair => `
                    <div class="fusion-item" data-card1="${pair.card1.id}" data-card2="${pair.card2.id}">
                        <div class="fusion-cards">
                            <div class="mini-card rarity-${pair.card1.rarity.toLowerCase()}">
                                ${pair.card1.flag} ${pair.card1.countryName} (Nv.${pair.card1.level})
                            </div>
                            <span class="fusion-arrow">➕</span>
                            <div class="mini-card rarity-${pair.card2.rarity.toLowerCase()}">
                                ${pair.card2.flag} ${pair.card2.countryName} (Nv.${pair.card2.level})
                            </div>
                        </div>
                        <button class="btn btn-small btn-glow fusion-btn">Fusionner</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
    document.querySelectorAll('.fusion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Protection anti-double clic
            if (fusionInProgress)
                return;
            fusionInProgress = true;
            const item = btn.closest('.fusion-item');
            const card1Id = item?.getAttribute('data-card1');
            const card2Id = item?.getAttribute('data-card2');
            if (card1Id && card2Id) {
                const result = fuseCards(card1Id, card2Id);
                closeModal();
                if (result.success) {
                    showFusionSuccessModal(result.resultCard);
                }
                else if (!result.silent) {
                    // Afficher le toast uniquement si l'erreur n'est pas silencieuse
                    showToast(result.message, 'error');
                }
            }
            // Réinitialiser après un court délai
            setTimeout(() => { fusionInProgress = false; }, 500);
        });
    });
}
function showFusionSuccessModal(card) {
    showModal(`
        <div class="fusion-success">
            <div class="fusion-effect">✨</div>
            <h2>Fusion réussie !</h2>
            <div class="fused-card card rarity-${card.rarity.toLowerCase()}">
                <div class="card-inner">
                    <div class="card-flag">${card.flag}</div>
                    <div class="card-name">${card.countryName}</div>
                    <div class="card-stats">
                        <span class="love-power">💕 ${card.lovePower}</span>
                        <span class="card-level">Nv.${card.level}</span>
                    </div>
                </div>
            </div>
            <p>Niveau ${card.level} atteint !</p>
            <button class="btn btn-primary" id="close-fusion-success">Super !</button>
        </div>
    `, () => {
        // Rafraîchir la page Collection après fermeture de la modal
        // pour que la liste des fusions soit à jour
        const mainContent = document.getElementById('main-content');
        if (mainContent && uiState.currentPage === 'collection') {
            renderCollectionPage(mainContent);
        }
    });
    // Attacher l'événement au bouton pour utiliser la fermeture avec callback
    document.getElementById('close-fusion-success')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.querySelector('.modal-close')?.dispatchEvent(new Event('click'));
        }
    });
}
// ═══════════════════════════════════════════════════════════════════════════
// OUVERTURE DE PACK (ANIMATION)
// ═══════════════════════════════════════════════════════════════════════════
function openPackWithAnimation(packType) {
    const result = openPack(packType);
    if (!result.success) {
        showToast(result.message, 'error');
        return;
    }
    uiState.packOpening = true;
    uiState.packCards = result.cards;
    showModal(`
        <div class="pack-opening">
            <h2>📦 Ouverture du pack...</h2>
            <div class="pack-cards-reveal">
                ${result.cards.map((card, i) => `
                    <div class="pack-card-wrapper" style="--delay: ${i * 0.2}s">
                        <div class="pack-card-flipper">
                            <div class="pack-card-back">?</div>
                            <div class="pack-card-front card rarity-${card.rarity.toLowerCase()}">
                                <div class="card-inner">
                                    <div class="card-flag">${card.flag}</div>
                                    <div class="card-name">${card.countryName}</div>
                                    <div class="card-rarity">${card.rarity}</div>
                                    <div class="card-stats">
                                        <span class="love-power">💕 ${card.lovePower}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" id="close-pack" style="margin-top: 20px;">Continuer</button>
        </div>
    `, () => {
        uiState.packOpening = false;
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            renderPage(uiState.currentPage);
        }
    });
    // Déclencher l'animation flip après un court délai
    setTimeout(() => {
        document.querySelectorAll('.pack-card-wrapper').forEach((wrapper, i) => {
            setTimeout(() => {
                wrapper.classList.add('revealed');
            }, i * 300);
        });
    }, 500);
    document.getElementById('close-pack')?.addEventListener('click', closeModal);
    showToast(result.message, 'success');
}
// ═══════════════════════════════════════════════════════════════════════════
// LOVE MATCH (MINI-JEU)
// ═══════════════════════════════════════════════════════════════════════════
function startLoveMatchGame() {
    const result = startLoveMatch();
    if (!result.success || !result.game) {
        showToast(result.message, 'error');
        return;
    }
    uiState.loveMatchGame = result.game;
    showModal(`
        <div class="love-match-game">
            <h2>💘 Love Match</h2>
            <p>Cliquez sur la carte avec la <strong>meilleure Love Power</strong> !</p>
            <div class="love-match-cards">
                ${result.game.cards.map((card, i) => `
                    <div class="love-match-card card rarity-${card.rarity.toLowerCase()}" data-index="${i}">
                        <div class="card-inner">
                            <div class="card-flag">${card.flag}</div>
                            <div class="card-name">${card.countryName}</div>
                            <div class="card-rarity">${card.rarity}</div>
                            <div class="card-stats">
                                <span class="love-power">💕 ???</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
    document.querySelectorAll('.love-match-card').forEach(cardEl => {
        cardEl.addEventListener('click', () => {
            const index = parseInt(cardEl.getAttribute('data-index') || '0');
            handleLoveMatchChoice(index);
        });
    });
}
function handleLoveMatchChoice(chosenIndex) {
    const result = submitLoveMatchAnswer(chosenIndex);
    if (!result.success) {
        showToast(result.message, 'error');
        return;
    }
    // Révéler toutes les Love Power
    if (uiState.loveMatchGame) {
        document.querySelectorAll('.love-match-card').forEach((cardEl, i) => {
            const card = uiState.loveMatchGame.cards[i];
            const lovePowerEl = cardEl.querySelector('.love-power');
            if (lovePowerEl) {
                lovePowerEl.textContent = `💕 ${card.lovePower}`;
            }
            if (i === uiState.loveMatchGame.correctIndex) {
                cardEl.classList.add('correct');
            }
            else if (i === chosenIndex && !result.correct) {
                cardEl.classList.add('wrong');
            }
        });
    }
    // Afficher le résultat
    setTimeout(() => {
        closeModal();
        showModal(`
            <div class="love-match-result ${result.correct ? 'win' : 'lose'}">
                <div class="result-icon">${result.correct ? '🎉' : '😢'}</div>
                <h2>${result.correct ? 'Bravo !' : 'Dommage !'}</h2>
                <p>${result.message}</p>
                ${result.correctCard ? `
                    <p>La bonne réponse était : <strong>${result.correctCard.countryName}</strong> (💕 ${result.correctCard.lovePower})</p>
                ` : ''}
                <button class="btn btn-primary" onclick="closeModal()">OK</button>
            </div>
        `, () => {
            uiState.loveMatchGame = null;
            const mainContent = document.getElementById('main-content');
            if (mainContent && uiState.currentPage === 'home') {
                renderHomePage(mainContent);
            }
        });
    }, 1500);
}
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
    };
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    // Animation d'entrée
    requestAnimationFrame(() => toast.classList.add('show'));
    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}
// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION UI
// ═══════════════════════════════════════════════════════════════════════════
function initUI() {
    // Événements navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            if (page)
                navigateTo(page);
        });
    });
    // Initialiser le router
    initRouter();
}
// Exposer closeModal globalement pour les onclick inline
window.closeModal = closeModal;
/**
 * World of Love — Card Game
 * Base de données des 196 pays
 *
 * Chaque pays a :
 * - code : code ISO 2 lettres
 * - nameFR : nom français
 * - continent : continent
 * - rarityBase : rareté de base (affecte probabilité d'obtention)
 */
// Liste complète des 196 pays
const COUNTRIES = [
    // ═══════════════════════════════════════════════════════════════════
    // EUROPE (44 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'FR', nameFR: 'France', continent: 'Europe', rarityBase: 'Rare', flag: '🇫🇷' },
    { code: 'DE', nameFR: 'Allemagne', continent: 'Europe', rarityBase: 'Rare', flag: '🇩🇪' },
    { code: 'IT', nameFR: 'Italie', continent: 'Europe', rarityBase: 'Rare', flag: '🇮🇹' },
    { code: 'ES', nameFR: 'Espagne', continent: 'Europe', rarityBase: 'Rare', flag: '🇪🇸' },
    { code: 'GB', nameFR: 'Royaume-Uni', continent: 'Europe', rarityBase: 'Rare', flag: '🇬🇧' },
    { code: 'PT', nameFR: 'Portugal', continent: 'Europe', rarityBase: 'Common', flag: '🇵🇹' },
    { code: 'NL', nameFR: 'Pays-Bas', continent: 'Europe', rarityBase: 'Common', flag: '🇳🇱' },
    { code: 'BE', nameFR: 'Belgique', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇪' },
    { code: 'CH', nameFR: 'Suisse', continent: 'Europe', rarityBase: 'Epic', flag: '🇨🇭' },
    { code: 'AT', nameFR: 'Autriche', continent: 'Europe', rarityBase: 'Common', flag: '🇦🇹' },
    { code: 'PL', nameFR: 'Pologne', continent: 'Europe', rarityBase: 'Common', flag: '🇵🇱' },
    { code: 'CZ', nameFR: 'République Tchèque', continent: 'Europe', rarityBase: 'Common', flag: '🇨🇿' },
    { code: 'SK', nameFR: 'Slovaquie', continent: 'Europe', rarityBase: 'Common', flag: '🇸🇰' },
    { code: 'HU', nameFR: 'Hongrie', continent: 'Europe', rarityBase: 'Common', flag: '🇭🇺' },
    { code: 'RO', nameFR: 'Roumanie', continent: 'Europe', rarityBase: 'Common', flag: '🇷🇴' },
    { code: 'BG', nameFR: 'Bulgarie', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇬' },
    { code: 'GR', nameFR: 'Grèce', continent: 'Europe', rarityBase: 'Rare', flag: '🇬🇷' },
    { code: 'HR', nameFR: 'Croatie', continent: 'Europe', rarityBase: 'Common', flag: '🇭🇷' },
    { code: 'SI', nameFR: 'Slovénie', continent: 'Europe', rarityBase: 'Common', flag: '🇸🇮' },
    { code: 'RS', nameFR: 'Serbie', continent: 'Europe', rarityBase: 'Common', flag: '🇷🇸' },
    { code: 'BA', nameFR: 'Bosnie-Herzégovine', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇦' },
    { code: 'ME', nameFR: 'Monténégro', continent: 'Europe', rarityBase: 'Epic', flag: '🇲🇪' },
    { code: 'MK', nameFR: 'Macédoine du Nord', continent: 'Europe', rarityBase: 'Common', flag: '🇲🇰' },
    { code: 'AL', nameFR: 'Albanie', continent: 'Europe', rarityBase: 'Common', flag: '🇦🇱' },
    { code: 'XK', nameFR: 'Kosovo', continent: 'Europe', rarityBase: 'Epic', flag: '🇽🇰' },
    { code: 'UA', nameFR: 'Ukraine', continent: 'Europe', rarityBase: 'Rare', flag: '🇺🇦' },
    { code: 'BY', nameFR: 'Biélorussie', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇾' },
    { code: 'MD', nameFR: 'Moldavie', continent: 'Europe', rarityBase: 'Common', flag: '🇲🇩' },
    { code: 'RU', nameFR: 'Russie', continent: 'Europe', rarityBase: 'Rare', flag: '🇷🇺' },
    { code: 'SE', nameFR: 'Suède', continent: 'Europe', rarityBase: 'Rare', flag: '🇸🇪' },
    { code: 'NO', nameFR: 'Norvège', continent: 'Europe', rarityBase: 'Epic', flag: '🇳🇴' },
    { code: 'FI', nameFR: 'Finlande', continent: 'Europe', rarityBase: 'Common', flag: '🇫🇮' },
    { code: 'DK', nameFR: 'Danemark', continent: 'Europe', rarityBase: 'Common', flag: '🇩🇰' },
    { code: 'IS', nameFR: 'Islande', continent: 'Europe', rarityBase: 'Epic', flag: '🇮🇸' },
    { code: 'IE', nameFR: 'Irlande', continent: 'Europe', rarityBase: 'Common', flag: '🇮🇪' },
    { code: 'EE', nameFR: 'Estonie', continent: 'Europe', rarityBase: 'Common', flag: '🇪🇪' },
    { code: 'LV', nameFR: 'Lettonie', continent: 'Europe', rarityBase: 'Common', flag: '🇱🇻' },
    { code: 'LT', nameFR: 'Lituanie', continent: 'Europe', rarityBase: 'Common', flag: '🇱🇹' },
    { code: 'LU', nameFR: 'Luxembourg', continent: 'Europe', rarityBase: 'Epic', flag: '🇱🇺' },
    { code: 'MT', nameFR: 'Malte', continent: 'Europe', rarityBase: 'Epic', flag: '🇲🇹' },
    { code: 'CY', nameFR: 'Chypre', continent: 'Europe', rarityBase: 'Common', flag: '🇨🇾' },
    { code: 'MC', nameFR: 'Monaco', continent: 'Europe', rarityBase: 'Legendary', flag: '🇲🇨' },
    { code: 'SM', nameFR: 'Saint-Marin', continent: 'Europe', rarityBase: 'Legendary', flag: '🇸🇲' },
    { code: 'VA', nameFR: 'Vatican', continent: 'Europe', rarityBase: 'Legendary', flag: '🇻🇦' },
    // ═══════════════════════════════════════════════════════════════════
    // AFRIQUE (54 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'MA', nameFR: 'Maroc', continent: 'Afrique', rarityBase: 'Rare', flag: '🇲🇦' },
    { code: 'DZ', nameFR: 'Algérie', continent: 'Afrique', rarityBase: 'Common', flag: '🇩🇿' },
    { code: 'TN', nameFR: 'Tunisie', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇳' },
    { code: 'LY', nameFR: 'Libye', continent: 'Afrique', rarityBase: 'Common', flag: '🇱🇾' },
    { code: 'EG', nameFR: 'Égypte', continent: 'Afrique', rarityBase: 'Rare', flag: '🇪🇬' },
    { code: 'SD', nameFR: 'Soudan', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇩' },
    { code: 'SS', nameFR: 'Soudan du Sud', continent: 'Afrique', rarityBase: 'Epic', flag: '🇸🇸' },
    { code: 'ET', nameFR: 'Éthiopie', continent: 'Afrique', rarityBase: 'Common', flag: '🇪🇹' },
    { code: 'ER', nameFR: 'Érythrée', continent: 'Afrique', rarityBase: 'Epic', flag: '🇪🇷' },
    { code: 'DJ', nameFR: 'Djibouti', continent: 'Afrique', rarityBase: 'Epic', flag: '🇩🇯' },
    { code: 'SO', nameFR: 'Somalie', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇴' },
    { code: 'KE', nameFR: 'Kenya', continent: 'Afrique', rarityBase: 'Common', flag: '🇰🇪' },
    { code: 'UG', nameFR: 'Ouganda', continent: 'Afrique', rarityBase: 'Common', flag: '🇺🇬' },
    { code: 'TZ', nameFR: 'Tanzanie', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇿' },
    { code: 'RW', nameFR: 'Rwanda', continent: 'Afrique', rarityBase: 'Common', flag: '🇷🇼' },
    { code: 'BI', nameFR: 'Burundi', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇮' },
    { code: 'CD', nameFR: 'RD Congo', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇩' },
    { code: 'CG', nameFR: 'Congo', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇬' },
    { code: 'GA', nameFR: 'Gabon', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇦' },
    { code: 'GQ', nameFR: 'Guinée Équatoriale', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇶' },
    { code: 'CM', nameFR: 'Cameroun', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇲' },
    { code: 'CF', nameFR: 'Centrafrique', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇫' },
    { code: 'TD', nameFR: 'Tchad', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇩' },
    { code: 'NE', nameFR: 'Niger', continent: 'Afrique', rarityBase: 'Common', flag: '🇳🇪' },
    { code: 'NG', nameFR: 'Nigéria', continent: 'Afrique', rarityBase: 'Rare', flag: '🇳🇬' },
    { code: 'BJ', nameFR: 'Bénin', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇯' },
    { code: 'TG', nameFR: 'Togo', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇬' },
    { code: 'GH', nameFR: 'Ghana', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇭' },
    { code: 'CI', nameFR: 'Côte d\'Ivoire', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇮' },
    { code: 'BF', nameFR: 'Burkina Faso', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇫' },
    { code: 'ML', nameFR: 'Mali', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇱' },
    { code: 'SN', nameFR: 'Sénégal', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇳' },
    { code: 'GM', nameFR: 'Gambie', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇲' },
    { code: 'GW', nameFR: 'Guinée-Bissau', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇼' },
    { code: 'GN', nameFR: 'Guinée', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇳' },
    { code: 'SL', nameFR: 'Sierra Leone', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇱' },
    { code: 'LR', nameFR: 'Libéria', continent: 'Afrique', rarityBase: 'Common', flag: '🇱🇷' },
    { code: 'MR', nameFR: 'Mauritanie', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇷' },
    { code: 'CV', nameFR: 'Cap-Vert', continent: 'Afrique', rarityBase: 'Epic', flag: '🇨🇻' },
    { code: 'ST', nameFR: 'Sao Tomé-et-Príncipe', continent: 'Afrique', rarityBase: 'Legendary', flag: '🇸🇹' },
    { code: 'AO', nameFR: 'Angola', continent: 'Afrique', rarityBase: 'Common', flag: '🇦🇴' },
    { code: 'ZM', nameFR: 'Zambie', continent: 'Afrique', rarityBase: 'Common', flag: '🇿🇲' },
    { code: 'ZW', nameFR: 'Zimbabwe', continent: 'Afrique', rarityBase: 'Common', flag: '🇿🇼' },
    { code: 'MW', nameFR: 'Malawi', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇼' },
    { code: 'MZ', nameFR: 'Mozambique', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇿' },
    { code: 'MG', nameFR: 'Madagascar', continent: 'Afrique', rarityBase: 'Rare', flag: '🇲🇬' },
    { code: 'MU', nameFR: 'Maurice', continent: 'Afrique', rarityBase: 'Epic', flag: '🇲🇺' },
    { code: 'SC', nameFR: 'Seychelles', continent: 'Afrique', rarityBase: 'Legendary', flag: '🇸🇨' },
    { code: 'KM', nameFR: 'Comores', continent: 'Afrique', rarityBase: 'Epic', flag: '🇰🇲' },
    { code: 'ZA', nameFR: 'Afrique du Sud', continent: 'Afrique', rarityBase: 'Rare', flag: '🇿🇦' },
    { code: 'NA', nameFR: 'Namibie', continent: 'Afrique', rarityBase: 'Common', flag: '🇳🇦' },
    { code: 'BW', nameFR: 'Botswana', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇼' },
    { code: 'SZ', nameFR: 'Eswatini', continent: 'Afrique', rarityBase: 'Epic', flag: '🇸🇿' },
    { code: 'LS', nameFR: 'Lesotho', continent: 'Afrique', rarityBase: 'Epic', flag: '🇱🇸' },
    // ═══════════════════════════════════════════════════════════════════
    // ASIE (48 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'CN', nameFR: 'Chine', continent: 'Asie', rarityBase: 'Rare', flag: '🇨🇳' },
    { code: 'JP', nameFR: 'Japon', continent: 'Asie', rarityBase: 'Epic', flag: '🇯🇵' },
    { code: 'KR', nameFR: 'Corée du Sud', continent: 'Asie', rarityBase: 'Rare', flag: '🇰🇷' },
    { code: 'KP', nameFR: 'Corée du Nord', continent: 'Asie', rarityBase: 'Epic', flag: '🇰🇵' },
    { code: 'MN', nameFR: 'Mongolie', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇳' },
    { code: 'TW', nameFR: 'Taïwan', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇼' },
    { code: 'HK', nameFR: 'Hong Kong', continent: 'Asie', rarityBase: 'Epic', flag: '🇭🇰' },
    { code: 'MO', nameFR: 'Macao', continent: 'Asie', rarityBase: 'Legendary', flag: '🇲🇴' },
    { code: 'VN', nameFR: 'Viêt Nam', continent: 'Asie', rarityBase: 'Common', flag: '🇻🇳' },
    { code: 'LA', nameFR: 'Laos', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇦' },
    { code: 'KH', nameFR: 'Cambodge', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇭' },
    { code: 'TH', nameFR: 'Thaïlande', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇭' },
    { code: 'MM', nameFR: 'Myanmar', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇲' },
    { code: 'MY', nameFR: 'Malaisie', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇾' },
    { code: 'SG', nameFR: 'Singapour', continent: 'Asie', rarityBase: 'Epic', flag: '🇸🇬' },
    { code: 'ID', nameFR: 'Indonésie', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇩' },
    { code: 'PH', nameFR: 'Philippines', continent: 'Asie', rarityBase: 'Common', flag: '🇵🇭' },
    { code: 'BN', nameFR: 'Brunei', continent: 'Asie', rarityBase: 'Epic', flag: '🇧🇳' },
    { code: 'TL', nameFR: 'Timor Oriental', continent: 'Asie', rarityBase: 'Epic', flag: '🇹🇱' },
    { code: 'IN', nameFR: 'Inde', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇳' },
    { code: 'PK', nameFR: 'Pakistan', continent: 'Asie', rarityBase: 'Common', flag: '🇵🇰' },
    { code: 'BD', nameFR: 'Bangladesh', continent: 'Asie', rarityBase: 'Common', flag: '🇧🇩' },
    { code: 'NP', nameFR: 'Népal', continent: 'Asie', rarityBase: 'Common', flag: '🇳🇵' },
    { code: 'BT', nameFR: 'Bhoutan', continent: 'Asie', rarityBase: 'Legendary', flag: '🇧🇹' },
    { code: 'LK', nameFR: 'Sri Lanka', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇰' },
    { code: 'MV', nameFR: 'Maldives', continent: 'Asie', rarityBase: 'Legendary', flag: '🇲🇻' },
    { code: 'AF', nameFR: 'Afghanistan', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇫' },
    { code: 'IR', nameFR: 'Iran', continent: 'Asie', rarityBase: 'Common', flag: '🇮🇷' },
    { code: 'IQ', nameFR: 'Irak', continent: 'Asie', rarityBase: 'Common', flag: '🇮🇶' },
    { code: 'SY', nameFR: 'Syrie', continent: 'Asie', rarityBase: 'Common', flag: '🇸🇾' },
    { code: 'LB', nameFR: 'Liban', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇧' },
    { code: 'JO', nameFR: 'Jordanie', continent: 'Asie', rarityBase: 'Common', flag: '🇯🇴' },
    { code: 'IL', nameFR: 'Israël', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇱' },
    { code: 'PS', nameFR: 'Palestine', continent: 'Asie', rarityBase: 'Epic', flag: '🇵🇸' },
    { code: 'SA', nameFR: 'Arabie Saoudite', continent: 'Asie', rarityBase: 'Rare', flag: '🇸🇦' },
    { code: 'YE', nameFR: 'Yémen', continent: 'Asie', rarityBase: 'Common', flag: '🇾🇪' },
    { code: 'OM', nameFR: 'Oman', continent: 'Asie', rarityBase: 'Common', flag: '🇴🇲' },
    { code: 'AE', nameFR: 'Émirats Arabes Unis', continent: 'Asie', rarityBase: 'Epic', flag: '🇦🇪' },
    { code: 'QA', nameFR: 'Qatar', continent: 'Asie', rarityBase: 'Epic', flag: '🇶🇦' },
    { code: 'BH', nameFR: 'Bahreïn', continent: 'Asie', rarityBase: 'Epic', flag: '🇧🇭' },
    { code: 'KW', nameFR: 'Koweït', continent: 'Asie', rarityBase: 'Epic', flag: '🇰🇼' },
    { code: 'TR', nameFR: 'Turquie', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇷' },
    { code: 'GE', nameFR: 'Géorgie', continent: 'Asie', rarityBase: 'Common', flag: '🇬🇪' },
    { code: 'AM', nameFR: 'Arménie', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇲' },
    { code: 'AZ', nameFR: 'Azerbaïdjan', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇿' },
    { code: 'KZ', nameFR: 'Kazakhstan', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇿' },
    { code: 'UZ', nameFR: 'Ouzbékistan', continent: 'Asie', rarityBase: 'Common', flag: '🇺🇿' },
    { code: 'TM', nameFR: 'Turkménistan', continent: 'Asie', rarityBase: 'Epic', flag: '🇹🇲' },
    { code: 'TJ', nameFR: 'Tadjikistan', continent: 'Asie', rarityBase: 'Common', flag: '🇹🇯' },
    { code: 'KG', nameFR: 'Kirghizistan', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇬' },
    // ═══════════════════════════════════════════════════════════════════
    // AMÉRIQUE (35 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'US', nameFR: 'États-Unis', continent: 'Amérique', rarityBase: 'Rare', flag: '🇺🇸' },
    { code: 'CA', nameFR: 'Canada', continent: 'Amérique', rarityBase: 'Rare', flag: '🇨🇦' },
    { code: 'MX', nameFR: 'Mexique', continent: 'Amérique', rarityBase: 'Rare', flag: '🇲🇽' },
    { code: 'GT', nameFR: 'Guatemala', continent: 'Amérique', rarityBase: 'Common', flag: '🇬🇹' },
    { code: 'BZ', nameFR: 'Belize', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇿' },
    { code: 'SV', nameFR: 'Salvador', continent: 'Amérique', rarityBase: 'Common', flag: '🇸🇻' },
    { code: 'HN', nameFR: 'Honduras', continent: 'Amérique', rarityBase: 'Common', flag: '🇭🇳' },
    { code: 'NI', nameFR: 'Nicaragua', continent: 'Amérique', rarityBase: 'Common', flag: '🇳🇮' },
    { code: 'CR', nameFR: 'Costa Rica', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇷' },
    { code: 'PA', nameFR: 'Panama', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇦' },
    { code: 'CU', nameFR: 'Cuba', continent: 'Amérique', rarityBase: 'Rare', flag: '🇨🇺' },
    { code: 'JM', nameFR: 'Jamaïque', continent: 'Amérique', rarityBase: 'Epic', flag: '🇯🇲' },
    { code: 'HT', nameFR: 'Haïti', continent: 'Amérique', rarityBase: 'Common', flag: '🇭🇹' },
    { code: 'DO', nameFR: 'République Dominicaine', continent: 'Amérique', rarityBase: 'Common', flag: '🇩🇴' },
    { code: 'PR', nameFR: 'Porto Rico', continent: 'Amérique', rarityBase: 'Epic', flag: '🇵🇷' },
    { code: 'TT', nameFR: 'Trinité-et-Tobago', continent: 'Amérique', rarityBase: 'Epic', flag: '🇹🇹' },
    { code: 'BB', nameFR: 'Barbade', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇧' },
    { code: 'GD', nameFR: 'Grenade', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇬🇩' },
    { code: 'VC', nameFR: 'Saint-Vincent-et-les-Grenadines', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇻🇨' },
    { code: 'LC', nameFR: 'Sainte-Lucie', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇱🇨' },
    { code: 'DM', nameFR: 'Dominique', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇩🇲' },
    { code: 'AG', nameFR: 'Antigua-et-Barbuda', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇦🇬' },
    { code: 'KN', nameFR: 'Saint-Kitts-et-Nevis', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇰🇳' },
    { code: 'BS', nameFR: 'Bahamas', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇸' },
    { code: 'CO', nameFR: 'Colombie', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇴' },
    { code: 'VE', nameFR: 'Venezuela', continent: 'Amérique', rarityBase: 'Common', flag: '🇻🇪' },
    { code: 'GY', nameFR: 'Guyana', continent: 'Amérique', rarityBase: 'Epic', flag: '🇬🇾' },
    { code: 'SR', nameFR: 'Suriname', continent: 'Amérique', rarityBase: 'Epic', flag: '🇸🇷' },
    { code: 'EC', nameFR: 'Équateur', continent: 'Amérique', rarityBase: 'Common', flag: '🇪🇨' },
    { code: 'PE', nameFR: 'Pérou', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇪' },
    { code: 'BO', nameFR: 'Bolivie', continent: 'Amérique', rarityBase: 'Common', flag: '🇧🇴' },
    { code: 'BR', nameFR: 'Brésil', continent: 'Amérique', rarityBase: 'Rare', flag: '🇧🇷' },
    { code: 'PY', nameFR: 'Paraguay', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇾' },
    { code: 'UY', nameFR: 'Uruguay', continent: 'Amérique', rarityBase: 'Common', flag: '🇺🇾' },
    { code: 'AR', nameFR: 'Argentine', continent: 'Amérique', rarityBase: 'Rare', flag: '🇦🇷' },
    { code: 'CL', nameFR: 'Chili', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇱' },
    // ═══════════════════════════════════════════════════════════════════
    // OCÉANIE (14 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'AU', nameFR: 'Australie', continent: 'Océanie', rarityBase: 'Rare', flag: '🇦🇺' },
    { code: 'NZ', nameFR: 'Nouvelle-Zélande', continent: 'Océanie', rarityBase: 'Rare', flag: '🇳🇿' },
    { code: 'PG', nameFR: 'Papouasie-Nouvelle-Guinée', continent: 'Océanie', rarityBase: 'Common', flag: '🇵🇬' },
    { code: 'FJ', nameFR: 'Fidji', continent: 'Océanie', rarityBase: 'Epic', flag: '🇫🇯' },
    { code: 'SB', nameFR: 'Îles Salomon', continent: 'Océanie', rarityBase: 'Epic', flag: '🇸🇧' },
    { code: 'VU', nameFR: 'Vanuatu', continent: 'Océanie', rarityBase: 'Epic', flag: '🇻🇺' },
    { code: 'WS', nameFR: 'Samoa', continent: 'Océanie', rarityBase: 'Epic', flag: '🇼🇸' },
    { code: 'TO', nameFR: 'Tonga', continent: 'Océanie', rarityBase: 'Epic', flag: '🇹🇴' },
    { code: 'KI', nameFR: 'Kiribati', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇰🇮' },
    { code: 'FM', nameFR: 'Micronésie', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇫🇲' },
    { code: 'MH', nameFR: 'Îles Marshall', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇲🇭' },
    { code: 'PW', nameFR: 'Palaos', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇵🇼' },
    { code: 'NR', nameFR: 'Nauru', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇳🇷' },
    { code: 'TV', nameFR: 'Tuvalu', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇹🇻' },
];
// Fonction pour obtenir tous les pays
function getAllCountries() {
    return COUNTRIES;
}
// Fonction pour obtenir un pays par code
function getCountryByCode(code) {
    return COUNTRIES.find(c => c.code === code);
}
// Fonction pour obtenir les pays par continent
function getCountriesByContinent(continent) {
    return COUNTRIES.filter(c => c.continent === continent);
}
// Fonction pour obtenir les pays par rareté
function getCountriesByRarity(rarity) {
    return COUNTRIES.filter(c => c.rarityBase === rarity);
}
