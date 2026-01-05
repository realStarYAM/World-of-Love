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
    { type: 'open_pack', description: 'missionOpenPack', target: 1, rewardCoins: 50, rewardXp: 20 },
    { type: 'open_pack', description: 'missionOpenPack2', target: 2, rewardCoins: 100, rewardXp: 40 },
    { type: 'fuse_card', description: 'missionFuse', target: 1, rewardCoins: 75, rewardXp: 30 },
    { type: 'get_rare', description: 'missionGetRare', target: 1, rewardCoins: 60, rewardXp: 25 },
    { type: 'play_game', description: 'missionPlayGame', target: 2, rewardCoins: 40, rewardXp: 20 },
    { type: 'play_game', description: 'missionWinGame', target: 1, rewardCoins: 80, rewardXp: 35 },
    { type: 'collect', description: 'missionCollect', target: 3, rewardCoins: 100, rewardXp: 50 },
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
            message: `${t('bravo')} +${LOVE_MATCH_REWARD_COINS} ${t('coins')}, +${LOVE_MATCH_REWARD_XP} XP !`,
            correctCard: currentLoveMatch.cards[currentLoveMatch.correctIndex]
        };
    }
    else {
        player.coins = Math.max(0, player.coins - LOVE_MATCH_PENALTY);
        savePlayer(player);
        return {
            success: true,
            correct: false,
            message: `${t('tooBAd')} -${LOVE_MATCH_PENALTY} ${t('coins')}.`,
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
const I18N_TRANSLATIONS = {
    fr: {
        welcome: "Bienvenue",
        collect: "Collecter",
        cards: "Cartes",
        collection: "Collection",
        level: "Niveau",
        dailyReward: "Récompense quotidienne",
        openPack: "Ouvrir un paquet",
        loveMatch: "Love Match",
        shop: "Boutique",
        missions: "Missions",
        profile: "Profil",
        save: "Sauvegarder",
        export: "Exporter",
        import: "Importer",
        languageChanged: "Langue modifiée",
        logout: "Déconnexion",
        coins: "Pièces",
        gems: "Gemmes",
        packsOpened: "Paquets ouverts",
        gamesPlayed: "Parties jouées",
        victories: "Victoires",
        fusions: "Fusions",
        install: "Installer",
        loading: "Chargement...",
        loadingBlocked: "Chargement bloqué",
        reload: "Recharger",
        debugMode: "Mode debug",
        collectWorld: "Collectionnez les 196 pays du monde !",
        recentCards: "Dernières cartes obtenues",
        searchCountry: "Rechercher un pays...",
        allContinents: "Tous les continents",
        allRarities: "Toutes les raretés",
        fusionsPossible: "fusion(s) possible(s)",
        fuse: "Fusionner",
        noCardsFound: "Aucune carte trouvée.",
        packBasic: "Pack Basic",
        packPremium: "Pack Premium",
        randomCards: "cartes aléatoires",
        betterChances: "cartes + meilleures chances",
        tips: "Conseils",
        tipPremium: "Les packs Premium ont 3x plus de chances d'obtenir des cartes Legendary !",
        tipFuse: "Fusionnez vos doublons pour augmenter la Love Power de vos cartes.",
        tipMissions: "Complétez les missions quotidiennes pour gagner des récompenses.",
        dailyMissions: "Missions Quotidiennes",
        claimRewards: "Réclamez vos récompenses journalières !",
        alreadyClaimed: "Déjà réclamée aujourd'hui.",
        comeBackTomorrow: "Revenez demain !",
        claim: "Réclamer",
        myCollection: "Ma Collection",
        countries: "pays",
        home: "Accueil",
        login: "Connexion",
        signup: "Inscription",
        openPackBasic: "Ouvrir un Pack Basic",
        language: "Langue",
        clickBestLovePower: "Cliquez sur la carte avec la meilleure Love Power !",
        bravo: "Bravo !",
        tooBAd: "Dommage !",
        correctAnswer: "La bonne réponse était",
        openingPack: "Ouverture du pack...",
        continue: "Continuer",
        close: "Fermer",
        ok: "OK",
        missionGetRare: "Obtenir une carte Rare+",
        missionOpenPack: "Ouvrir 1 pack",
        missionPlayGame: "Jouer 2 parties de Love Match",
        missionFuse: "Fusionner une carte",
        missionCollect: "Collecter 3 nouveaux pays",
        missionOpenPack2: "Ouvrir 2 packs",
        missionWinGame: "Gagner 1 partie de Love Match",
        packOpened: "Pack ouvert !",
        newCard: "Nouvelle carte !",
        duplicate: "Doublon"
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
        logout: "Logout",
        coins: "Coins",
        gems: "Gems",
        packsOpened: "Packs opened",
        gamesPlayed: "Games played",
        victories: "Victories",
        fusions: "Fusions",
        install: "Install",
        loading: "Loading...",
        loadingBlocked: "Loading blocked",
        reload: "Reload",
        debugMode: "Debug mode",
        collectWorld: "Collect all 196 countries!",
        recentCards: "Recent cards",
        searchCountry: "Search country...",
        allContinents: "All continents",
        allRarities: "All rarities",
        fusionsPossible: "fusion(s) available",
        fuse: "Fuse",
        noCardsFound: "No cards found.",
        packBasic: "Basic Pack",
        packPremium: "Premium Pack",
        randomCards: "random cards",
        betterChances: "cards + better chances",
        tips: "Tips",
        tipPremium: "Premium packs have 3x better chances for Legendary cards!",
        tipFuse: "Fuse duplicates to increase your cards' Love Power.",
        tipMissions: "Complete daily missions to earn rewards.",
        dailyMissions: "Daily Missions",
        claimRewards: "Claim your daily rewards!",
        alreadyClaimed: "Already claimed today.",
        comeBackTomorrow: "Come back tomorrow!",
        claim: "Claim",
        myCollection: "My Collection",
        countries: "countries",
        home: "Home",
        login: "Login",
        signup: "Sign Up",
        openPackBasic: "Open Basic Pack",
        language: "Language",
        clickBestLovePower: "Click on the card with the highest Love Power!",
        bravo: "Well done!",
        tooBAd: "Too bad!",
        correctAnswer: "The correct answer was",
        openingPack: "Opening pack...",
        continue: "Continue",
        close: "Close",
        ok: "OK",
        missionGetRare: "Get a Rare+ card",
        missionOpenPack: "Open 1 pack",
        missionPlayGame: "Play 2 Love Match games",
        missionFuse: "Fuse a card",
        missionCollect: "Collect 3 new countries",
        missionOpenPack2: "Open 2 packs",
        missionWinGame: "Win 1 Love Match game",
        packOpened: "Pack opened!",
        newCard: "New card!",
        duplicate: "Duplicate"
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
        logout: "ログアウト",
        coins: "コイン",
        gems: "ジェム",
        packsOpened: "開封済みパック",
        gamesPlayed: "プレイ回数",
        victories: "勝利",
        fusions: "合成",
        install: "インストール",
        loading: "読み込み中...",
        loadingBlocked: "読み込みがブロックされました",
        reload: "再読み込み",
        debugMode: "デバッグモード",
        collectWorld: "196カ国を集めよう！",
        recentCards: "最近入手したカード",
        searchCountry: "国を検索...",
        allContinents: "すべての大陸",
        allRarities: "すべてのレアリティ",
        fusionsPossible: "件の合成可能",
        fuse: "合成する",
        noCardsFound: "カードが見つかりません",
        packBasic: "ベーシックパック",
        packPremium: "プレミアムパック",
        randomCards: "ランダムカード",
        betterChances: "カード + 高確率",
        tips: "ヒント",
        tipPremium: "プレミアムパックはレジェンダリーが3倍出やすい！",
        tipFuse: "重複カードを合成してラブパワーをアップ",
        tipMissions: "デイリーミッションで報酬をゲット",
        dailyMissions: "デイリーミッション",
        claimRewards: "報酬を受け取ろう！",
        alreadyClaimed: "本日受取済み",
        comeBackTomorrow: "明日また来てね！",
        claim: "受け取る",
        myCollection: "マイコレクション",
        countries: "カ国",
        home: "ホーム",
        login: "ログイン",
        signup: "新規登録",
        openPackBasic: "ベーシックパックを開く",
        language: "言語",
        clickBestLovePower: "最高のラブパワーを持つカードをクリック！",
        bravo: "おめでとう！",
        tooBAd: "残念！",
        correctAnswer: "正解は",
        openingPack: "パック開封中...",
        continue: "続ける",
        close: "閉じる",
        ok: "OK",
        missionGetRare: "レア以上のカードを入手",
        missionOpenPack: "パックを1つ開ける",
        missionPlayGame: "ラブマッチを2回プレイ",
        missionFuse: "カードを1枚合成",
        missionCollect: "新しい国を3つ収集",
        missionOpenPack2: "パックを2つ開ける",
        missionWinGame: "ラブマッチで1勝",
        packOpened: "パック開封！",
        newCard: "新しいカード！",
        duplicate: "重複"
    },
    es: {
        welcome: "Bienvenido",
        collect: "Coleccionar",
        cards: "Cartas",
        collection: "Colección",
        level: "Nivel",
        dailyReward: "Recompensa diaria",
        openPack: "Abrir paquete",
        loveMatch: "Love Match",
        shop: "Tienda",
        missions: "Misiones",
        profile: "Perfil",
        save: "Guardar",
        export: "Exportar",
        import: "Importar",
        languageChanged: "Idioma cambiado",
        logout: "Cerrar sesión",
        coins: "Monedas",
        gems: "Gemas",
        packsOpened: "Paquetes abiertos",
        gamesPlayed: "Partidas jugadas",
        victories: "Victorias",
        fusions: "Fusiones",
        install: "Instalar",
        loading: "Cargando...",
        loadingBlocked: "Carga bloqueada",
        reload: "Recargar",
        debugMode: "Modo depuración",
        collectWorld: "¡Colecciona los 196 países!",
        recentCards: "Cartas recientes",
        searchCountry: "Buscar país...",
        allContinents: "Todos los continentes",
        allRarities: "Todas las rarezas",
        fusionsPossible: "fusión(es) disponible(s)",
        fuse: "Fusionar",
        noCardsFound: "No se encontraron cartas.",
        packBasic: "Pack Básico",
        packPremium: "Pack Premium",
        randomCards: "cartas aleatorias",
        betterChances: "cartas + mejores chances",
        tips: "Consejos",
        tipPremium: "¡Los packs Premium tienen 3x más chances de Legendarias!",
        tipFuse: "Fusiona duplicados para aumentar el Love Power.",
        tipMissions: "Completa misiones diarias para ganar recompensas.",
        dailyMissions: "Misiones Diarias",
        claimRewards: "¡Reclama tus recompensas!",
        alreadyClaimed: "Ya reclamada hoy.",
        comeBackTomorrow: "¡Vuelve mañana!",
        claim: "Reclamar",
        myCollection: "Mi Colección",
        countries: "países",
        home: "Inicio",
        login: "Iniciar sesión",
        signup: "Registrarse",
        openPackBasic: "Abrir Pack Básico",
        language: "Idioma",
        clickBestLovePower: "¡Haz clic en la carta con mayor Love Power!",
        bravo: "¡Bien hecho!",
        tooBAd: "¡Lástima!",
        correctAnswer: "La respuesta correcta era",
        openingPack: "Abriendo pack...",
        continue: "Continuar",
        close: "Cerrar",
        ok: "OK",
        missionGetRare: "Obtener carta Rara+",
        missionOpenPack: "Abrir 1 pack",
        missionPlayGame: "Jugar 2 partidas de Love Match",
        missionFuse: "Fusionar una carta",
        missionCollect: "Coleccionar 3 países nuevos",
        missionOpenPack2: "Abrir 2 packs",
        missionWinGame: "Ganar 1 partida de Love Match",
        packOpened: "¡Pack abierto!",
        newCard: "¡Nueva carta!",
        duplicate: "Duplicada"
    },
    pt: {
        welcome: "Bem-vindo",
        collect: "Coletar",
        cards: "Cartas",
        collection: "Coleção",
        level: "Nível",
        dailyReward: "Recompensa diária",
        openPack: "Abrir pacote",
        loveMatch: "Love Match",
        shop: "Loja",
        missions: "Missões",
        profile: "Perfil",
        save: "Salvar",
        export: "Exportar",
        import: "Importar",
        languageChanged: "Idioma alterado",
        logout: "Sair",
        coins: "Moedas",
        gems: "Gemas",
        packsOpened: "Pacotes abertos",
        gamesPlayed: "Partidas jogadas",
        victories: "Vitórias",
        fusions: "Fusões",
        install: "Instalar",
        loading: "Carregando...",
        loadingBlocked: "Carregamento bloqueado",
        reload: "Recarregar",
        debugMode: "Modo depuração",
        collectWorld: "Colecione os 196 países!",
        recentCards: "Cartas recentes",
        searchCountry: "Buscar país...",
        allContinents: "Todos os continentes",
        allRarities: "Todas as raridades",
        fusionsPossible: "fusão(ões) disponível(is)",
        fuse: "Fundir",
        noCardsFound: "Nenhuma carta encontrada.",
        packBasic: "Pack Básico",
        packPremium: "Pack Premium",
        randomCards: "cartas aleatórias",
        betterChances: "cartas + melhores chances",
        tips: "Dicas",
        tipPremium: "Packs Premium têm 3x mais chances de Lendárias!",
        tipFuse: "Funda duplicatas para aumentar o Love Power.",
        tipMissions: "Complete missões diárias para ganhar recompensas.",
        dailyMissions: "Missões Diárias",
        claimRewards: "Resgate suas recompensas!",
        alreadyClaimed: "Já resgatada hoje.",
        comeBackTomorrow: "Volte amanhã!",
        claim: "Resgatar",
        myCollection: "Minha Coleção",
        countries: "países",
        home: "Início",
        login: "Entrar",
        signup: "Cadastrar",
        openPackBasic: "Abrir Pack Básico",
        language: "Idioma",
        clickBestLovePower: "Clique na carta com maior Love Power!",
        bravo: "Parabéns!",
        tooBAd: "Que pena!",
        correctAnswer: "A resposta correta era",
        openingPack: "Abrindo pack...",
        continue: "Continuar",
        close: "Fechar",
        ok: "OK",
        missionGetRare: "Obter carta Rara+",
        missionOpenPack: "Abrir 1 pack",
        missionPlayGame: "Jogar 2 partidas de Love Match",
        missionFuse: "Fundir uma carta",
        missionCollect: "Coletar 3 novos países",
        missionOpenPack2: "Abrir 2 packs",
        missionWinGame: "Vencer 1 partida de Love Match",
        packOpened: "Pack aberto!",
        newCard: "Nova carta!",
        duplicate: "Duplicata"
    },
    it: {
        welcome: "Benvenuto",
        collect: "Colleziona",
        cards: "Carte",
        collection: "Collezione",
        level: "Livello",
        dailyReward: "Premio giornaliero",
        openPack: "Apri pacchetto",
        loveMatch: "Love Match",
        shop: "Negozio",
        missions: "Missioni",
        profile: "Profilo",
        save: "Salva",
        export: "Esporta",
        import: "Importa",
        languageChanged: "Lingua cambiata",
        logout: "Esci",
        coins: "Monete",
        gems: "Gemme",
        packsOpened: "Pacchetti aperti",
        gamesPlayed: "Partite giocate",
        victories: "Vittorie",
        fusions: "Fusioni",
        install: "Installa",
        loading: "Caricamento...",
        loadingBlocked: "Caricamento bloccato",
        reload: "Ricarica",
        debugMode: "Modalità debug",
        collectWorld: "Colleziona tutti i 196 paesi!",
        recentCards: "Carte recenti",
        searchCountry: "Cerca paese...",
        allContinents: "Tutti i continenti",
        allRarities: "Tutte le rarità",
        fusionsPossible: "fusione(i) disponibile(i)",
        fuse: "Fondi",
        noCardsFound: "Nessuna carta trovata.",
        packBasic: "Pack Base",
        packPremium: "Pack Premium",
        randomCards: "carte casuali",
        betterChances: "carte + probabilità migliori",
        tips: "Consigli",
        tipPremium: "I pack Premium hanno 3x probabilità di Leggendarie!",
        tipFuse: "Fondi i duplicati per aumentare il Love Power.",
        tipMissions: "Completa missioni giornaliere per ottenere ricompense.",
        dailyMissions: "Missioni Giornaliere",
        claimRewards: "Riscatta le tue ricompense!",
        alreadyClaimed: "Già riscattato oggi.",
        comeBackTomorrow: "Torna domani!",
        claim: "Riscatta",
        myCollection: "La Mia Collezione",
        countries: "paesi",
        home: "Home",
        login: "Accedi",
        signup: "Registrati",
        openPackBasic: "Apri Pack Base",
        language: "Lingua",
        clickBestLovePower: "Clicca sulla carta con il Love Power più alto!",
        bravo: "Ottimo!",
        tooBAd: "Peccato!",
        correctAnswer: "La risposta corretta era",
        openingPack: "Apertura pack...",
        continue: "Continua",
        close: "Chiudi",
        ok: "OK",
        missionGetRare: "Ottieni carta Rara+",
        missionOpenPack: "Apri 1 pack",
        missionPlayGame: "Gioca 2 partite di Love Match",
        missionFuse: "Fondi una carta",
        missionCollect: "Colleziona 3 nuovi paesi",
        missionOpenPack2: "Apri 2 pack",
        missionWinGame: "Vinci 1 partita di Love Match",
        packOpened: "Pack aperto!",
        newCard: "Nuova carta!",
        duplicate: "Duplicato"
    },
    de: {
        welcome: "Willkommen",
        collect: "Sammeln",
        cards: "Karten",
        collection: "Sammlung",
        level: "Stufe",
        dailyReward: "Tägliche Belohnung",
        openPack: "Paket öffnen",
        loveMatch: "Love Match",
        shop: "Laden",
        missions: "Missionen",
        profile: "Profil",
        save: "Speichern",
        export: "Exportieren",
        import: "Importieren",
        languageChanged: "Sprache geändert",
        logout: "Abmelden",
        coins: "Münzen",
        gems: "Edelsteine",
        packsOpened: "Geöffnete Pakete",
        gamesPlayed: "Gespielte Spiele",
        victories: "Siege",
        fusions: "Fusionen",
        install: "Installieren",
        loading: "Laden...",
        loadingBlocked: "Laden blockiert",
        reload: "Neu laden",
        debugMode: "Debug-Modus",
        collectWorld: "Sammle alle 196 Länder!",
        recentCards: "Letzte Karten",
        searchCountry: "Land suchen...",
        allContinents: "Alle Kontinente",
        allRarities: "Alle Seltenheiten",
        fusionsPossible: "Fusion(en) verfügbar",
        fuse: "Fusionieren",
        noCardsFound: "Keine Karten gefunden.",
        packBasic: "Basis-Paket",
        packPremium: "Premium-Paket",
        randomCards: "zufällige Karten",
        betterChances: "Karten + bessere Chancen",
        tips: "Tipps",
        tipPremium: "Premium-Pakete haben 3x höhere Chancen auf Legendäre!",
        tipFuse: "Fusioniere Duplikate um Love Power zu erhöhen.",
        tipMissions: "Schließe tägliche Missionen ab für Belohnungen.",
        dailyMissions: "Tägliche Missionen",
        claimRewards: "Hole deine Belohnungen ab!",
        alreadyClaimed: "Heute schon abgeholt.",
        comeBackTomorrow: "Komm morgen wieder!",
        claim: "Abholen",
        myCollection: "Meine Sammlung",
        countries: "Länder",
        home: "Startseite",
        login: "Anmelden",
        signup: "Registrieren",
        openPackBasic: "Basis-Paket öffnen",
        language: "Sprache",
        clickBestLovePower: "Klicke auf die Karte mit der höchsten Love Power!",
        bravo: "Super!",
        tooBAd: "Schade!",
        correctAnswer: "Die richtige Antwort war",
        openingPack: "Paket wird geöffnet...",
        continue: "Weiter",
        close: "Schließen",
        ok: "OK",
        missionGetRare: "Eine Rare+ Karte erhalten",
        missionOpenPack: "1 Paket öffnen",
        missionPlayGame: "2 Love Match Spiele spielen",
        missionFuse: "Eine Karte fusionieren",
        missionCollect: "3 neue Länder sammeln",
        missionOpenPack2: "2 Pakete öffnen",
        missionWinGame: "1 Love Match gewinnen",
        packOpened: "Paket geöffnet!",
        newCard: "Neue Karte!",
        duplicate: "Duplikat"
    },
    nl: {
        welcome: "Welkom",
        collect: "Verzamelen",
        cards: "Kaarten",
        collection: "Collectie",
        level: "Niveau",
        dailyReward: "Dagelijkse beloning",
        openPack: "Pakket openen",
        loveMatch: "Love Match",
        shop: "Winkel",
        missions: "Missies",
        profile: "Profiel",
        save: "Opslaan",
        export: "Exporteren",
        import: "Importeren",
        languageChanged: "Taal gewijzigd",
        logout: "Uitloggen",
        coins: "Munten",
        gems: "Edelstenen",
        packsOpened: "Geopende pakketten",
        gamesPlayed: "Gespeelde spellen",
        victories: "Overwinningen",
        fusions: "Fusies",
        install: "Installeren",
        loading: "Laden...",
        loadingBlocked: "Laden geblokkeerd",
        reload: "Herladen",
        debugMode: "Debugmodus",
        collectWorld: "Verzamel alle 196 landen!",
        recentCards: "Recente kaarten",
        searchCountry: "Land zoeken...",
        allContinents: "Alle continenten",
        allRarities: "Alle zeldzaamheden",
        fusionsPossible: "fusie(s) beschikbaar",
        fuse: "Fuseren",
        noCardsFound: "Geen kaarten gevonden.",
        packBasic: "Basispakket",
        packPremium: "Premium Pakket",
        randomCards: "willekeurige kaarten",
        betterChances: "kaarten + betere kansen",
        tips: "Tips",
        tipPremium: "Premium pakketten hebben 3x meer kans op Legendarische!",
        tipFuse: "Fuseer duplicaten om Love Power te verhogen.",
        tipMissions: "Voltooi dagelijkse missies voor beloningen.",
        dailyMissions: "Dagelijkse Missies",
        claimRewards: "Claim je beloningen!",
        alreadyClaimed: "Vandaag al geclaimd.",
        comeBackTomorrow: "Kom morgen terug!",
        claim: "Claimen",
        myCollection: "Mijn Collectie",
        countries: "landen",
        home: "Home",
        login: "Inloggen",
        signup: "Registreren",
        openPackBasic: "Basispakket openen",
        language: "Taal",
        clickBestLovePower: "Klik op de kaart met de hoogste Love Power!",
        bravo: "Goed gedaan!",
        tooBAd: "Jammer!",
        correctAnswer: "Het juiste antwoord was",
        openingPack: "Pakket openen...",
        continue: "Doorgaan",
        close: "Sluiten",
        ok: "OK",
        missionGetRare: "Zeldzame+ kaart krijgen",
        missionOpenPack: "1 pakket openen",
        missionPlayGame: "2 Love Match spellen spelen",
        missionFuse: "Een kaart fuseren",
        missionCollect: "3 nieuwe landen verzamelen",
        missionOpenPack2: "2 pakketten openen",
        missionWinGame: "1 Love Match winnen",
        packOpened: "Pakket geopend!",
        newCard: "Nieuwe kaart!",
        duplicate: "Duplicaat"
    },
    ru: {
        welcome: "Добро пожаловать",
        collect: "Собрать",
        cards: "Карты",
        collection: "Коллекция",
        level: "Уровень",
        dailyReward: "Ежедневная награда",
        openPack: "Открыть набор",
        loveMatch: "Love Match",
        shop: "Магазин",
        missions: "Миссии",
        profile: "Профиль",
        save: "Сохранить",
        export: "Экспорт",
        import: "Импорт",
        languageChanged: "Язык изменён",
        logout: "Выйти",
        coins: "Монеты",
        gems: "Камни",
        packsOpened: "Открыто наборов",
        gamesPlayed: "Сыграно игр",
        victories: "Победы",
        fusions: "Слияния",
        install: "Установить",
        loading: "Загрузка...",
        loadingBlocked: "Загрузка заблокирована",
        reload: "Перезагрузить",
        debugMode: "Режим отладки",
        collectWorld: "Собери все 196 стран!",
        recentCards: "Последние карты",
        searchCountry: "Поиск страны...",
        allContinents: "Все континенты",
        allRarities: "Все редкости",
        fusionsPossible: "слияний доступно",
        fuse: "Слить",
        noCardsFound: "Карты не найдены.",
        packBasic: "Базовый набор",
        packPremium: "Премиум набор",
        randomCards: "случайные карты",
        betterChances: "карты + шансы выше",
        tips: "Советы",
        tipPremium: "Премиум наборы имеют 3x шанс на Легендарные!",
        tipFuse: "Сливайте дубликаты для повышения Love Power.",
        tipMissions: "Выполняйте ежедневные миссии для наград.",
        dailyMissions: "Ежедневные миссии",
        claimRewards: "Получите награды!",
        alreadyClaimed: "Уже получено сегодня.",
        comeBackTomorrow: "Возвращайтесь завтра!",
        claim: "Получить",
        myCollection: "Моя коллекция",
        countries: "стран",
        home: "Главная",
        login: "Войти",
        signup: "Регистрация",
        openPackBasic: "Открыть базовый набор",
        language: "Язык",
        clickBestLovePower: "Нажмите на карту с наибольшей Love Power!",
        bravo: "Отлично!",
        tooBAd: "Жаль!",
        correctAnswer: "Правильный ответ был",
        openingPack: "Открытие набора...",
        continue: "Продолжить",
        close: "Закрыть",
        ok: "OK",
        missionGetRare: "Получить Rare+ карту",
        missionOpenPack: "Открыть 1 набор",
        missionPlayGame: "Сыграть 2 игры Love Match",
        missionFuse: "Слить карту",
        missionCollect: "Собрать 3 новые страны",
        missionOpenPack2: "Открыть 2 набора",
        missionWinGame: "Выиграть 1 игру Love Match",
        packOpened: "Набор открыт!",
        newCard: "Новая карта!",
        duplicate: "Дубликат"
    },
    uk: {
        welcome: "Ласкаво просимо",
        collect: "Зібрати",
        cards: "Карти",
        collection: "Колекція",
        level: "Рівень",
        dailyReward: "Щоденна нагорода",
        openPack: "Відкрити набір",
        loveMatch: "Love Match",
        shop: "Магазин",
        missions: "Місії",
        profile: "Профіль",
        save: "Зберегти",
        export: "Експорт",
        import: "Імпорт",
        languageChanged: "Мову змінено",
        logout: "Вийти",
        coins: "Монети",
        gems: "Самоцвіти",
        packsOpened: "Відкрито наборів",
        gamesPlayed: "Зіграно ігор",
        victories: "Перемоги",
        fusions: "Злиття",
        install: "Встановити",
        loading: "Завантаження...",
        loadingBlocked: "Завантаження заблоковано",
        reload: "Перезавантажити",
        debugMode: "Режим налагодження"
    },
    pl: {
        welcome: "Witaj",
        collect: "Zbieraj",
        cards: "Karty",
        collection: "Kolekcja",
        level: "Poziom",
        dailyReward: "Codzienna nagroda",
        openPack: "Otwórz paczkę",
        loveMatch: "Love Match",
        shop: "Sklep",
        missions: "Misje",
        profile: "Profil",
        save: "Zapisz",
        export: "Eksportuj",
        import: "Importuj",
        languageChanged: "Język zmieniony",
        logout: "Wyloguj",
        coins: "Monety",
        gems: "Klejnoty",
        packsOpened: "Otwarte paczki",
        gamesPlayed: "Rozegrane gry",
        victories: "Zwycięstwa",
        fusions: "Fuzje",
        install: "Zainstaluj",
        loading: "Ładowanie...",
        loadingBlocked: "Ładowanie zablokowane",
        reload: "Przeładuj",
        debugMode: "Tryb debugowania"
    },
    tr: {
        welcome: "Hoş geldiniz",
        collect: "Topla",
        cards: "Kartlar",
        collection: "Koleksiyon",
        level: "Seviye",
        dailyReward: "Günlük ödül",
        openPack: "Paket aç",
        loveMatch: "Love Match",
        shop: "Mağaza",
        missions: "Görevler",
        profile: "Profil",
        save: "Kaydet",
        export: "Dışa aktar",
        import: "İçe aktar",
        languageChanged: "Dil değiştirildi",
        logout: "Çıkış",
        coins: "Altın",
        gems: "Mücevher",
        packsOpened: "Açılan paketler",
        gamesPlayed: "Oynanan oyunlar",
        victories: "Zaferler",
        fusions: "Birleştirmeler",
        install: "Yükle",
        loading: "Yükleniyor...",
        loadingBlocked: "Yükleme engellendi",
        reload: "Yeniden yükle",
        debugMode: "Hata ayıklama modu"
    },
    ar: {
        welcome: "مرحباً",
        collect: "اجمع",
        cards: "بطاقات",
        collection: "مجموعة",
        level: "المستوى",
        dailyReward: "المكافأة اليومية",
        openPack: "افتح الحزمة",
        loveMatch: "Love Match",
        shop: "المتجر",
        missions: "المهام",
        profile: "الملف الشخصي",
        save: "حفظ",
        export: "تصدير",
        import: "استيراد",
        languageChanged: "تم تغيير اللغة",
        logout: "تسجيل الخروج",
        coins: "عملات",
        gems: "جواهر",
        packsOpened: "الحزم المفتوحة",
        gamesPlayed: "الألعاب الملعوبة",
        victories: "الانتصارات",
        fusions: "الدمج",
        install: "تثبيت",
        loading: "جاري التحميل...",
        loadingBlocked: "التحميل محظور",
        reload: "إعادة التحميل",
        debugMode: "وضع التصحيح",
        collectWorld: "اجمع جميع الـ196 دولة!",
        recentCards: "البطاقات الأخيرة",
        searchCountry: "ابحث عن دولة...",
        allContinents: "جميع القارات",
        allRarities: "جميع الندرات",
        fusionsPossible: "دمج متاح",
        fuse: "دمج",
        noCardsFound: "لم يتم العثور على بطاقات.",
        packBasic: "حزمة أساسية",
        packPremium: "حزمة مميزة",
        randomCards: "بطاقات عشوائية",
        betterChances: "بطاقات + فرص أفضل",
        tips: "نصائح",
        tipPremium: "الحزم المميزة لديها 3 أضعاف فرصة الحصول على الأسطورية!",
        tipFuse: "ادمج المكررات لزيادة قوة الحب.",
        tipMissions: "أكمل المهام اليومية للحصول على المكافآت.",
        dailyMissions: "المهام اليومية",
        claimRewards: "اطلب مكافآتك!",
        alreadyClaimed: "تم المطالبة اليوم.",
        comeBackTomorrow: "عد غداً!",
        claim: "مطالبة",
        myCollection: "مجموعتي",
        countries: "دول",
        home: "الرئيسية",
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        openPackBasic: "افتح حزمة أساسية",
        language: "اللغة",
        clickBestLovePower: "انقر على البطاقة ذات أعلى قوة حب!",
        bravo: "أحسنت!",
        tooBAd: "للأسف!",
        correctAnswer: "الإجابة الصحيحة كانت",
        openingPack: "جاري فتح الحزمة...",
        continue: "متابعة",
        close: "إغلاق",
        ok: "حسناً",
        missionGetRare: "احصل على بطاقة نادرة+",
        missionOpenPack: "افتح حزمة واحدة",
        missionPlayGame: "العب مباراتين من Love Match",
        missionFuse: "ادمج بطاقة",
        missionCollect: "اجمع 3 دول جديدة",
        missionOpenPack2: "افتح حزمتين",
        missionWinGame: "افز بمباراة Love Match",
        packOpened: "تم فتح الحزمة!",
        newCard: "بطاقة جديدة!",
        duplicate: "مكرر"
    },
    hi: {
        welcome: "स्वागत है",
        collect: "इकट्ठा करें",
        cards: "कार्ड",
        collection: "संग्रह",
        level: "स्तर",
        dailyReward: "दैनिक पुरस्कार",
        openPack: "पैक खोलें",
        loveMatch: "Love Match",
        shop: "दुकान",
        missions: "मिशन",
        profile: "प्रोफ़ाइल",
        save: "सहेजें",
        export: "निर्यात",
        import: "आयात",
        languageChanged: "भाषा बदली गई",
        logout: "लॉग आउट",
        coins: "सिक्के",
        gems: "रत्न",
        packsOpened: "खोले गए पैक",
        gamesPlayed: "खेले गए गेम",
        victories: "जीत",
        fusions: "फ्यूज़न",
        install: "इंस्टॉल करें",
        loading: "लोड हो रहा है...",
        loadingBlocked: "लोडिंग अवरुद्ध",
        reload: "रीलोड करें",
        debugMode: "डीबग मोड"
    },
    bn: {
        welcome: "স্বাগতম",
        collect: "সংগ্রহ করুন",
        cards: "কার্ড",
        collection: "সংগ্রহ",
        level: "স্তর",
        dailyReward: "দৈনিক পুরস্কার",
        openPack: "প্যাক খুলুন",
        loveMatch: "Love Match",
        shop: "দোকান",
        missions: "মিশন",
        profile: "প্রোফাইল",
        save: "সংরক্ষণ",
        export: "রপ্তানি",
        import: "আমদানি",
        languageChanged: "ভাষা পরিবর্তন হয়েছে",
        logout: "লগ আউট",
        coins: "কয়েন",
        gems: "রত্ন",
        packsOpened: "খোলা প্যাক",
        gamesPlayed: "খেলা হয়েছে",
        victories: "জয়",
        fusions: "ফিউশন",
        install: "ইনস্টল করুন",
        loading: "লোড হচ্ছে...",
        loadingBlocked: "লোডিং ব্লক হয়েছে",
        reload: "রিলোড করুন",
        debugMode: "ডিবাগ মোড"
    },
    id: {
        welcome: "Selamat datang",
        collect: "Kumpulkan",
        cards: "Kartu",
        collection: "Koleksi",
        level: "Level",
        dailyReward: "Hadiah harian",
        openPack: "Buka paket",
        loveMatch: "Love Match",
        shop: "Toko",
        missions: "Misi",
        profile: "Profil",
        save: "Simpan",
        export: "Ekspor",
        import: "Impor",
        languageChanged: "Bahasa diubah",
        logout: "Keluar",
        coins: "Koin",
        gems: "Permata",
        packsOpened: "Paket dibuka",
        gamesPlayed: "Game dimainkan",
        victories: "Kemenangan",
        fusions: "Fusi",
        install: "Instal",
        loading: "Memuat...",
        loadingBlocked: "Pemuatan diblokir",
        reload: "Muat ulang",
        debugMode: "Mode debug"
    },
    th: {
        welcome: "ยินดีต้อนรับ",
        collect: "สะสม",
        cards: "การ์ด",
        collection: "คอลเลกชัน",
        level: "ระดับ",
        dailyReward: "รางวัลประจำวัน",
        openPack: "เปิดแพ็ค",
        loveMatch: "Love Match",
        shop: "ร้านค้า",
        missions: "ภารกิจ",
        profile: "โปรไฟล์",
        save: "บันทึก",
        export: "ส่งออก",
        import: "นำเข้า",
        languageChanged: "เปลี่ยนภาษาแล้ว",
        logout: "ออกจากระบบ",
        coins: "เหรียญ",
        gems: "อัญมณี",
        packsOpened: "แพ็คที่เปิด",
        gamesPlayed: "เกมที่เล่น",
        victories: "ชัยชนะ",
        fusions: "การรวม",
        install: "ติดตั้ง",
        loading: "กำลังโหลด...",
        loadingBlocked: "การโหลดถูกบล็อก",
        reload: "โหลดใหม่",
        debugMode: "โหมดดีบัก"
    },
    vi: {
        welcome: "Chào mừng",
        collect: "Thu thập",
        cards: "Thẻ bài",
        collection: "Bộ sưu tập",
        level: "Cấp độ",
        dailyReward: "Phần thưởng hàng ngày",
        openPack: "Mở gói",
        loveMatch: "Love Match",
        shop: "Cửa hàng",
        missions: "Nhiệm vụ",
        profile: "Hồ sơ",
        save: "Lưu",
        export: "Xuất",
        import: "Nhập",
        languageChanged: "Đã đổi ngôn ngữ",
        logout: "Đăng xuất",
        coins: "Xu",
        gems: "Đá quý",
        packsOpened: "Gói đã mở",
        gamesPlayed: "Ván đã chơi",
        victories: "Chiến thắng",
        fusions: "Hợp nhất",
        install: "Cài đặt",
        loading: "Đang tải...",
        loadingBlocked: "Tải bị chặn",
        reload: "Tải lại",
        debugMode: "Chế độ gỡ lỗi"
    },
    ko: {
        welcome: "환영합니다",
        collect: "수집",
        cards: "카드",
        collection: "컬렉션",
        level: "레벨",
        dailyReward: "일일 보상",
        openPack: "팩 열기",
        loveMatch: "Love Match",
        shop: "상점",
        missions: "미션",
        profile: "프로필",
        save: "저장",
        export: "내보내기",
        import: "가져오기",
        languageChanged: "언어가 변경되었습니다",
        logout: "로그아웃",
        coins: "코인",
        gems: "보석",
        packsOpened: "열린 팩",
        gamesPlayed: "플레이한 게임",
        victories: "승리",
        fusions: "합성",
        install: "설치",
        loading: "로딩 중...",
        loadingBlocked: "로딩 차단됨",
        reload: "새로고침",
        debugMode: "디버그 모드"
    },
    zh: {
        welcome: "欢迎",
        collect: "收集",
        cards: "卡牌",
        collection: "收藏",
        level: "等级",
        dailyReward: "每日奖励",
        openPack: "开启卡包",
        loveMatch: "Love Match",
        shop: "商店",
        missions: "任务",
        profile: "个人资料",
        save: "保存",
        export: "导出",
        import: "导入",
        languageChanged: "语言已更改",
        logout: "退出登录",
        coins: "金币",
        gems: "宝石",
        packsOpened: "已开卡包",
        gamesPlayed: "已玩游戏",
        victories: "胜利",
        fusions: "合成",
        install: "安装",
        loading: "加载中...",
        loadingBlocked: "加载被阻止",
        reload: "重新加载",
        debugMode: "调试模式",
        collectWorld: "收集全部196个国家！",
        recentCards: "最近获得的卡牌",
        searchCountry: "搜索国家...",
        allContinents: "所有大洲",
        allRarities: "所有稀有度",
        fusionsPossible: "可合成",
        fuse: "合成",
        noCardsFound: "未找到卡牌。",
        packBasic: "基础卡包",
        packPremium: "高级卡包",
        randomCards: "张随机卡牌",
        betterChances: "张卡牌 + 更高几率",
        tips: "提示",
        tipPremium: "高级卡包获得传说卡的几率提高3倍！",
        tipFuse: "合成重复卡牌来提升爱之力量。",
        tipMissions: "完成每日任务获得奖励。",
        dailyMissions: "每日任务",
        claimRewards: "领取奖励！",
        alreadyClaimed: "今天已领取。",
        comeBackTomorrow: "明天再来！",
        claim: "领取",
        myCollection: "我的收藏",
        countries: "个国家",
        home: "首页",
        login: "登录",
        signup: "注册",
        openPackBasic: "开启基础卡包",
        language: "语言",
        clickBestLovePower: "点击爱之力量最高的卡牌！",
        bravo: "太棒了！",
        tooBAd: "可惜！",
        correctAnswer: "正确答案是",
        openingPack: "正在开启卡包...",
        continue: "继续",
        close: "关闭",
        ok: "确定",
        missionGetRare: "获得稀有+卡牌",
        missionOpenPack: "开启1个卡包",
        missionPlayGame: "玩2局Love Match",
        missionFuse: "合成一张卡牌",
        missionCollect: "收集3个新国家",
        missionOpenPack2: "开启2个卡包",
        missionWinGame: "赢1局Love Match",
        packOpened: "卡包已开启！",
        newCard: "新卡牌！",
        duplicate: "重复"
    },
    zh_tw: {
        welcome: "歡迎",
        collect: "收集",
        cards: "卡牌",
        collection: "收藏",
        level: "等級",
        dailyReward: "每日獎勵",
        openPack: "開啟卡包",
        loveMatch: "Love Match",
        shop: "商店",
        missions: "任務",
        profile: "個人資料",
        save: "儲存",
        export: "匯出",
        import: "匯入",
        languageChanged: "語言已變更",
        logout: "登出",
        coins: "金幣",
        gems: "寶石",
        packsOpened: "已開卡包",
        gamesPlayed: "已玩遊戲",
        victories: "勝利",
        fusions: "合成",
        install: "安裝",
        loading: "載入中...",
        loadingBlocked: "載入被阻止",
        reload: "重新載入",
        debugMode: "除錯模式"
    },
    fa: {
        welcome: "خوش آمدید",
        collect: "جمع‌آوری",
        cards: "کارت‌ها",
        collection: "مجموعه",
        level: "سطح",
        dailyReward: "پاداش روزانه",
        openPack: "باز کردن بسته",
        loveMatch: "Love Match",
        shop: "فروشگاه",
        missions: "ماموریت‌ها",
        profile: "پروفایل",
        save: "ذخیره",
        export: "خروجی",
        import: "ورودی",
        languageChanged: "زبان تغییر کرد",
        logout: "خروج",
        coins: "سکه",
        gems: "جواهر",
        packsOpened: "بسته‌های باز شده",
        gamesPlayed: "بازی‌های انجام شده",
        victories: "پیروزی‌ها",
        fusions: "ادغام‌ها",
        install: "نصب",
        loading: "در حال بارگذاری...",
        loadingBlocked: "بارگذاری مسدود شد",
        reload: "بارگذاری مجدد",
        debugMode: "حالت اشکال‌زدایی"
    },
    ur: {
        welcome: "خوش آمدید",
        collect: "جمع کریں",
        cards: "کارڈز",
        collection: "مجموعہ",
        level: "سطح",
        dailyReward: "روزانہ انعام",
        openPack: "پیک کھولیں",
        loveMatch: "Love Match",
        shop: "دکان",
        missions: "مشن",
        profile: "پروفائل",
        save: "محفوظ کریں",
        export: "برآمد",
        import: "درآمد",
        languageChanged: "زبان تبدیل ہو گئی",
        logout: "لاگ آؤٹ",
        coins: "سکے",
        gems: "جواہرات",
        packsOpened: "کھولے گئے پیک",
        gamesPlayed: "کھیلے گئے گیمز",
        victories: "فتوحات",
        fusions: "فیوژن",
        install: "انسٹال کریں",
        loading: "لوڈ ہو رہا ہے...",
        loadingBlocked: "لوڈنگ بلاک",
        reload: "دوبارہ لوڈ کریں",
        debugMode: "ڈیبگ موڈ"
    },
    sw: {
        welcome: "Karibu",
        collect: "Kusanya",
        cards: "Kadi",
        collection: "Mkusanyiko",
        level: "Kiwango",
        dailyReward: "Tuzo ya kila siku",
        openPack: "Fungua pakiti",
        loveMatch: "Love Match",
        shop: "Duka",
        missions: "Misheni",
        profile: "Wasifu",
        save: "Hifadhi",
        export: "Hamisha nje",
        import: "Ingiza",
        languageChanged: "Lugha imebadilishwa",
        logout: "Ondoka",
        coins: "Sarafu",
        gems: "Vito",
        packsOpened: "Pakiti zilizofunguliwa",
        gamesPlayed: "Michezo iliyochezwa",
        victories: "Ushindi",
        fusions: "Muungano",
        install: "Sakinisha",
        loading: "Inapakia...",
        loadingBlocked: "Upakiaji umezuiwa",
        reload: "Pakia upya",
        debugMode: "Hali ya utatuzi"
    },
    tl: {
        welcome: "Maligayang pagdating",
        collect: "Mangolekta",
        cards: "Mga card",
        collection: "Koleksyon",
        level: "Antas",
        dailyReward: "Araw-araw na gantimpala",
        openPack: "Buksan ang pack",
        loveMatch: "Love Match",
        shop: "Tindahan",
        missions: "Mga misyon",
        profile: "Profile",
        save: "I-save",
        export: "I-export",
        import: "Mag-import",
        languageChanged: "Nabago ang wika",
        logout: "Mag-logout",
        coins: "Coins",
        gems: "Gems",
        packsOpened: "Mga binuksan na pack",
        gamesPlayed: "Mga nilaro",
        victories: "Mga panalo",
        fusions: "Mga fusion",
        install: "I-install",
        loading: "Naglo-load...",
        loadingBlocked: "Na-block ang pag-load",
        reload: "I-reload",
        debugMode: "Debug mode"
    }
};
const I18N_LANG_META = {
    fr: { name: "Français", nameEn: "French", rtl: false },
    en: { name: "English", nameEn: "English", rtl: false },
    ja: { name: "日本語", nameEn: "Japanese", rtl: false },
    es: { name: "Español", nameEn: "Spanish", rtl: false },
    pt: { name: "Português", nameEn: "Portuguese", rtl: false },
    it: { name: "Italiano", nameEn: "Italian", rtl: false },
    de: { name: "Deutsch", nameEn: "German", rtl: false },
    nl: { name: "Nederlands", nameEn: "Dutch", rtl: false },
    ru: { name: "Русский", nameEn: "Russian", rtl: false },
    uk: { name: "Українська", nameEn: "Ukrainian", rtl: false },
    pl: { name: "Polski", nameEn: "Polish", rtl: false },
    tr: { name: "Türkçe", nameEn: "Turkish", rtl: false },
    ar: { name: "العربية", nameEn: "Arabic", rtl: true },
    hi: { name: "हिन्दी", nameEn: "Hindi", rtl: false },
    bn: { name: "বাংলা", nameEn: "Bengali", rtl: false },
    id: { name: "Bahasa Indonesia", nameEn: "Indonesian", rtl: false },
    th: { name: "ไทย", nameEn: "Thai", rtl: false },
    vi: { name: "Tiếng Việt", nameEn: "Vietnamese", rtl: false },
    ko: { name: "한국어", nameEn: "Korean", rtl: false },
    zh: { name: "中文简体", nameEn: "Chinese Simplified", rtl: false },
    zh_tw: { name: "中文繁體", nameEn: "Chinese Traditional", rtl: false },
    fa: { name: "فارسی", nameEn: "Persian", rtl: true },
    ur: { name: "اردو", nameEn: "Urdu", rtl: true },
    sw: { name: "Kiswahili", nameEn: "Swahili", rtl: false },
    tl: { name: "Filipino", nameEn: "Filipino", rtl: false }
};
const I18N_STORAGE_KEY = "wol_lang";
const I18N_DEFAULT_LANG = "fr";
let i18nCurrentLang = I18N_DEFAULT_LANG;
function i18nIsValidLang(code) {
    return code in I18N_TRANSLATIONS;
}
function i18nApplyDirection() {
    const meta = I18N_LANG_META[i18nCurrentLang];
    if (meta) {
        document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
        document.documentElement.lang = i18nCurrentLang;
    }
}
function i18nInit() {
    try {
        const saved = localStorage.getItem(I18N_STORAGE_KEY);
        if (saved && i18nIsValidLang(saved)) {
            i18nCurrentLang = saved;
        }
        else {
            const browserLang = navigator.language.split("-")[0];
            if (i18nIsValidLang(browserLang)) {
                i18nCurrentLang = browserLang;
            }
        }
    }
    catch (e) { }
    i18nApplyDirection();
}
function t(key) {
    const translations = I18N_TRANSLATIONS[i18nCurrentLang];
    if (translations && key in translations) {
        return translations[key];
    }
    if (i18nCurrentLang !== "en" && I18N_TRANSLATIONS.en && key in I18N_TRANSLATIONS.en) {
        return I18N_TRANSLATIONS.en[key];
    }
    return key;
}
function setLang(lang) {
    if (!i18nIsValidLang(lang)) {
        return false;
    }
    i18nCurrentLang = lang;
    try {
        localStorage.setItem(I18N_STORAGE_KEY, i18nCurrentLang);
    }
    catch (e) { }
    i18nApplyDirection();
    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang: i18nCurrentLang } }));
    return true;
}
function getLang() {
    return i18nCurrentLang;
}
function getAvailableLangs() {
    return Object.keys(I18N_TRANSLATIONS);
}
function getLangMeta(lang) {
    return I18N_LANG_META[lang] || null;
}
function isRtl() {
    const meta = I18N_LANG_META[i18nCurrentLang];
    return meta ? meta.rtl : false;
}
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
// TRADUCTION NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Traduit les éléments de navigation selon la langue courante
 */
function translateNavigation() {
    // Traduire les items de navigation
    const navTranslations = {
        'home': t('home'),
        'collection': t('collection'),
        'shop': t('shop'),
        'missions': t('missions'),
        'profile': t('profile')
    };
    document.querySelectorAll('.nav-item').forEach(item => {
        const page = item.getAttribute('data-page');
        if (page && navTranslations[page]) {
            const textEl = item.querySelector('.nav-text');
            if (textEl) {
                textEl.textContent = navTranslations[page];
            }
        }
    });
    // Traduire le bouton d'installation
    const installText = document.querySelector('.install-text');
    if (installText) {
        installText.textContent = t('install');
    }
    // Traduire le texte de chargement
    const loadingText = document.querySelector('.loading p');
    if (loadingText) {
        loadingText.textContent = t('loading');
    }
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
                <h2>${t('welcome')}, ${player.username} ! 💕</h2>
                <p>${t('collectWorld')}</p>
            </div>
            
            <div class="stats-cards">
                <div class="stat-card">
                    <span class="stat-icon">🎴</span>
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">${t('cards')}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🌍</span>
                    <span class="stat-value">${player.collection.length}/196</span>
                    <span class="stat-label">${t('collection')}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">${player.level}</span>
                    <span class="stat-label">${t('level')}</span>
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
                        🎁 ${t('dailyReward')}
                    </button>
                ` : ''}
                
                <button class="btn btn-primary btn-large" id="quick-pack">
                    📦 ${t('openPackBasic')}
                </button>
                
                <button class="btn btn-secondary ${!loveMatchAvail.available ? 'disabled' : ''}" id="play-love-match">
                    💘 ${t('loveMatch')} ${!loveMatchAvail.available ? `(${Math.ceil(loveMatchAvail.remainingMs / 1000)}s)` : ''}
                </button>
            </div>
            
            <div class="recent-cards">
                <h3>${t('recentCards')}</h3>
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
                <h2>${t('myCollection')}</h2>
                <div class="collection-stats">
                    <span>🎴 ${player.deck.length} ${t('cards')}</span>
                    <span>🌍 ${player.collection.length}/196 ${t('countries')}</span>
                </div>
            </div>
            
            <div class="collection-filters">
                <div class="search-box">
                    <input type="text" id="search-input" placeholder="🔍 ${t('searchCountry')}" value="${uiState.searchQuery}">
                </div>
                
                <div class="filter-row">
                    <select id="filter-continent">
                        <option value="all">${t('allContinents')}</option>
                        <option value="Europe" ${uiState.filterContinent === 'Europe' ? 'selected' : ''}>🌍 Europe</option>
                        <option value="Afrique" ${uiState.filterContinent === 'Afrique' ? 'selected' : ''}>🌍 Afrique</option>
                        <option value="Asie" ${uiState.filterContinent === 'Asie' ? 'selected' : ''}>🌏 Asie</option>
                        <option value="Amérique" ${uiState.filterContinent === 'Amérique' ? 'selected' : ''}>🌎 Amérique</option>
                        <option value="Océanie" ${uiState.filterContinent === 'Océanie' ? 'selected' : ''}>🏝️ Océanie</option>
                    </select>
                    
                    <select id="filter-rarity">
                        <option value="all">${t('allRarities')}</option>
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
                    <span>✨ ${fusablePairs.length} ${t('fusionsPossible')} !</span>
                    <button class="btn btn-small btn-glow" id="show-fusions">${t('fuse')}</button>
                </div>
            ` : ''}
            
            <div class="cards-grid">
                ${filteredCards.length > 0
        ? filteredCards.map(card => renderCard(card, player.favorites.includes(card.id))).join('')
        : `<p class="no-cards">${t('noCardsFound')}</p>`}
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
                <h2>${t('shop')}</h2>
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
                        <h3>${t('packBasic')}</h3>
                        <p class="pack-desc">3 ${t('randomCards')}</p>
                        <div class="pack-chances">
                            <span>⚪ 75%</span>
                            <span>🔵 20%</span>
                            <span>🟣 4%</span>
                            <span>🟡 1%</span>
                        </div>
                        <button class="btn btn-primary ${player.coins < 100 ? 'disabled' : ''}" data-pack="basic">
                            🪙 100 ${t('coins')}
                        </button>
                    </div>
                </div>
                
                <div class="pack-card pack-premium">
                    <div class="pack-glow"></div>
                    <div class="pack-content">
                        <div class="pack-icon">🎁</div>
                        <h3>${t('packPremium')}</h3>
                        <p class="pack-desc">5 ${t('betterChances')}</p>
                        <div class="pack-chances">
                            <span>⚪ 55%</span>
                            <span>🔵 30%</span>
                            <span>🟣 12%</span>
                            <span>🟡 3%</span>
                        </div>
                        <button class="btn btn-glow ${player.gems < 30 ? 'disabled' : ''}" data-pack="premium">
                            💎 30 ${t('gems')}
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="shop-info">
                <h3>💡 ${t('tips')}</h3>
                <ul>
                    <li>${t('tipPremium')}</li>
                    <li>${t('tipFuse')}</li>
                    <li>${t('tipMissions')}</li>
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
                <h2>${t('dailyMissions')}</h2>
                <p class="missions-date">📅 ${new Date().toLocaleDateString(getLang(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            
            ${dailyAvailable ? `
                <div class="daily-reward-card">
                    <div class="reward-icon">🎁</div>
                    <div class="reward-info">
                        <h3>${t('dailyReward')}</h3>
                        <p>${t('claimRewards')}</p>
                    </div>
                    <button class="btn btn-glow" id="claim-daily-mission">${t('claim')}</button>
                </div>
            ` : `
                <div class="daily-reward-card claimed">
                    <div class="reward-icon">✅</div>
                    <div class="reward-info">
                        <h3>${t('dailyReward')}</h3>
                        <p>${t('alreadyClaimed')} ${t('comeBackTomorrow')}</p>
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
                <h4>${t(mission.description)}</h4>
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
                    ${t('claim')}
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
                    <span class="profile-level">${t('level')} ${player.level}</span>
                    <span class="profile-date">${new Date(player.createdAt).toLocaleDateString(getLang())}</span>
                </div>
            </div>
            
            <div class="profile-stats-grid">
                <div class="profile-stat">
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">${t('cards')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.collection.length}</span>
                    <span class="stat-label">${t('collection')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.packsOpened}</span>
                    <span class="stat-label">${t('packsOpened')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.cardsFused}</span>
                    <span class="stat-label">${t('fusions')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.gamesPlayed}</span>
                    <span class="stat-label">${t('gamesPlayed')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.stats.gamesWon}</span>
                    <span class="stat-label">${t('victories')}</span>
                </div>
            </div>
            
            <div class="profile-resources">
                <div class="resource">
                    <span class="resource-icon">🪙</span>
                    <span class="resource-value">${player.coins}</span>
                    <span class="resource-label">${t('coins')}</span>
                </div>
                <div class="resource">
                    <span class="resource-icon">💎</span>
                    <span class="resource-value">${player.gems}</span>
                    <span class="resource-label">${t('gems')}</span>
                </div>
            </div>
            
            <div class="profile-actions">
                <h3>💾 ${t('save')}</h3>
                <div class="action-row">
                    <button class="btn btn-secondary" id="export-save">
                        📤 ${t('export')}
                    </button>
                    <label class="btn btn-secondary">
                        📥 ${t('import')}
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
                🚪 ${t('logout')}
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
            translateNavigation();
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
            <h2>📦 ${t('openingPack')}</h2>
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
            <button class="btn btn-primary" id="close-pack" style="margin-top: 20px;">${t('continue')}</button>
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
            <p>${t('clickBestLovePower')}</p>
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
                <h2>${result.correct ? t('bravo') : t('tooBAd')}</h2>
                <p>${result.message}</p>
                ${result.correctCard ? `
                    <p>${t('correctAnswer')} : <strong>${result.correctCard.countryName}</strong> (💕 ${result.correctCard.lovePower})</p>
                ` : ''}
                <button class="btn btn-primary" onclick="closeModal()">${t('ok')}</button>
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
    // Traduire la navigation selon la langue courante
    translateNavigation();
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
