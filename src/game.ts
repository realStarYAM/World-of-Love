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

const PACK_BASIC_COST = 100;       // Coût en coins
const PACK_BASIC_CARDS = 3;        // Nombre de cartes
const PACK_PREMIUM_COST = 30;      // Coût en gems
const PACK_PREMIUM_CARDS = 5;      // Nombre de cartes

const LOVE_MATCH_COOLDOWN = 30000; // 30 secondes
const LOVE_MATCH_REWARD_COINS = 25;
const LOVE_MATCH_REWARD_XP = 15;
const LOVE_MATCH_PENALTY = 5;

// Probabilités des raretés (en pourcentage)
const RARITY_PROBS_BASIC: Record<Rarity, number> = {
    'Common': 75,
    'Rare': 20,
    'Epic': 4,
    'Legendary': 1,
};

const RARITY_PROBS_PREMIUM: Record<Rarity, number> = {
    'Common': 55,
    'Rare': 30,
    'Epic': 12,
    'Legendary': 3,
};

const XP_PER_LEVEL_BASE = 100;
const XP_LEVEL_MULTIPLIER = 1.5;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTÈME DE PACKS
// ═══════════════════════════════════════════════════════════════════════════

type PackType = 'basic' | 'premium';

interface PackResult {
    success: boolean;
    message: string;
    cards: Card[];
}

/**
 * Ouvre un pack et retourne les cartes obtenues
 */
function openPack(packType: PackType): PackResult {
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
    } else {
        if (player.gems < PACK_PREMIUM_COST) {
            return { success: false, message: `Pas assez de gems ! (${PACK_PREMIUM_COST} requis)`, cards: [] };
        }
        player.gems -= PACK_PREMIUM_COST;
    }

    // Générer les cartes
    const numCards = packType === 'basic' ? PACK_BASIC_CARDS : PACK_PREMIUM_CARDS;
    const probs = packType === 'basic' ? RARITY_PROBS_BASIC : RARITY_PROBS_PREMIUM;
    const cards: Card[] = [];

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
function generateRandomCard(probs: Record<Rarity, number>): Card {
    // Tirer la rareté
    const rarity = rollRarity(probs);

    // Choisir un pays de cette rareté (ou proche)
    const country = pickRandomCountry(rarity);

    return createCard(country, rarity);
}

/**
 * Tire une rareté selon les probabilités
 */
function rollRarity(probs: Record<Rarity, number>): Rarity {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, prob] of Object.entries(probs) as [Rarity, number][]) {
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
function pickRandomCountry(preferredRarity: Rarity): Country {
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

// ═══════════════════════════════════════════════════════════════════════════
// SYSTÈME DE FUSION
// ═══════════════════════════════════════════════════════════════════════════

interface FuseResult {
    success: boolean;
    message: string;
    resultCard?: Card;
    silent?: boolean; // Pour les erreurs techniques qui ne doivent pas afficher de toast
}

/**
 * Fusionne deux cartes identiques pour augmenter le niveau
 */
function fuseCards(cardId1: string, cardId2: string): FuseResult {
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
function findFusablePairs(player: Player): { card1: Card; card2: Card }[] {
    const pairs: { card1: Card; card2: Card }[] = [];
    const processed = new Set<string>();

    for (const card1 of player.deck) {
        if (card1.level >= 5) continue; // Déjà max
        if (processed.has(card1.id)) continue;

        for (const card2 of player.deck) {
            if (card1.id === card2.id) continue;
            if (processed.has(card2.id)) continue;
            if (card1.countryCode !== card2.countryCode) continue;

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

const MISSION_TEMPLATES: Omit<Mission, 'id' | 'progress' | 'completed'>[] = [
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
function checkAndGenerateDailyMissions(player: Player): void {
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
function generateDailyMissions(): Mission[] {
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
function updateMissionProgress(player: Player, type: Mission['type'], amount: number): void {
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
function claimMissionReward(missionId: string): { success: boolean; message: string } {
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
function claimDailyReward(): { success: boolean; message: string; reward?: { coins: number; gems: number } } {
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
function isDailyRewardAvailable(): boolean {
    const player = loadPlayer();
    if (!player) return false;

    return player.lastDailyRewardDate !== getTodayDateString();
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI-JEU "LOVE MATCH"
// ═══════════════════════════════════════════════════════════════════════════

interface LoveMatchGame {
    cards: Card[];
    correctIndex: number;
    isActive: boolean;
}

let currentLoveMatch: LoveMatchGame | null = null;

/**
 * Vérifie si Love Match est disponible (cooldown)
 */
function isLoveMatchAvailable(): { available: boolean; remainingMs: number } {
    const player = loadPlayer();
    if (!player) return { available: false, remainingMs: 0 };

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
function startLoveMatch(): { success: boolean; message: string; game?: LoveMatchGame } {
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
    const cards: Card[] = [];
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
function submitLoveMatchAnswer(chosenIndex: number): {
    success: boolean;
    correct: boolean;
    message: string;
    correctCard?: Card;
} {
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
    } else {
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
function addXp(player: Player, amount: number): boolean {
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
function toggleFavorite(cardId: string): boolean {
    const player = loadPlayer();
    if (!player) return false;

    const index = player.favorites.indexOf(cardId);
    if (index === -1) {
        player.favorites.push(cardId);
    } else {
        player.favorites.splice(index, 1);
    }

    savePlayer(player);
    return index === -1; // Retourne true si ajouté aux favoris
}

/**
 * Vérifie si une carte est en favoris
 */
function isFavorite(cardId: string): boolean {
    const player = loadPlayer();
    if (!player) return false;
    return player.favorites.includes(cardId);
}
