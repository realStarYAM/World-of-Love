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
function hashPassword(password: string): string {
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
function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRÉATION DE PROFIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crée un nouveau profil joueur avec les valeurs par défaut
 */
function createNewPlayer(username: string, passwordHash: string): Player {
    return {
        username,
        passwordHash,
        level: 1,
        coins: 500,      // Coins de départ
        gems: 10,        // Gems de départ
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
function signup(username: string, password: string): { success: boolean; message: string } {
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
function login(username: string, password: string): { success: boolean; message: string } {
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
function logout(): void {
    setCurrentUsername(null);
    showToast('Déconnexion réussie !', 'info');
    navigateTo('login');
}

/**
 * Vérifie si un joueur est connecté
 */
function isLoggedIn(): boolean {
    return getCurrentUsername() !== null && loadPlayer() !== null;
}

/**
 * Génère un pack de départ (3 cartes communes)
 */
function generateStarterPack(): Card[] {
    const cards: Card[] = [];
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
function createCard(country: Country, rarity: Rarity): Card {
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
function calculateLovePower(rarity: Rarity, level: number): number {
    const baseValues: Record<Rarity, number> = {
        'Common': 10,
        'Rare': 25,
        'Epic': 50,
        'Legendary': 100,
    };

    const base = baseValues[rarity];
    const multiplier = 1 + (level - 1) * 0.5; // +50% par niveau

    return Math.floor(base * multiplier);
}
