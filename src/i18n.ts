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

const I18N_TRANSLATIONS: Record<string, Record<string, string>> = {
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

const I18N_LANG_META: Record<string, { name: string; nameEn: string; rtl: boolean }> = {
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
function i18nIsValidLang(code: string): boolean {
    return code in I18N_TRANSLATIONS;
}

/**
 * Apply text direction (LTR/RTL) to document
 */
function i18nApplyDirection(): void {
    const meta = I18N_LANG_META[i18nCurrentLang];
    if (meta) {
        document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = i18nCurrentLang;
    }
}

/**
 * Initialize i18n system
 */
function i18nInit(): void {
    // Try to load from localStorage
    try {
        const saved = localStorage.getItem(I18N_STORAGE_KEY);
        if (saved && i18nIsValidLang(saved)) {
            i18nCurrentLang = saved;
        } else {
            // Try browser language
            const browserLang = navigator.language.split('-')[0];
            if (i18nIsValidLang(browserLang)) {
                i18nCurrentLang = browserLang;
            }
        }
    } catch (e) {
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
function t(key: string): string {
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
function setLang(lang: string): boolean {
    if (!i18nIsValidLang(lang)) {
        console.warn(`[i18n] Invalid language code: ${lang}`);
        return false;
    }

    i18nCurrentLang = lang;

    // Persist to localStorage
    try {
        localStorage.setItem(I18N_STORAGE_KEY, i18nCurrentLang);
    } catch (e) {
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
function getLang(): string {
    return i18nCurrentLang;
}

/**
 * Get list of all available language codes
 */
function getAvailableLangs(): string[] {
    return Object.keys(I18N_TRANSLATIONS);
}

/**
 * Get metadata for a language
 */
function getLangMeta(lang: string): { name: string; nameEn: string; rtl: boolean } | null {
    return I18N_LANG_META[lang] || null;
}

/**
 * Check if current language is RTL
 */
function isRtl(): boolean {
    const meta = I18N_LANG_META[i18nCurrentLang];
    return meta ? meta.rtl : false;
}

// ============================================================================
// AUTO-INIT on script load
// ============================================================================

i18nInit();
