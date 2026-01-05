================================================================================
                    WORLD OF LOVE — CARD GAME
                    Progressive Web App (PWA)
================================================================================

Un jeu de cartes basé sur 196 pays. Collectionnez, échangez, améliorez !
Version PWA : installable sur mobile et desktop, jouable hors ligne.

--------------------------------------------------------------------------------
1) COMMENT OUVRIR LE JEU
--------------------------------------------------------------------------------

MÉTHODE SIMPLE (développement local) :
→ Vous DEVEZ utiliser un serveur local (pas de double-clic sur index.html)
→ Les Service Workers ne fonctionnent pas en file://

Option A - Avec Python :
   cd "World of Love — Card Game"
   python -m http.server 8080
   → Ouvrez http://localhost:8080

Option B - Avec Node.js (npx) :
   cd "World of Love — Card Game"
   npx serve .
   → Ouvrez http://localhost:3000

Option C - Avec VS Code :
   → Installez l'extension "Live Server"
   → Clic droit sur index.html → "Open with Live Server"

--------------------------------------------------------------------------------
2) COMMENT INSTALLER L'APPLICATION
--------------------------------------------------------------------------------

L'app peut être installée comme une vraie application sur :
✅ Chrome (Windows, Mac, Linux, Android)
✅ Edge (Windows, Mac)
✅ Android (Chrome, Samsung Internet)
❌ Safari iOS (limité, pas de Service Worker complet)

POUR INSTALLER :

Sur Desktop (Chrome/Edge) :
   1. Ouvrez le jeu dans votre navigateur
   2. Cliquez sur le bouton "📲 Installer" dans le header du jeu
   3. OU cliquez sur l'icône d'installation dans la barre d'adresse
   4. Confirmez l'installation
   5. L'app s'ouvre maintenant en plein écran sans barre d'adresse !

Sur Android :
   1. Ouvrez le jeu dans Chrome
   2. Une bannière "Ajouter à l'écran d'accueil" peut apparaître
   3. OU utilisez le menu ⋮ → "Ajouter à l'écran d'accueil"
   4. L'icône sera ajoutée à votre écran d'accueil

Sur iPhone/iPad (limité) :
   1. Ouvrez le jeu dans Safari
   2. Appuyez sur le bouton Partager
   3. Appuyez sur "Sur l'écran d'accueil"
   Note : Le mode offline est limité sur iOS

--------------------------------------------------------------------------------
3) COMMENT TESTER LE MODE OFFLINE
--------------------------------------------------------------------------------

1. Ouvrez le jeu normalement (avec un serveur local)
2. Attendez que le message console dise :
   "✅ Service Worker enregistré avec succès"
3. Naviguez un peu dans le jeu (pour tout mettre en cache)
4. Maintenant testez le mode offline :

   Option A - Via les DevTools :
      → F12 → Onglet "Network" → Cochez "Offline"
      → Rechargez la page → Le jeu fonctionne toujours !

   Option B - Coupez votre connexion Internet
      → Désactivez le Wi-Fi ou le câble
      → Rechargez → Le jeu fonctionne !

IMPORTANT :
- localStorage est conservé après installation
- Votre progression est sauvegardée localement
- Pas besoin d'Internet pour jouer

--------------------------------------------------------------------------------
4) PUBLICATION SUR ITCH.IO
--------------------------------------------------------------------------------

1. Créez un compte sur https://itch.io

2. Cliquez sur "Upload new project"
   → "Kind of project" : HTML
   → "Uploads" : Uploadez un ZIP contenant :
      - index.html
      - style.css
      - dist/main.js
      - manifest.json
      - service-worker.js
      - icons/ (dossier avec icon-192.svg et icon-512.svg)

3. Dans les options d'embed :
   → Cochez "This file will be played in the browser"
   → Dimensions recommandées : 960 x 700 (ou Fullscreen)

4. Note importante :
   → Le mode PWA "installation" ne fonctionne PAS dans l'iframe Itch.io
   → Les joueurs doivent ouvrir le jeu dans un nouvel onglet
   → Ajoutez un lien "Ouvrir en plein écran" si possible

--------------------------------------------------------------------------------
5) PUBLICATION SUR GITHUB PAGES
--------------------------------------------------------------------------------

1. Créez un repository sur GitHub

2. Poussez tous les fichiers :
   git init
   git add .
   git commit -m "World of Love PWA"
   git remote add origin https://github.com/VOTRE_USERNAME/world-of-love.git
   git push -u origin main

3. Activez GitHub Pages :
   → Settings → Pages
   → Source : "Deploy from a branch"
   → Branch : "main" / dossier "/ (root)"
   → Save

4. Votre jeu sera accessible à :
   https://VOTRE_USERNAME.github.io/world-of-love/

5. L'installation PWA fonctionne parfaitement sur GitHub Pages ! ✅

--------------------------------------------------------------------------------
6) PUBLICATION SUR NETLIFY
--------------------------------------------------------------------------------

MÉTHODE RAPIDE (Drag & Drop) :

1. Allez sur https://app.netlify.com/drop

2. Glissez-déposez le dossier "World of Love — Card Game"

3. C'est tout ! Votre jeu est en ligne en 30 secondes.
   → URL générée automatiquement (ex: random-name-123.netlify.app)

MÉTHODE GIT (recommandée pour les mises à jour) :

1. Connectez votre repository GitHub à Netlify
2. Configuration :
   → Build command : (laisser vide)
   → Publish directory : .
3. Chaque push sur GitHub déploie automatiquement !

L'installation PWA fonctionne parfaitement sur Netlify ! ✅

--------------------------------------------------------------------------------
STRUCTURE DU PROJET PWA
--------------------------------------------------------------------------------

World of Love — Card Game/
├── index.html          ← Page principale + scripts PWA
├── style.css           ← Styles (inclut bouton install)
├── manifest.json       ← Configuration PWA
├── service-worker.js   ← Cache offline
├── README.txt          ← Ce fichier
├── icons/
│   ├── icon-192.svg    ← Icône PWA 192x192
│   └── icon-512.svg    ← Icône PWA 512x512
├── src/                ← Sources TypeScript (optionnel)
│   ├── main.ts
│   ├── auth.ts
│   ├── storage.ts
│   ├── game.ts
│   ├── ui.ts
│   └── data/
│       └── countries.ts
└── dist/
    └── main.js         ← JavaScript compilé

--------------------------------------------------------------------------------
PERSONNALISER LES ICÔNES
--------------------------------------------------------------------------------

Les icônes actuelles sont des SVG placeholder (cœur + globe).
Pour les remplacer :

1. Créez vos icônes aux tailles :
   - 192x192 pixels (Android, Chrome)
   - 512x512 pixels (splash screen, haute résolution)

2. Formats acceptés : PNG (recommandé), SVG, WebP

3. Remplacez les fichiers dans le dossier icons/

4. Si vous changez le format (PNG au lieu de SVG) :
   → Modifiez manifest.json :
   
   "icons": [
     {
       "src": "icons/icon-192.png",
       "sizes": "192x192",
       "type": "image/png"
     },
     {
       "src": "icons/icon-512.png", 
       "sizes": "512x512",
       "type": "image/png"
     }
   ]

Outils gratuits pour créer des icônes :
- https://www.canva.com
- https://favicon.io/favicon-generator/
- https://maskable.app/ (pour les icônes maskable Android)

--------------------------------------------------------------------------------
DÉPANNAGE
--------------------------------------------------------------------------------

Le bouton "Installer" n'apparaît pas :
→ Vous devez utiliser HTTPS ou localhost
→ Vérifiez que le manifest.json est valide (F12 → Application → Manifest)
→ Rechargez la page après que le Service Worker soit installé

Le mode offline ne fonctionne pas :
→ Vérifiez que le Service Worker est activé (F12 → Application → Service Workers)
→ Naviguez un peu dans le jeu avant de couper Internet
→ Appuyez sur "Update on reload" puis rechargez

L'app ne s'installe pas sur iPhone :
→ Utilisez Safari (pas Chrome)
→ Bouton Partager → "Sur l'écran d'accueil"
→ Note : Le mode offline est très limité sur iOS

Ma progression a disparu après installation :
→ Normalement impossible, localStorage est conservé
→ Vérifiez que vous n'avez pas vidé les données du navigateur

--------------------------------------------------------------------------------
CRÉDITS
--------------------------------------------------------------------------------

Développé avec ❤️
Technologies : HTML, CSS, TypeScript, PWA
Aucun framework externe requis.
Fonctionne 100% offline après première visite.

================================================================================
