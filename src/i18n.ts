/**
 * i18n - Internationalization module for World of Love
 * 
 * Features:
 * - 25 languages supported
 * - No fetch() or dynamic imports (Safari iOS compatible)
 * - Offline-first with localStorage persistence
 * - Automatic RTL support for Arabic
 * 
 * @author World of Love Team
 */

// ============================================================================
// STATIC IMPORTS - All languages loaded synchronously (Safari iOS compatible)
// ============================================================================

import fr from './i18n/fr';
import en from './i18n/en';
import es from './i18n/es';
import de from './i18n/de';
import it from './i18n/it';
import pt from './i18n/pt';
import nl from './i18n/nl';
import ru from './i18n/ru';
import uk from './i18n/uk';
import pl from './i18n/pl';
import tr from './i18n/tr';
import ar from './i18n/ar';
import ja from './i18n/ja';
import zh from './i18n/zh';
import ko from './i18n/ko';
import hi from './i18n/hi';
import id from './i18n/id';
import th from './i18n/th';
import vi from './i18n/vi';
import sv from './i18n/sv';
import no from './i18n/no';
import da from './i18n/da';
import fi from './i18n/fi';
import el from './i18n/el';
import ro from './i18n/ro';

// ============================================================================
// TYPES
// ============================================================================

/** Supported language codes */
export type LangCode =
    | 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'nl'
    | 'ru' | 'uk' | 'pl' | 'tr' | 'ar' | 'ja' | 'zh'
    | 'ko' | 'hi' | 'id' | 'th' | 'vi' | 'sv' | 'no'
    | 'da' | 'fi' | 'el' | 'ro';

/** Translation keys available in all languages */
export type TranslationKey =
    | 'welcome' | 'collect' | 'cards' | 'collection' | 'level'
    | 'dailyReward' | 'openPack' | 'loveMatch' | 'shop' | 'missions'
    | 'profile' | 'save' | 'export' | 'import' | 'languageChanged' | 'logout';

/** Language metadata */
interface LangMeta {
    name: string;      // Native name
    nameEn: string;    // English name
    rtl: boolean;      // Right-to-left
}

// ============================================================================
// LANGUAGES REGISTRY
// ============================================================================

/**
 * All available languages with their translations
 * Indexed by language code for O(1) access
 */
export const languages: Record<LangCode, Record<string, string>> = {
    fr, en, es, de, it, pt, nl, ru, uk, pl, tr, ar,
    ja, zh, ko, hi, id, th, vi, sv, no, da, fi, el, ro
};

/**
 * Language metadata (names, RTL status)
 */
export const langMeta: Record<LangCode, LangMeta> = {
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

/** localStorage key for persisting language preference */
const STORAGE_KEY = 'wol_lang';

/** Default fallback language */
const DEFAULT_LANG: LangCode = 'fr';

/** Current active language */
let currentLang: LangCode = DEFAULT_LANG;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize i18n system
 * - Loads saved language from localStorage
 * - Falls back to browser language or default
 * - Applies RTL if needed
 */
function init(): void {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && isValidLang(saved)) {
        currentLang = saved as LangCode;
    } else {
        // Try browser language
        const browserLang = navigator.language.split('-')[0];
        if (isValidLang(browserLang)) {
            currentLang = browserLang as LangCode;
        }
    }

    // Apply RTL if needed
    applyDirection();
}

/**
 * Check if a string is a valid language code
 */
function isValidLang(code: string): boolean {
    return code in languages;
}

/**
 * Apply text direction (LTR/RTL) to document
 */
function applyDirection(): void {
    const isRtl = langMeta[currentLang].rtl;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get translation for a key
 * 
 * @param key - Translation key
 * @returns Translated string, or key if not found
 * 
 * @example
 * t('welcome') // "Bienvenue" (if lang is 'fr')
 */
export function t(key: TranslationKey | string): string {
    const translations = languages[currentLang];

    // Return translation or fallback to key
    if (translations && key in translations) {
        return translations[key];
    }

    // Try fallback to English
    if (currentLang !== 'en' && key in languages.en) {
        return languages.en[key];
    }

    // Return key as last resort
    return key;
}

/**
 * Set the current language
 * 
 * @param lang - Language code to switch to
 * @returns true if language was changed, false if invalid
 * 
 * @example
 * setLang('en') // Switch to English
 * setLang('ar') // Switch to Arabic (enables RTL)
 */
export function setLang(lang: LangCode | string): boolean {
    // Validate language code
    if (!isValidLang(lang)) {
        console.warn(`[i18n] Invalid language code: ${lang}`);
        return false;
    }

    // Update current language
    currentLang = lang as LangCode;

    // Persist to localStorage
    try {
        localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (e) {
        console.warn('[i18n] localStorage unavailable');
    }

    // Apply RTL if needed
    applyDirection();

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('langchange', {
        detail: { lang: currentLang }
    }));

    return true;
}

/**
 * Get current language code
 */
export function getLang(): LangCode {
    return currentLang;
}

/**
 * Get list of all available language codes
 */
export function getAvailableLangs(): LangCode[] {
    return Object.keys(languages) as LangCode[];
}

/**
 * Get metadata for a language
 */
export function getLangMeta(lang: LangCode): LangMeta {
    return langMeta[lang];
}

/**
 * Check if current language is RTL
 */
export function isRtl(): boolean {
    return langMeta[currentLang].rtl;
}

// ============================================================================
// AUTO-INIT
// ============================================================================

// Initialize on module load
init();
