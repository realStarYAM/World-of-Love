/**
 * World of Love — Card Game
 * Gestionnaire de sons (SFX)
 * 
 * Compatible iOS Safari / PWA :
 * - Pas d'import dynamique
 * - Pas de fetch audio
 * - Déblocage audio via interaction utilisateur
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Noms des sons disponibles */
type SoundName =
    | 'card_common'
    | 'card_pack_open'
    | 'card_rare'
    | 'error'
    | 'language_change'
    | 'level_up'
    | 'match_fail'
    | 'match_success'
    | 'reward_coin'
    | 'reward_gem'
    | 'ui_click'
    | 'ui_close'
    | 'ui_open'
    | 'victory';

/** Liste des sons à précharger */
const SOUND_FILES: SoundName[] = [
    'card_common',
    'card_pack_open',
    'card_rare',
    'error',
    'language_change',
    'level_up',
    'match_fail',
    'match_success',
    'reward_coin',
    'reward_gem',
    'ui_click',
    'ui_close',
    'ui_open',
    'victory'
];

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

/** Active/désactive les sons */
let soundEnabled = true;

/** Volume global (0.0 à 1.0) */
let soundVolume = 0.5;

/** Cache des objets Audio */
const soundCache: Map<SoundName, HTMLAudioElement> = new Map();

/** Audio débloqué par interaction utilisateur (iOS) */
let audioUnlocked = false;

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS PUBLIQUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Précharge tous les sons au démarrage
 * Appelé une fois au lancement de l'app
 */
function preloadSounds(): void {
    console.log('🔊 Préchargement des sons...');

    for (const name of SOUND_FILES) {
        try {
            const audio = new Audio(`./sfx/${name}.wav`);
            audio.preload = 'auto';
            audio.volume = soundVolume;
            soundCache.set(name, audio);
        } catch (e) {
            console.warn(`⚠️ Impossible de charger: ${name}`, e);
        }
    }

    console.log(`✅ ${soundCache.size}/${SOUND_FILES.length} sons chargés`);
}

/**
 * Débloque l'audio sur iOS (doit être appelé lors d'une interaction)
 * iOS Safari nécessite une interaction utilisateur pour jouer du son
 */
function unlockAudio(): void {
    if (audioUnlocked) return;

    // Créer un contexte audio silencieux pour débloquer
    try {
        const silentAudio = new Audio();
        silentAudio.volume = 0;
        silentAudio.play().then(() => {
            silentAudio.pause();
            audioUnlocked = true;
            console.log('🔓 Audio débloqué (iOS)');
        }).catch(() => {
            // Ignorer l'erreur — normal si pas encore d'interaction
        });
    } catch (e) {
        // Ignorer
    }

    // Aussi essayer de jouer chaque son en cache silencieusement
    soundCache.forEach((audio) => {
        try {
            const originalVolume = audio.volume;
            audio.volume = 0;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = originalVolume;
            }).catch(() => { });
        } catch (e) {
            // Ignorer
        }
    });

    audioUnlocked = true;
}

/**
 * Joue un son
 * @param name - Nom du son à jouer
 */
function playSound(name: SoundName): void {
    // Sons désactivés ?
    if (!soundEnabled) return;

    const audio = soundCache.get(name);
    if (!audio) {
        console.warn(`⚠️ Son non trouvé: ${name}`);
        return;
    }

    try {
        // Cloner l'audio pour permettre plusieurs lectures simultanées
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = soundVolume;

        clone.play().catch((e) => {
            // Erreur Safari courante — ignorer silencieusement
            if (e.name !== 'NotAllowedError') {
                console.warn(`⚠️ Erreur lecture son: ${name}`, e.message);
            }
        });
    } catch (e) {
        // Protection contre les erreurs Safari
        console.warn(`⚠️ Exception son: ${name}`, e);
    }
}

/**
 * Active ou désactive les sons
 */
function setSoundEnabled(enabled: boolean): void {
    soundEnabled = enabled;
    console.log(`🔊 Sons ${enabled ? 'activés' : 'désactivés'}`);
}

/**
 * Définit le volume global
 * @param volume - Volume de 0.0 à 1.0
 */
function setSoundVolume(volume: number): void {
    soundVolume = Math.max(0, Math.min(1, volume));

    // Mettre à jour tous les sons en cache
    soundCache.forEach((audio) => {
        audio.volume = soundVolume;
    });

    console.log(`🔊 Volume: ${Math.round(soundVolume * 100)}%`);
}

/**
 * Retourne l'état actuel des sons
 */
function isSoundEnabled(): boolean {
    return soundEnabled;
}

/**
 * Retourne le volume actuel
 */
function getSoundVolume(): number {
    return soundVolume;
}

/**
 * Initialise le système audio
 * - Précharge les sons
 * - Ajoute le listener pour débloquer iOS
 */
function initSoundSystem(): void {
    console.log('🎵 Initialisation du système audio...');

    // Précharger tous les sons
    preloadSounds();

    // Ajouter listeners pour débloquer iOS au premier clic
    const unlockEvents = ['click', 'touchstart', 'keydown'];

    const handleFirstInteraction = () => {
        unlockAudio();
        // Retirer les listeners après déblocage
        unlockEvents.forEach(event => {
            document.removeEventListener(event, handleFirstInteraction);
        });
    };

    unlockEvents.forEach(event => {
        document.addEventListener(event, handleFirstInteraction, { once: false, passive: true });
    });

    console.log('✅ Système audio initialisé');
}
