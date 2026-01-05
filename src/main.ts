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
