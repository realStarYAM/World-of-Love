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

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & ÉTAT
// ═══════════════════════════════════════════════════════════════════════════

type PageId = 'login' | 'home' | 'collection' | 'shop' | 'missions' | 'profile';

interface UIState {
    currentPage: PageId;
    searchQuery: string;
    filterContinent: Continent | 'all';
    filterRarity: Rarity | 'all';
    filterFavorites: boolean;
    selectedCards: string[];
    packOpening: boolean;
    packCards: Card[];
    loveMatchGame: LoveMatchGame | null;
}

const uiState: UIState = {
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
let modalCloseCallback: (() => void) | null = null;
let profileThemeCategory: UIThemeCategory | 'Tous' = 'Tous';
let profileThemeQuery = '';

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
function getFlagPath(code: string): string {
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
function renderFlagImage(code: string, countryName: string, size: 'normal' | 'mini' | 'large' = 'normal'): string {
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
// HELPERS V1.1
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getCountryTotal(): number {
    return typeof TOTAL_COUNTRIES === 'number' ? TOTAL_COUNTRIES : 196;
}

function getCollectedCountryCount(player: Player): number {
    const collectibleCodes = new Set(getCollectibleCountries().map(country => country.code));
    return player.collection.filter(code => collectibleCodes.has(code)).length;
}

function getCollectionPercent(player: Player): number {
    return Math.min(100, Math.round((getCollectedCountryCount(player) / getCountryTotal()) * 100));
}

function getXpPercent(player: Player): number {
    return Math.min(100, Math.round((player.xp / Math.max(1, player.xpToNextLevel)) * 100));
}

function formatDateTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString(getLang(), {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function renderProgressRing(percent: number, label: string): string {
    return `
        <div class="progress-ring" style="--progress: ${percent}" aria-label="${label}">
            <span>${percent}%</span>
        </div>
    `;
}

function renderAchievementBadge(achievement: AchievementDefinition, player: Player, compact = false): string {
    const unlocked = player.unlockedAchievements.includes(achievement.id);
    const progress = getAchievementProgress(player, achievement);
    const percent = Math.min(100, Math.round((progress / achievement.target) * 100));

    return `
        <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'} tier-${achievement.tier}">
            <div class="achievement-icon" aria-hidden="true">${achievement.icon}</div>
            <div class="achievement-body">
                <h4>${achievement.title}</h4>
                ${compact ? '' : `<p>${achievement.description}</p>`}
                <div class="achievement-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${achievement.target}" aria-valuenow="${progress}">
                    <span style="width: ${percent}%"></span>
                </div>
                <small>${progress}/${achievement.target}${unlocked ? ' · Débloqué' : ''}</small>
            </div>
        </div>
    `;
}

function renderAchievementPreview(player: Player): string {
    const achievements = getAchievementDefinitions();
    const unlocked = achievements.filter(achievement => player.unlockedAchievements.includes(achievement.id));
    const next = achievements.filter(achievement => !player.unlockedAchievements.includes(achievement.id)).slice(0, 2);
    const visible = [...unlocked.slice(-2).reverse(), ...next].slice(0, 4);

    return visible.map(achievement => renderAchievementBadge(achievement, player, true)).join('');
}

function showQueuedAchievementToasts(): void {
    const player = loadPlayer();
    const unlocked = consumeAchievementUnlocks();

    if (!player?.settings.notifications) return;

    unlocked.forEach(achievement => {
        showToast(`Trophée débloqué : ${achievement.title}`, 'success');
    });
}

function applyPlayerPreferences(): void {
    const player = loadPlayer();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduceMotion = player?.settings.reducedMotion || prefersReducedMotion;

    applyUITheme(player?.settings.uiThemeId || DEFAULT_UI_THEME_ID);
    document.documentElement.dataset.theme = player?.settings.darkMode === false ? 'classic' : 'dark';
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
}

function renderThemeSwatches(theme: UITheme): string {
    const swatches = [
        theme.colors.accentPink,
        theme.colors.accentBlue,
        theme.colors.accentPurple,
        theme.colors.accentGold,
    ];

    return swatches.map(color => `<span class="theme-swatch" style="background: ${color}"></span>`).join('');
}

function renderThemeCard(theme: UITheme, activeThemeId: string): string {
    const isActive = theme.id === activeThemeId;
    const tags = theme.tags.slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');

    return `
        <article class="theme-card ${isActive ? 'active' : ''}" data-theme-card="${theme.id}"
            style="
                --theme-preview-bg: ${theme.effects.background};
                --theme-preview-panel: ${theme.effects.panel};
                --theme-preview-button: ${theme.effects.button};
                --theme-preview-text: ${theme.colors.textPrimary};
                --theme-preview-muted: ${theme.colors.textSecondary};
                --theme-preview-border: ${theme.colors.glassBorder};
                --theme-preview-radius: ${theme.corners.md};
            ">
            <div class="theme-preview" aria-hidden="true">
                <div class="theme-preview-top">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="theme-preview-card">
                    <strong></strong>
                    <span></span>
                    <button type="button"></button>
                </div>
            </div>
            <div class="theme-card-copy">
                <strong>${escapeHtml(theme.name)}</strong>
                <span>${escapeHtml(theme.category)}</span>
            </div>
            <div class="theme-swatches" aria-hidden="true">
                ${renderThemeSwatches(theme)}
            </div>
            <div class="theme-tags">${tags}</div>
            <div class="theme-card-actions">
                <button class="btn btn-small btn-secondary theme-preview-btn" data-theme-preview="${theme.id}" type="button">
                    Aperçu
                </button>
                <button class="btn btn-small btn-primary theme-activate-btn" data-theme-activate="${theme.id}" type="button" ${isActive ? 'disabled' : ''}>
                    ${isActive ? 'Actif' : 'Activer'}
                </button>
            </div>
        </article>
    `;
}

function renderThemeSelector(player: Player): string {
    const activeTheme = getUIThemeById(player.settings.uiThemeId);
    const themes = filterUIThemes(profileThemeQuery, profileThemeCategory);
    const filters = getUIThemeFilters();

    return `
        <div class="profile-actions ui-themes-panel" id="ui-themes">
            <div class="section-heading">
                <h3>🎨 Thèmes UI</h3>
                <span>${getUIThemes().length} thèmes</span>
            </div>
            <div class="theme-active-summary">
                <div>
                    <strong>${escapeHtml(activeTheme.name)}</strong>
                    <span>${escapeHtml(activeTheme.category)} · ${escapeHtml(activeTheme.buttonStyle)}</span>
                </div>
                <button class="btn btn-secondary btn-small" id="theme-reset-preview" type="button">Revenir</button>
            </div>
            <div class="theme-toolbar">
                <input
                    id="theme-search"
                    class="theme-search"
                    type="search"
                    inputmode="search"
                    placeholder="Rechercher un thème..."
                    value="${escapeHtml(profileThemeQuery)}"
                    aria-label="Rechercher un thème UI"
                >
                <div class="theme-filters" role="list" aria-label="Filtres de thèmes UI">
                    ${filters.map(filter => `
                        <button
                            class="theme-filter-btn ${profileThemeCategory === filter ? 'active' : ''}"
                            type="button"
                            data-theme-filter="${filter}"
                            role="listitem"
                        >
                            ${escapeHtml(filter)}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="theme-grid" aria-live="polite">
                ${themes.length
            ? themes.map(theme => renderThemeCard(theme, activeTheme.id)).join('')
            : '<p class="theme-empty">Aucun thème trouvé.</p>'}
            </div>
        </div>
    `;
}

function rerenderProfileThemeSelector(container: HTMLElement, focusSearch = false): void {
    renderProfilePage(container);

    if (focusSearch) {
        const input = document.getElementById('theme-search') as HTMLInputElement | null;
        if (input) {
            const cursor = profileThemeQuery.length;
            input.focus();
            input.setSelectionRange(cursor, cursor);
        }
    }
}

function attachThemeSelectorEvents(container: HTMLElement, player: Player): void {
    const searchInput = container.querySelector<HTMLInputElement>('#theme-search');

    searchInput?.addEventListener('input', (event) => {
        profileThemeQuery = (event.target as HTMLInputElement).value;
        rerenderProfileThemeSelector(container, true);
    });

    container.querySelectorAll<HTMLButtonElement>('[data-theme-filter]').forEach(button => {
        button.addEventListener('click', () => {
            profileThemeCategory = button.dataset.themeFilter as UIThemeCategory | 'Tous';
            rerenderProfileThemeSelector(container);
        });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-theme-preview]').forEach(button => {
        button.addEventListener('click', () => {
            const previewTheme = applyUITheme(button.dataset.themePreview || player.settings.uiThemeId);
            document.documentElement.dataset.previewTheme = previewTheme.id;
            showToast(`Aperçu : ${previewTheme.name}`, 'info');
        });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-theme-activate]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = getUIThemeById(button.dataset.themeActivate);
            player.settings.uiThemeId = theme.id;
            savePlayer(player);
            applyPlayerPreferences();
            showToast(`Thème activé : ${theme.name}`, 'success');
            rerenderProfileThemeSelector(container);
        });
    });

    container.querySelector<HTMLButtonElement>('#theme-reset-preview')?.addEventListener('click', () => {
        const theme = applyUITheme(player.settings.uiThemeId);
        delete document.documentElement.dataset.previewTheme;
        showToast(`Thème actuel : ${theme.name}`, 'info');
    });
}

function renderCollectionSummary(player: Player): string {
    const total = getCountryTotal();
    const percent = getCollectionPercent(player);

    return `
        <section class="collection-summary glass-panel" aria-label="Progression de collection">
            ${renderProgressRing(percent, `Collection complétée à ${percent}%`)}
            <div>
                <h3>${getCollectedCountryCount(player)}/${total} pays</h3>
                <p>${percent}% de la collection mondiale complétée</p>
                <div class="collection-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${getCollectedCountryCount(player)}">
                    <span style="width: ${percent}%"></span>
                </div>
            </div>
        </section>
    `;
}

function renderContinentProgress(player: Player): string {
    const continents: Continent[] = ['Europe', 'Afrique', 'Asie', 'Amérique', 'Océanie'];
    const owned = new Set(player.collection);

    return `
        <div class="continent-progress-grid">
            ${continents.map(continent => {
        const countries = getCollectibleCountries().filter(country => country.continent === continent);
        const collected = countries.filter(country => owned.has(country.code)).length;
        const percent = Math.round((collected / countries.length) * 100);

        return `
                    <div class="continent-progress">
                        <span>${continent}</span>
                        <strong>${collected}/${countries.length}</strong>
                        <div class="mini-progress" aria-hidden="true"><span style="width: ${percent}%"></span></div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function renderCountryAlbum(player: Player): string {
    const owned = new Set(player.collection);

    return `
        <details class="country-album glass-panel" open>
            <summary>Album des ${getCountryTotal()} pays</summary>
            <div class="country-album-grid">
                ${getCollectibleCountries().map(country => {
        const unlocked = owned.has(country.code);
        return `
                        <div class="country-chip ${unlocked ? 'unlocked' : 'locked'}" data-code="${country.code}" title="${country.nameFR}">
                            ${unlocked ? renderFlagImage(country.code, country.nameFR, 'mini') : '<span class="locked-dot">?</span>'}
                            <span>${country.nameFR}</span>
                        </div>
                    `;
    }).join('')}
            </div>
        </details>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADUCTION NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Traduit les éléments de navigation selon la langue courante
 */
function translateNavigation(): void {
    // Traduire les items de navigation
    const navTranslations: Record<string, string> = {
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
function initRouter(): void {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

/**
 * Gère le changement de route
 */
function handleRoute(): void {
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

    const validPages: PageId[] = ['login', 'home', 'collection', 'shop', 'missions', 'profile'];
    const page = validPages.includes(hash as PageId) ? hash as PageId : 'home';

    uiState.currentPage = page;
    renderPage(page);
    updateNavActive(page);
}

/**
 * Navigation vers une page
 */
function navigateTo(page: PageId): void {
    window.location.hash = page;
}

/**
 * Met à jour l'élément actif dans la navigation
 */
function updateNavActive(page: PageId): void {
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
function renderPage(page: PageId): void {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

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

function renderLoginPage(container: HTMLElement): void {
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
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        const result = isLogin ? login(username, password) : signup(username, password);

        if (result.success) {
            showToast(result.message, 'success');
            navigateTo('home');
        } else {
            showToast(result.message, 'error');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE ACCUEIL
// ═══════════════════════════════════════════════════════════════════════════

function renderHomePage(container: HTMLElement): void {
    const player = loadPlayer();
    if (!player) return;

    checkAndGenerateDailyMissions(player);
    const dailyAvailable = isDailyRewardAvailable();
    const loveMatchAvail = isLoveMatchAvailable();
    const collectionPercent = getCollectionPercent(player);
    const xpPercent = getXpPercent(player);
    const totalCountries = getCountryTotal();
    const collectedCountries = getCollectedCountryCount(player);

    container.innerHTML = `
        <div class="page-home">
            <section class="welcome-banner hero-panel">
                <div class="hero-copy">
                    <h2>${t('welcome')}, ${escapeHtml(player.username)} !</h2>
                    <p>${t('collectWorld')}</p>
                    <div class="hero-meta">
                        <span>World of Love ${APP_DISPLAY_VERSION}</span>
                        <span>Auto-save · ${formatDateTime(player.lastSavedAt)}</span>
                    </div>
                </div>
                ${renderProgressRing(collectionPercent, `Collection complétée à ${collectionPercent}%`)}
            </section>

            <div class="home-dashboard">
                <section class="level-panel glass-panel">
                    <div class="level-topline">
                        <span>${t('level')} ${player.level}</span>
                        <strong>${player.xp} / ${player.xpToNextLevel} XP</strong>
                    </div>
                    <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${player.xpToNextLevel}" aria-valuenow="${player.xp}">
                        <div class="xp-fill" style="width: ${xpPercent}%"></div>
                    </div>
                    <div class="level-foot">
                        <span>${player.xpTotal} XP total</span>
                        <span>${xpPercent}% vers le niveau ${player.level + 1}</span>
                    </div>
                </section>

                <section class="achievement-preview glass-panel">
                    <div class="section-heading">
                        <h3>Succès & trophées</h3>
                        <span>${player.unlockedAchievements.length}/${getAchievementDefinitions().length}</span>
                    </div>
                    <div class="achievement-preview-grid">
                        ${renderAchievementPreview(player)}
                    </div>
                </section>
            </div>
            
            <div class="stats-cards">
                <div class="stat-card">
                    <span class="stat-icon">🎴</span>
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">${t('cards')}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🌍</span>
                    <span class="stat-value">${collectedCountries}/${totalCountries}</span>
                    <span class="stat-label">${t('collection')} · ${collectionPercent}%</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">${player.level}</span>
                    <span class="stat-label">${t('level')}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🏆</span>
                    <span class="stat-value">${player.unlockedAchievements.length}</span>
                    <span class="stat-label">Trophées</span>
                </div>
            </div>
            
            <div class="action-buttons">
                ${dailyAvailable ? `
                    <button class="btn btn-glow" id="claim-daily" aria-label="Réclamer la récompense quotidienne">
                        🎁 ${t('dailyReward')}
                    </button>
                ` : ''}
                
                <button class="btn btn-primary btn-large" id="quick-pack" aria-label="Ouvrir un pack basic">
                    📦 ${t('openPackBasic')}
                </button>
                
                <button class="btn btn-secondary ${!loveMatchAvail.available ? 'disabled' : ''}" id="play-love-match" aria-label="Jouer à Love Match V2">
                    💘 Love Match V2 ${!loveMatchAvail.available ? `(${Math.ceil(loveMatchAvail.remainingMs / 1000)}s)` : ''}
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
        if (result.success) {
            playSound('reward_coin');
        }
        showToast(result.message, result.success ? 'success' : 'error');
        showQueuedAchievementToasts();
        if (result.success) renderHomePage(container);
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

function renderCollectionPage(container: HTMLElement): void {
    const player = loadPlayer();
    if (!player) return;

    let filteredCards = [...player.deck];

    // Appliquer les filtres
    if (uiState.searchQuery) {
        const query = uiState.searchQuery.toLowerCase();
        filteredCards = filteredCards.filter(c =>
            c.countryName.toLowerCase().includes(query) ||
            c.countryCode.toLowerCase().includes(query)
        );
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
    const totalCountries = getCountryTotal();
    const collectionPercent = getCollectionPercent(player);
    const collectedCountries = getCollectedCountryCount(player);

    container.innerHTML = `
        <div class="page-collection">
            <div class="collection-header">
                <h2>${t('myCollection')}</h2>
                <div class="collection-stats">
                    <span>🎴 ${player.deck.length} ${t('cards')}</span>
                    <span>🌍 ${collectedCountries}/${totalCountries} ${t('countries')} · ${collectionPercent}%</span>
                </div>
            </div>

            ${renderCollectionSummary(player)}
            ${renderContinentProgress(player)}
            
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

            ${renderCountryAlbum(player)}
            
            <div class="cards-grid">
                ${filteredCards.length > 0
            ? filteredCards.map(card => renderCard(card, player.favorites.includes(card.id))).join('')
            : `<p class="no-cards">${t('noCardsFound')}</p>`
        }
            </div>
        </div>
    `;

    // Événements filtres
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        uiState.searchQuery = (e.target as HTMLInputElement).value;
        renderCollectionPage(container);
    });

    document.getElementById('filter-continent')?.addEventListener('change', (e) => {
        uiState.filterContinent = (e.target as HTMLSelectElement).value as Continent | 'all';
        renderCollectionPage(container);
    });

    document.getElementById('filter-rarity')?.addEventListener('change', (e) => {
        uiState.filterRarity = (e.target as HTMLSelectElement).value as Rarity | 'all';
        renderCollectionPage(container);
    });

    document.getElementById('filter-favorites')?.addEventListener('click', () => {
        uiState.filterFavorites = !uiState.filterFavorites;
        renderCollectionPage(container);
    });

    const showFusionsBtn = document.getElementById('show-fusions');
    if (showFusionsBtn) {
        const handleShowFusions = (e: Event) => {
            e.preventDefault();
            showFusionModal(fusablePairs);
        };
        showFusionsBtn.addEventListener('click', handleShowFusions);
        showFusionsBtn.addEventListener('touchstart', handleShowFusions, { passive: false });
    }

    // Événements pays de l'album
    document.querySelectorAll('.country-chip').forEach(chipEl => {
        const handleCountryClick = (e: Event) => {
            e.preventDefault();
            const countryCode = chipEl.getAttribute('data-code');
            if (!countryCode) return;

            // Trouver si le joueur possède cette carte dans son deck
            const ownedCard = player.deck
                .filter(c => c.countryCode === countryCode)
                .sort((a, b) => b.lovePower - a.lovePower || b.level - a.level)[0];

            if (ownedCard) {
                // Débloqué : afficher les détails de la carte
                showCardDetailModal(ownedCard.id);
            } else {
                // Verrouillé : afficher les infos du pays et un message
                const country = getCollectibleCountries().find(c => c.code === countryCode);
                if (country) {
                    showModal(`
                        <div class="country-locked-modal" style="text-align: center; padding: var(--spacing-lg);">
                            <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🔒</div>
                            <h2 style="margin-bottom: var(--spacing-sm);">${country.flag} ${country.nameFR}</h2>
                            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                                Continent : 🌍 ${country.continent}<br>
                                Rareté de base : ${country.rarityBase === 'Common' ? '⚪ Common' : country.rarityBase === 'Rare' ? '🔵 Rare' : country.rarityBase === 'Epic' ? '🟣 Epic' : '🟡 Legendary'}
                            </p>
                            <div style="background: rgba(255,255,255,0.05); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                                <p style="margin: 0; font-size: 0.95rem;">Vous ne possédez pas encore cette carte.</p>
                                <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.85rem; color: var(--text-muted);">Obtenez-la en ouvrant des packs dans la Boutique !</p>
                            </div>
                            <button class="btn btn-primary" onclick="closeModal()" style="min-width: 120px; min-height: 44px; cursor: pointer;">Fermer</button>
                        </div>
                    `);
                }
            }
        };

        chipEl.addEventListener('click', handleCountryClick);
        chipEl.addEventListener('touchstart', handleCountryClick, { passive: false });
    });

    // Événements cartes
    document.querySelectorAll('.card').forEach(cardEl => {
        const openCard = () => {
            const cardId = cardEl.getAttribute('data-id');
            if (cardId) showCardDetailModal(cardId);
        };

        cardEl.addEventListener('click', openCard);
        cardEl.addEventListener('keydown', (event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                keyboardEvent.preventDefault();
                openCard();
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE BOUTIQUE
// ═══════════════════════════════════════════════════════════════════════════

function renderShopPage(container: HTMLElement): void {
    const player = loadPlayer();
    if (!player) return;

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
            const packType = btn.getAttribute('data-pack') as PackType;
            openPackWithAnimation(packType);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE MISSIONS
// ═══════════════════════════════════════════════════════════════════════════

function renderMissionsPage(container: HTMLElement): void {
    const player = loadPlayer();
    if (!player) return;

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
        if (result.success) {
            playSound('reward_coin');
        }
        showToast(result.message, result.success ? 'success' : 'error');
        showQueuedAchievementToasts();
        if (result.success) renderMissionsPage(container);
    });

    document.querySelectorAll('.claim-mission-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const missionId = btn.getAttribute('data-mission');
            if (missionId) {
                const result = claimMissionReward(missionId);
                if (result.success) {
                    playSound('reward_coin');
                }
                showToast(result.message, result.success ? 'success' : 'error');
                showQueuedAchievementToasts();
                if (result.success) renderMissionsPage(container);
            }
        });
    });
}

function renderMission(mission: Mission): string {
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

function getMissionIcon(type: Mission['type']): string {
    const icons: Record<Mission['type'], string> = {
        'open_pack': '📦',
        'fuse_card': '✨',
        'get_rare': '💎',
        'play_game': '🎮',
        'win_game': '🏆',
        'collect': '🌍',
    };
    return icons[type] || '📋';
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE PROFIL
// ═══════════════════════════════════════════════════════════════════════════

function renderProfilePage(container: HTMLElement): void {
    const player = loadPlayer();
    if (!player) return;

    const collectionPercent = getCollectionPercent(player);
    const achievements = getAchievementDefinitions();
    const collectedCountries = getCollectedCountryCount(player);

    container.innerHTML = `
        <div class="page-profile">
            <div class="profile-header">
                <div class="profile-avatar">
                    <span class="avatar-emoji">💕</span>
                </div>
                <div class="profile-info">
                    <h2>${escapeHtml(player.username)}</h2>
                    <span class="profile-level">${t('level')} ${player.level}</span>
                    <span class="profile-date">${new Date(player.createdAt).toLocaleDateString(getLang())}</span>
                    <p class="profile-save-state">Auto-save : ${formatDateTime(player.lastSavedAt)}</p>
                </div>
            </div>
            
            <div class="profile-stats-grid">
                <div class="profile-stat">
                    <span class="stat-value">${player.deck.length}</span>
                    <span class="stat-label">${t('cards')}</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${collectedCountries}</span>
                    <span class="stat-label">${t('collection')} · ${collectionPercent}%</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${player.xpTotal}</span>
                    <span class="stat-label">XP total</span>
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
                <div class="profile-stat">
                    <span class="stat-value">${player.unlockedAchievements.length}/${achievements.length}</span>
                    <span class="stat-label">Trophées</span>
                </div>
            </div>

            <div class="profile-actions achievements-section">
                <div class="section-heading">
                    <h3>🏆 Succès & trophées</h3>
                    <span>${player.unlockedAchievements.length}/${achievements.length}</span>
                </div>
                <div class="achievements-grid">
                    ${achievements.map(achievement => renderAchievementBadge(achievement, player)).join('')}
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
                <p class="settings-note">Sauvegarde locale automatique active. Dernière sauvegarde : ${formatDateTime(player.lastSavedAt)}.</p>
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
                <h3>⚙️ Préférences</h3>
                <div class="settings-list">
                    <label class="toggle-row">
                        <span>Notifications élégantes</span>
                        <input type="checkbox" id="setting-notifications" ${player.settings.notifications ? 'checked' : ''}>
                    </label>
                    <label class="toggle-row">
                        <span>Animations réduites</span>
                        <input type="checkbox" id="setting-motion" ${player.settings.reducedMotion ? 'checked' : ''}>
                    </label>
                    <label class="toggle-row">
                        <span>Mode sombre premium</span>
                        <input type="checkbox" id="setting-dark" ${player.settings.darkMode ? 'checked' : ''}>
                    </label>
                </div>
            </div>

            ${renderThemeSelector(player)}
            
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
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const success = await importSave(file);
            if (success) {
                renderProfilePage(container);
            }
        }
    });

    document.getElementById('lang-select')?.addEventListener('change', (e) => {
        const lang = (e.target as HTMLSelectElement).value;
        if (setLang(lang)) {
            // SFX: changement de langue
            playSound('language_change');
            translateNavigation();
            showToast(t('languageChanged'), 'success');
            renderProfilePage(container);
        }
    });

    document.getElementById('setting-notifications')?.addEventListener('change', (e) => {
        player.settings.notifications = (e.target as HTMLInputElement).checked;
        savePlayer(player);
        showToast(player.settings.notifications ? 'Notifications activées' : 'Notifications désactivées', 'info');
        renderProfilePage(container);
    });

    document.getElementById('setting-motion')?.addEventListener('change', (e) => {
        player.settings.reducedMotion = (e.target as HTMLInputElement).checked;
        savePlayer(player);
        applyPlayerPreferences();
        showToast(player.settings.reducedMotion ? 'Animations réduites' : 'Animations fluides activées', 'info');
        renderProfilePage(container);
    });

    document.getElementById('setting-dark')?.addEventListener('change', (e) => {
        player.settings.darkMode = (e.target as HTMLInputElement).checked;
        savePlayer(player);
        applyPlayerPreferences();
        showToast('Mode sombre premium mis à jour', 'success');
        renderProfilePage(container);
    });

    attachThemeSelectorEvents(container, player);

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDU DES CARTES
// ═══════════════════════════════════════════════════════════════════════════

function renderCard(card: Card, isFavorite: boolean): string {
    return `
        <div class="card rarity-${card.rarity.toLowerCase()}" data-id="${card.id}" role="button" tabindex="0" aria-label="${card.countryName}, ${card.rarity}, niveau ${card.level}, Love Power ${card.lovePower}">
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

function renderMiniCard(card: Card): string {
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

function showModal(content: string, onClose?: () => void, modalClass = ''): void {
    // SFX: ouverture modal
    playSound('ui_open');

    const existing = document.getElementById('modal-overlay');
    if (existing) existing.remove();
    modalCloseCallback = onClose || null;

    const modal = document.createElement('div');
    modal.id = 'modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content ${modalClass}" role="dialog" aria-modal="true">
            <button class="modal-close" aria-label="Fermer">&times;</button>
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
            modalCloseCallback?.();
            modalCloseCallback = null;
        }, 200);
    };

    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function closeModal(): void {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        // SFX: fermeture modal
        playSound('ui_close');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            modalCloseCallback?.();
            modalCloseCallback = null;
        }, 200);
    }
}

function showCardDetailModal(cardId: string): void {
    const player = loadPlayer();
    if (!player) return;

    const card = player.deck.find(c => c.id === cardId);
    if (!card) return;

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
        if (mainContent) renderCollectionPage(mainContent);
        showToast(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris !', 'success');
    });

    const fuseThisBtn = document.getElementById('fuse-this');
    if (fuseThisBtn) {
        const handleFuseThis = (e: Event) => {
            e.preventDefault();
            // Protection anti-double clic
            if (fusionInProgress) return;
            fusionInProgress = true;

            closeModal();
            if (samCards.length > 0) {
                const result = fuseCards(card.id, samCards[0].id);
                if (result.success) {
                    showFusionSuccessModal(result.resultCard!);
                    showQueuedAchievementToasts();
                } else if (!result.silent) {
                    // Afficher le toast uniquement si l'erreur n'est pas silencieuse
                    showToast(result.message, 'error');
                }
            }

            // Réinitialiser après un court délai
            setTimeout(() => { fusionInProgress = false; }, 500);
        };
        fuseThisBtn.addEventListener('click', handleFuseThis);
        fuseThisBtn.addEventListener('touchstart', handleFuseThis, { passive: false });
    }
}

function showFusionModal(pairs?: { card1: Card; card2: Card }[]): void {
    // Toujours recalculer les paires fusionnables pour avoir des données fraîches
    const player = loadPlayer();
    if (!player) return;

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
        const handleFusionBtn = (e: Event) => {
            e.preventDefault();
            // Protection anti-double clic
            if (fusionInProgress) return;
            fusionInProgress = true;

            const item = btn.closest('.fusion-item');
            const card1Id = item?.getAttribute('data-card1');
            const card2Id = item?.getAttribute('data-card2');
            if (card1Id && card2Id) {
                const result = fuseCards(card1Id, card2Id);
                closeModal();
                if (result.success) {
                    showFusionSuccessModal(result.resultCard!);
                    showQueuedAchievementToasts();
                } else if (!result.silent) {
                    // Afficher le toast uniquement si l'erreur n'est pas silencieuse
                    showToast(result.message, 'error');
                }
            }

            // Réinitialiser après un court délai
            setTimeout(() => { fusionInProgress = false; }, 500);
        };
        btn.addEventListener('click', handleFusionBtn);
        btn.addEventListener('touchstart', handleFusionBtn, { passive: false });
    });
}

function showFusionSuccessModal(card: Card): void {
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

function openPackWithAnimation(packType: PackType): void {
    const result = openPack(packType);

    if (!result.success) {
        playSound('error');
        showToast(result.message, 'error');
        return;
    }

    // SFX: ouverture de pack
    playSound('card_pack_open');

    uiState.packOpening = true;
    uiState.packCards = result.cards;

    showModal(`
        <div class="pack-opening pack-opening-v11 ${packType === 'premium' ? 'premium' : 'basic'}">
            <div class="pack-stage" aria-hidden="true">
                <div class="pack-aura"></div>
                <div class="pack-shell">${packType === 'premium' ? '🎁' : '📦'}</div>
            </div>
            <h2>${t('openingPack')}</h2>
            <p class="pack-opening-subtitle">${packType === 'premium' ? 'Pack Premium' : 'Pack Basic'} · ${result.cards.length} cartes révélées</p>
            <div class="pack-cards-reveal">
                ${result.cards.map((card, i) => `
                    <div class="pack-card-wrapper" style="--delay: ${i * 0.2}s">
                        <div class="pack-card-flipper">
                            <div class="pack-card-back">
                                <span>💕</span>
                            </div>
                            <div class="pack-card-front card rarity-${card.rarity.toLowerCase()}">
                                <div class="card-inner">
                                    <div class="card-flag">${renderFlagImage(card.countryCode, card.countryName, 'mini')}</div>
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
            <button class="btn btn-primary pack-continue-btn" id="close-pack">${t('continue')}</button>
        </div>
    `, () => {
        uiState.packOpening = false;
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            renderPage(uiState.currentPage);
        }
    }, 'modal-pack-opening');

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
    showQueuedAchievementToasts();
}

// ═══════════════════════════════════════════════════════════════════════════
// LOVE MATCH (MINI-JEU)
// ═══════════════════════════════════════════════════════════════════════════

function startLoveMatchGame(): void {
    const result = startLoveMatch();

    if (!result.success || !result.game) {
        showToast(result.message, 'error');
        return;
    }

    uiState.loveMatchGame = result.game;

    showModal(`
        <div class="love-match-game love-match-v2">
            <div class="love-match-header">
                <span class="love-match-badge">V2</span>
                <h2>💘 Love Match</h2>
                <p>${t('clickBestLovePower')}</p>
            </div>
            <div class="love-match-rule">
                <span>Objectif</span>
                <strong>Trouver la Love Power la plus élevée</strong>
            </div>
            <div class="love-match-cards">
                ${result.game.cards.map((card, i) => `
                    <div class="love-match-card card rarity-${card.rarity.toLowerCase()}" data-index="${i}" role="button" tabindex="0" aria-label="Choix ${i + 1}, ${card.countryName}, rareté ${card.rarity}">
                        <span class="choice-number">#${i + 1}</span>
                        <div class="card-inner">
                            <div class="card-flag">${renderFlagImage(card.countryCode, card.countryName, 'mini')}</div>
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
        const chooseCard = () => {
            const index = parseInt(cardEl.getAttribute('data-index') || '0');
            handleLoveMatchChoice(index);
        };

        cardEl.addEventListener('click', chooseCard);
        cardEl.addEventListener('keydown', (event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                keyboardEvent.preventDefault();
                chooseCard();
            }
        });
    });
}

function handleLoveMatchChoice(chosenIndex: number): void {
    const result = submitLoveMatchAnswer(chosenIndex);

    if (!result.success) {
        showToast(result.message, 'error');
        return;
    }

    // Révéler toutes les Love Power
    if (uiState.loveMatchGame) {
        document.querySelectorAll('.love-match-card').forEach((cardEl, i) => {
            const card = uiState.loveMatchGame!.cards[i];
            cardEl.classList.add('answered');
            const lovePowerEl = cardEl.querySelector('.love-power');
            if (lovePowerEl) {
                lovePowerEl.textContent = `💕 ${card.lovePower}`;
            }

            if (i === uiState.loveMatchGame!.correctIndex) {
                cardEl.classList.add('correct');
            } else if (i === chosenIndex && !result.correct) {
                cardEl.classList.add('wrong');
            } else if (i === chosenIndex) {
                cardEl.classList.add('selected');
            }
        });
    }

    // SFX: victoire ou échec
    playSound(result.correct ? 'victory' : 'match_fail');

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
        showQueuedAchievementToasts();
    }, 1500);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOASTS (NOTIFICATIONS)
// ═══════════════════════════════════════════════════════════════════════════

type ToastType = 'success' | 'error' | 'info' | 'warning';

function showToast(message: string, type: ToastType = 'info'): void {
    const container = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const icons: Record<ToastType, string> = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
    };

    const labels: Record<ToastType, string> = {
        success: 'Succès',
        error: 'Erreur',
        info: 'Info',
        warning: 'Attention',
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-content">
            <strong>${labels[type]}</strong>
            <span class="toast-message">${escapeHtml(message)}</span>
        </span>
        <button class="toast-close" aria-label="Fermer la notification">&times;</button>
    `;

    container.appendChild(toast);

    // Animation d'entrée
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);

    toast.querySelector('.toast-close')?.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    });
}

function createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION UI
// ═══════════════════════════════════════════════════════════════════════════

function initUI(): void {
    applyPlayerPreferences();

    // Événements navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        const handleNav = (e: Event) => {
            e.preventDefault();
            playSound('ui_click');
            const page = item.getAttribute('data-page') as PageId;
            if (page) navigateTo(page);
        };
        item.addEventListener('click', handleNav);
        item.addEventListener('touchstart', handleNav, { passive: false });
    });

    // Initialiser le router
    initRouter();

    // Traduire la navigation selon la langue courante
    translateNavigation();

    window.addEventListener('wol:autosave', () => {
        document.body.classList.add('autosaved');
        setTimeout(() => document.body.classList.remove('autosaved'), 900);
    });
}

// Exposer closeModal globalement pour les onclick inline
(window as any).closeModal = closeModal;
