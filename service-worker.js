// ============================================================================
// SERVICE WORKER — World of Love PWA
// Version: 1.1.0
// ============================================================================

const CACHE_NAME = 'worldoflove-v2';
const CACHE_VERSION = '1.1.0';

// ============================================================================
// LISTE DES 195 PAYS UTILISÉS (codes ISO minuscules)
// ============================================================================
// Ces codes correspondent EXACTEMENT à countries.ts
// Les autres fichiers SVG (territoires, organisations) sont ignorés
const COUNTRY_CODES = [
    // Europe (44)
    'fr', 'de', 'it', 'es', 'gb', 'pt', 'nl', 'be', 'ch', 'at', 'pl', 'cz', 'sk', 'hu',
    'ro', 'bg', 'gr', 'hr', 'si', 'rs', 'ba', 'me', 'mk', 'al', 'xk', 'ua', 'by', 'md',
    'ru', 'se', 'no', 'fi', 'dk', 'is', 'ie', 'ee', 'lv', 'lt', 'lu', 'mt', 'cy', 'mc', 'sm', 'va',
    // Afrique (54)
    'ma', 'dz', 'tn', 'ly', 'eg', 'sd', 'ss', 'et', 'er', 'dj', 'so', 'ke', 'ug', 'tz',
    'rw', 'bi', 'cd', 'cg', 'ga', 'gq', 'cm', 'cf', 'td', 'ne', 'ng', 'bj', 'tg', 'gh',
    'ci', 'bf', 'ml', 'sn', 'gm', 'gw', 'gn', 'sl', 'lr', 'mr', 'cv', 'st', 'ao', 'zm',
    'zw', 'mw', 'mz', 'mg', 'mu', 'sc', 'km', 'za', 'na', 'bw', 'sz', 'ls',
    // Asie (48)
    'cn', 'jp', 'kr', 'kp', 'mn', 'tw', 'hk', 'mo', 'vn', 'la', 'kh', 'th', 'mm', 'my',
    'sg', 'id', 'ph', 'bn', 'tl', 'in', 'pk', 'bd', 'np', 'bt', 'lk', 'mv', 'af', 'ir',
    'iq', 'sy', 'lb', 'jo', 'il', 'ps', 'sa', 'ye', 'om', 'ae', 'qa', 'bh', 'kw', 'tr',
    'ge', 'am', 'az', 'kz', 'uz', 'tm', 'tj', 'kg',
    // Amérique (35)
    'us', 'ca', 'mx', 'gt', 'bz', 'sv', 'hn', 'ni', 'cr', 'pa', 'cu', 'jm', 'ht', 'do',
    'pr', 'tt', 'bb', 'gd', 'vc', 'lc', 'dm', 'ag', 'kn', 'bs', 'co', 've', 'gy', 'sr',
    'ec', 'pe', 'bo', 'br', 'py', 'uy', 'ar', 'cl',
    // Océanie (14)
    'au', 'nz', 'pg', 'fj', 'sb', 'vu', 'ws', 'to', 'ki', 'fm', 'mh', 'pw', 'nr', 'tv'
];

// Générer les chemins des drapeaux
const FLAG_PATHS = COUNTRY_CODES.map(code => `./flag-icons/${code}.svg`);

// Fichiers à mettre en cache pour le mode offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './dist/main.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    // Drapeaux des 195 pays
    ...FLAG_PATHS
];

// ============================================================================
// INSTALLATION — Mise en cache des fichiers essentiels
// ============================================================================
self.addEventListener('install', (event) => {
    console.log(`[Service Worker] 📦 Installation v${CACHE_VERSION}...`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] ✅ Cache ouvert, ajout des fichiers...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[Service Worker] 🎉 Tous les fichiers sont en cache !');
                // Force l'activation immédiate (skip waiting)
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] ❌ Erreur lors du cache:', error);
            })
    );
});

// ============================================================================
// ACTIVATION — Nettoyage des anciens caches
// ============================================================================
self.addEventListener('activate', (event) => {
    console.log(`[Service Worker] 🚀 Activation v${CACHE_VERSION}...`);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log(`[Service Worker] 🗑️ Suppression ancien cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] ✅ Service Worker activé et prêt !');
                // Prend le contrôle immédiatement de toutes les pages
                return self.clients.claim();
            })
    );
});

// ============================================================================
// FETCH — Stratégie Cache-First (offline-first)
// ============================================================================
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET (POST, etc.)
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes vers des domaines externes
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si trouvé dans le cache, retourner la réponse cachée
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Sinon, faire la requête réseau
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Si la réponse est valide, la mettre en cache
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // En cas d'échec réseau, retourner la page d'accueil pour le routing SPA
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return null;
                    });
            })
    );
});

// ============================================================================
// MESSAGE — Communication avec la page
// ============================================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] ⏩ Skip waiting demandé');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

console.log(`[Service Worker] 💕 World of Love PWA v${CACHE_VERSION} chargé`);
