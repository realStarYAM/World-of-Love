/**
 * World of Love — Card Game
 * Point d'entrée principal
 * 
 * Initialise l'application au chargement de la page.
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

import { t, setLang, getLang, getAvailableLangs, isRtl, langMeta, LangCode } from './i18n';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS (pour accès depuis HTML/JS)
// ═══════════════════════════════════════════════════════════════════════════

// Exposer les fonctions i18n sur window pour accès global
declare global {
    interface Window {
        t: typeof t;
        setLang: typeof setLang;
        getLang: typeof getLang;
        getAvailableLangs: typeof getAvailableLangs;
        isRtl: typeof isRtl;
        langMeta: typeof langMeta;
    }
}

window.t = t;
window.setLang = setLang;
window.getLang = getLang;
window.getAvailableLangs = getAvailableLangs;
window.isRtl = isRtl;
window.langMeta = langMeta;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Point d'entrée de l'application
 */
function initApp(): void {
    console.log('🌍 World of Love — Card Game');
    console.log('💕 Initialisation...');

    // Initialiser l'interface utilisateur
    initUI();

    // Signaler que l'app est chargée (pour iOS error handler)
    if (typeof (window as any).__markAppLoaded === 'function') {
        (window as any).__markAppLoaded();
    }

    console.log('✅ Application prête !');
}

// Lancer l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', initApp);
