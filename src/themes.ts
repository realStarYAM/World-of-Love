/**
 * World of Love — Themes UI v1.1.2
 *
 * Catalogue original inspire de grandes familles visuelles, sans assets
 * proteges ni logos officiels. Le fichier reste en mode script global pour
 * rester compatible avec le build TypeScript "module: None" du projet.
 */

type UIThemeCategory =
    | 'Apple/iOS/macOS'
    | 'Windows'
    | 'Android'
    | 'Linux'
    | 'Gaming'
    | 'Retro'
    | 'Premium'
    | 'Nature';

type UIThemeButtonStyle =
    | 'solid'
    | 'glass'
    | 'outline'
    | 'neon'
    | 'retro-3d'
    | 'glossy-luna'
    | 'bubble-aqua'
    | 'soft-modern';

type UIThemeSurface = 'light' | 'dark';
type UIThemeScrollbarStyle = 'classic' | 'modern' | 'hidden';

interface UIThemeColors {
    bgPrimary: string;
    bgSecondary: string;
    bgCard: string;
    bgHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentPink: string;
    accentBlue: string;
    accentPurple: string;
    accentGold: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    border: string;
    glassBg: string;
    glassBgStrong: string;
    glassBorder: string;
}

interface UIThemeBorders {
    width: string;
    style: string;
    color: string;
    radiusCard: string;
    radiusButton: string;
    radiusModal: string;
}

interface UIThemeShadows {
    card: string;
    button: string;
    modal: string;
    glow: string;
    sm: string;
    md: string;
    lg: string;
}

interface UIThemeTypography {
    fontFamily: string;
    fontSizeMultiplier: string;
    letterSpacing: string;
    textTransformHeaders: string;
}

interface UIThemeEffects {
    background: string;
    backdropFilter: string;
    transitionSpeed: string;
    animationName?: string;
    scrollbarStyle: UIThemeScrollbarStyle;
    panel: string;
    button: string;
    texture: string;
    glowPink: string;
    glowBlue: string;
    backdropBlur: string;
}

interface UIThemeCorners {
    sm: string;
    md: string;
    lg: string;
    full: string;
}

interface UITheme {
    id: string;
    name: string;
    category: UIThemeCategory;
    tags: string[];
    colors: UIThemeColors;
    borders: UIThemeBorders;
    shadows: UIThemeShadows;
    typography: UIThemeTypography;
    effects: UIThemeEffects;
    buttonStyle: UIThemeButtonStyle;
    surface: UIThemeSurface;
    corners: UIThemeCorners;
}

interface UIThemeSeed {
    id: string;
    name: string;
    category: UIThemeCategory;
    hue: number;
    accentHue: number;
    surface: UIThemeSurface;
    buttonStyle: UIThemeButtonStyle;
    radius: number;
    intensity: number;
    transitionSpeed: string;
    fontFamily: string;
    texture: 'plain' | 'glass' | 'aero' | 'metal' | 'linen' | 'scanline' | 'grid' | 'paper' | 'carbon' | 'nature';
    borderStyle?: string;
    shadowStyle?: 'soft' | 'hard' | 'glow' | 'inset' | 'flat';
    tags?: string[];
}

interface UIThemeBlueprint {
    colors?: Partial<UIThemeColors>;
    borders?: Partial<UIThemeBorders>;
    shadows?: Partial<UIThemeShadows>;
    typography?: Partial<UIThemeTypography>;
    effects?: Partial<UIThemeEffects>;
}

const APP_DISPLAY_VERSION = 'v1.1.2';
const DEFAULT_UI_THEME_ID = 'glassmorphism-aurora';
const UI_THEME_FILTERS: Array<UIThemeCategory | 'Tous'> = [
    'Tous',
    'Apple/iOS/macOS',
    'Windows',
    'Android',
    'Linux',
    'Gaming',
    'Retro',
    'Premium',
    'Nature',
];

const FONT_SYSTEM = "'Inter', 'Segoe UI', system-ui, sans-serif";
const FONT_ROUNDED = "'Outfit', 'Inter', system-ui, sans-serif";
const FONT_RETRO = "'MS Sans Serif', Tahoma, 'VT323', monospace";
const FONT_MONO = "'Fira Code', 'VT323', monospace";
const FONT_GAMING = "'Orbitron', 'Outfit', system-ui, sans-serif";
const FONT_UBUNTU = "'Ubuntu', 'Inter', system-ui, sans-serif";

function clampHue(value: number): number {
    return ((value % 360) + 360) % 360;
}

function hsl(hue: number, saturation: number, lightness: number): string {
    return `hsl(${clampHue(hue)}, ${saturation}%, ${lightness}%)`;
}

function hsla(hue: number, saturation: number, lightness: number, alpha: number): string {
    return `hsla(${clampHue(hue)}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function mergeThemePart<T>(base: T, override?: Partial<T>): T {
    return { ...base, ...(override || {}) };
}

function getButtonGradient(style: UIThemeButtonStyle, colors: UIThemeColors, seed: UIThemeSeed): string {
    switch (style) {
        case 'retro-3d':
            return `linear-gradient(180deg, ${colors.bgSecondary}, ${colors.bgHover})`;
        case 'glossy-luna':
            return 'linear-gradient(to bottom, #7db9e8 0%, #207cca 49%, #1e5799 51%, #0a4078 100%)';
        case 'bubble-aqua':
            return 'linear-gradient(to bottom, #94dfff 0%, #30b1ff 48%, #0089e0 52%, #006eb3 100%)';
        case 'glass':
            return `linear-gradient(135deg, ${hsla(seed.accentHue, 84, seed.surface === 'dark' ? 70 : 50, 0.42)}, ${hsla(seed.hue + 34, 92, 62, 0.28)})`;
        case 'outline':
            return `linear-gradient(135deg, ${hsla(seed.accentHue, 80, seed.surface === 'dark' ? 62 : 44, 0.14)}, ${hsla(seed.hue, 70, seed.surface === 'dark' ? 34 : 90, 0.22)})`;
        case 'neon':
            return `linear-gradient(135deg, ${colors.accentPink}, ${colors.accentBlue})`;
        case 'soft-modern':
            return `linear-gradient(135deg, ${hsla(seed.accentHue, 78, seed.surface === 'dark' ? 58 : 48, 0.92)}, ${hsla(seed.hue + 46, 74, seed.surface === 'dark' ? 56 : 52, 0.86)})`;
        case 'solid':
        default:
            return `linear-gradient(135deg, ${colors.accentPink}, ${colors.accentPurple})`;
    }
}

function getTexture(seed: UIThemeSeed, colors: UIThemeColors): string {
    switch (seed.texture) {
        case 'aero':
            return [
                `radial-gradient(circle at 14% 8%, ${hsla(seed.accentHue, 90, 82, 0.22)}, transparent 28rem)`,
                `radial-gradient(circle at 88% 14%, ${hsla(seed.hue + 62, 90, 72, 0.18)}, transparent 34rem)`,
                `linear-gradient(135deg, ${hsla(seed.hue, 80, seed.surface === 'dark' ? 18 : 96, 0.92)}, ${colors.bgPrimary})`,
            ].join(', ');
        case 'metal':
            return [
                `repeating-linear-gradient(90deg, ${hsla(seed.hue, 8, seed.surface === 'dark' ? 58 : 80, 0.16)} 0 1px, transparent 1px 6px)`,
                `linear-gradient(180deg, ${colors.bgSecondary}, ${colors.bgPrimary})`,
            ].join(', ');
        case 'linen':
            return [
                `repeating-linear-gradient(45deg, ${hsla(seed.hue, 10, 76, 0.08)} 0 1px, transparent 1px 5px)`,
                `repeating-linear-gradient(-45deg, ${hsla(seed.hue, 10, 24, 0.06)} 0 1px, transparent 1px 5px)`,
                colors.bgPrimary,
            ].join(', ');
        case 'scanline':
            return [
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
                `radial-gradient(circle at 50% 20%, ${hsla(seed.accentHue, 92, 54, 0.14)}, transparent 30rem)`,
                colors.bgPrimary,
            ].join(', ');
        case 'grid':
            return [
                `linear-gradient(90deg, ${hsla(seed.accentHue, 88, 60, 0.1)} 1px, transparent 1px)`,
                `linear-gradient(0deg, ${hsla(seed.accentHue, 88, 60, 0.1)} 1px, transparent 1px)`,
                `radial-gradient(circle at 50% 0%, ${hsla(seed.accentHue, 96, 54, 0.18)}, transparent 34rem)`,
                colors.bgPrimary,
            ].join(', ');
        case 'paper':
            return [
                `repeating-linear-gradient(0deg, ${hsla(seed.hue, 24, 48, 0.04)} 0 1px, transparent 1px 11px)`,
                `linear-gradient(180deg, ${colors.bgPrimary}, ${colors.bgSecondary})`,
            ].join(', ');
        case 'carbon':
            return [
                'linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25% 50%, rgba(255,255,255,0.04) 50% 75%, transparent 75%)',
                'linear-gradient(-45deg, rgba(0,0,0,0.28) 25%, transparent 25% 50%, rgba(0,0,0,0.28) 50% 75%, transparent 75%)',
                colors.bgPrimary,
            ].join(', ');
        case 'nature':
            return [
                `radial-gradient(circle at 16% 18%, ${hsla(seed.accentHue, 74, 62, 0.18)}, transparent 29rem)`,
                `radial-gradient(circle at 84% 82%, ${hsla(seed.hue + 80, 66, 48, 0.14)}, transparent 32rem)`,
                `linear-gradient(180deg, ${colors.bgSecondary}, ${colors.bgPrimary})`,
            ].join(', ');
        case 'glass':
            return [
                `radial-gradient(circle at 15% 12%, ${hsla(seed.accentHue, 90, 78, 0.2)}, transparent 32rem)`,
                `radial-gradient(circle at 84% 8%, ${hsla(seed.hue + 44, 90, 70, 0.16)}, transparent 36rem)`,
                `linear-gradient(180deg, ${colors.bgSecondary}, ${colors.bgPrimary})`,
            ].join(', ');
        case 'plain':
            return colors.bgPrimary;
        default:
            return [
                `radial-gradient(circle at 12% 8%, ${hsla(seed.accentHue, 88, 62, seed.surface === 'dark' ? 0.16 : 0.12)}, transparent 31rem)`,
                `linear-gradient(180deg, ${colors.bgSecondary}, ${colors.bgPrimary})`,
            ].join(', ');
    }
}

function getBaseColors(seed: UIThemeSeed): UIThemeColors {
    const dark = seed.surface === 'dark';
    const hue = clampHue(seed.hue);
    const accent = clampHue(seed.accentHue);
    const secondAccent = clampHue((seed.hue + seed.accentHue) / 2 + 38);
    const intensity = Math.max(0.32, Math.min(1.18, seed.intensity));
    const cardLightness = dark ? Math.round(11 + intensity * 8) : Math.round(97 - intensity * 5);
    const bgPrimary = dark ? hsl(hue, 44, Math.round(6 + intensity * 3)) : hsl(hue, 48, 96);
    const bgSecondary = dark ? hsl(hue, 42, Math.round(11 + intensity * 5)) : hsl(hue, 42, 91);
    const border = dark ? hsla(accent, 78, 78, 0.2 + intensity * 0.08) : hsla(hue, 30, 30, 0.16 + intensity * 0.08);

    return {
        bgPrimary,
        bgSecondary,
        bgCard: dark ? hsla(hue, 38, cardLightness, 0.82) : hsla(hue, 34, cardLightness, 0.92),
        bgHover: dark ? hsl(hue, 38, Math.round(18 + intensity * 6)) : hsl(hue, 36, 86),
        textPrimary: dark ? hsl(hue, 24, 96) : hsl(hue, 28, 13),
        textSecondary: dark ? hsl(hue, 20, 74) : hsl(hue, 18, 36),
        textMuted: dark ? hsl(hue, 14, 48) : hsl(hue, 14, 54),
        accentPink: hsl(accent, 88, dark ? 67 : 45),
        accentBlue: hsl(secondAccent, 88, dark ? 64 : 42),
        accentPurple: hsl(clampHue(accent + 52), 82, dark ? 62 : 44),
        accentGold: hsl(clampHue(accent + 148), 92, dark ? 63 : 46),
        success: hsl(145, 62, dark ? 54 : 38),
        error: hsl(2, 78, dark ? 62 : 48),
        warning: hsl(40, 90, dark ? 60 : 43),
        info: hsl(secondAccent, 82, dark ? 62 : 42),
        border,
        glassBg: dark ? hsla(hue, 38, cardLightness, seed.buttonStyle === 'glass' ? 0.68 : 0.86) : hsla(hue, 36, 96, seed.buttonStyle === 'glass' ? 0.74 : 0.92),
        glassBgStrong: dark ? hsla(hue, 42, Math.round(cardLightness + 3), 0.92) : hsla(hue, 36, 98, 0.96),
        glassBorder: border,
    };
}

function getThemeBlueprint(seed: UIThemeSeed): UIThemeBlueprint {
    const retroChrome: UIThemeBlueprint = {
        colors: {
            bgPrimary: '#008080',
            bgSecondary: '#c0c0c0',
            bgCard: '#c0c0c0',
            bgHover: '#dcdcdc',
            textPrimary: '#000000',
            textSecondary: '#202020',
            textMuted: '#606060',
            border: '#808080',
            glassBg: '#c0c0c0',
            glassBgStrong: '#d4d0c8',
            glassBorder: '#808080',
        },
        borders: {
            width: '2px',
            style: 'outset',
            color: '#c0c0c0',
            radiusCard: '0px',
            radiusButton: '0px',
            radiusModal: '0px',
        },
        shadows: {
            card: '1px 1px 0 #000000',
            button: '1px 1px 0 #000000',
            modal: '2px 2px 0 #000000',
            glow: 'none',
        },
        typography: {
            fontFamily: FONT_RETRO,
            fontSizeMultiplier: '1.03',
            letterSpacing: '0',
            textTransformHeaders: 'none',
        },
        effects: {
            backdropFilter: 'none',
            transitionSpeed: '0s',
            scrollbarStyle: 'classic',
        },
    };

    const terminal: UIThemeBlueprint = {
        borders: { width: '1px', style: 'solid', color: '#00ff66', radiusCard: '4px', radiusButton: '4px', radiusModal: '4px' },
        shadows: { card: '0 0 18px rgba(0,255,102,0.22)', button: '0 0 14px rgba(0,255,102,0.32)', modal: '0 0 36px rgba(0,255,102,0.2)', glow: '0 0 24px rgba(0,255,102,0.55)' },
        typography: { fontFamily: FONT_MONO, letterSpacing: '0', textTransformHeaders: 'uppercase' },
        effects: { backdropFilter: 'none', scrollbarStyle: 'classic' },
    };

    const blueAero: UIThemeBlueprint = {
        effects: { backdropFilter: 'blur(22px) saturate(150%)', scrollbarStyle: 'modern' },
        borders: { width: '1px', style: 'solid', color: 'rgba(255,255,255,0.32)' },
        shadows: { card: '0 20px 54px rgba(0,60,120,0.28), inset 0 1px 0 rgba(255,255,255,0.22)', button: '0 8px 18px rgba(0,90,180,0.24)', modal: '0 24px 70px rgba(0,45,100,0.36)', glow: '0 0 28px rgba(80,190,255,0.44)' },
    };

    const map: Record<string, UIThemeBlueprint> = {
        'system-7-classic': retroChrome,
        'platinum-os': { ...retroChrome, colors: { ...retroChrome.colors, bgPrimary: '#d8d8d8', bgSecondary: '#eeeeee', bgCard: '#e5e5e5' } },
        'ipod-classic': { ...retroChrome, colors: { ...retroChrome.colors, bgPrimary: '#dfe6d2', bgCard: '#cfd7bd', accentBlue: '#607060' }, borders: { ...retroChrome.borders, radiusCard: '20px', radiusButton: '999px' } },
        'windows-95': retroChrome,
        'windows-98': { ...retroChrome, colors: { ...retroChrome.colors, bgPrimary: '#3a6ea5', accentBlue: '#000080', bgCard: '#d4d0c8' } },
        'windows-2000': { ...retroChrome, colors: { ...retroChrome.colors, bgPrimary: '#5f7f9f', bgCard: '#d7d7d7' } },
        'windows-me': { ...retroChrome, colors: { ...retroChrome.colors, bgPrimary: '#4f7f75', accentBlue: '#247d94' } },
        'chicago-beta': retroChrome,
        'windows-xp-luna': { colors: { bgPrimary: '#2e64c8', bgSecondary: '#ece9d8', bgCard: '#f6f3df', bgHover: '#fff7ce', textPrimary: '#111111', textSecondary: '#1d3260', accentPink: '#2f8d20', accentBlue: '#245edb', accentPurple: '#1540a7', accentGold: '#f0c808', border: '#1a3d68', glassBorder: '#1a3d68' }, effects: { backdropFilter: 'none' } },
        'windows-xp-olive': { colors: { bgPrimary: '#7a8f3d', bgSecondary: '#ebe6c6', bgCard: '#f8f3d0', bgHover: '#fff7cf', textPrimary: '#101010', textSecondary: '#42521f', accentPink: '#6f8e23', accentBlue: '#6888c9', accentPurple: '#8f7a24', accentGold: '#c99a17', border: '#6b742c', glassBorder: '#6b742c' } },
        'windows-xp-metallic': { colors: { bgPrimary: '#6f7788', bgSecondary: '#ececed', bgCard: '#f4f4f4', bgHover: '#ffffff', textPrimary: '#111111', textSecondary: '#383f4d', accentPink: '#f2851f', accentBlue: '#5e74a6', accentPurple: '#7a7284', accentGold: '#d49822', border: '#606879', glassBorder: '#606879' } },
        'windows-vista': blueAero,
        'windows-7-aero': blueAero,
        'aurora-glass': blueAero,
        'macos-aqua-blue': { ...blueAero, effects: { ...blueAero.effects, backdropFilter: 'blur(18px) saturate(170%)' } },
        'macos-aqua-graphite': { ...blueAero, colors: { accentPink: '#68707a', accentBlue: '#7c8b98', accentPurple: '#59636d' } },
        'android-holo-blue': terminal,
        'arch-terminal': { ...terminal, colors: { accentBlue: '#1793d1', accentPink: '#1793d1', accentPurple: '#0b5f8a', border: '#1793d1' } },
        'amber-terminal': { ...terminal, colors: { accentBlue: '#ffb000', accentPink: '#ffb000', accentPurple: '#a96c00', border: '#ffb000' }, shadows: { card: '0 0 18px rgba(255,176,0,0.22)', button: '0 0 14px rgba(255,176,0,0.32)', modal: '0 0 36px rgba(255,176,0,0.2)', glow: '0 0 24px rgba(255,176,0,0.55)' } },
        'crt-green': terminal,
        'crt-amber': { ...terminal, colors: { accentBlue: '#ffb000', accentPink: '#ffb000', accentPurple: '#a96c00', border: '#ffb000' } },
        'ms-dos': { ...terminal, colors: { accentBlue: '#ffffff', accentPink: '#ffffff', accentPurple: '#aaaaaa', border: '#ffffff' } },
        'carbon-fiber': { effects: { backdropFilter: 'blur(12px)', scrollbarStyle: 'modern' }, borders: { width: '1px', style: 'solid', color: 'rgba(255,255,255,0.14)' } },
    };

    return map[seed.id] || {};
}

function createUITheme(seed: UIThemeSeed): UITheme {
    const dark = seed.surface === 'dark';
    const hue = clampHue(seed.hue);
    const accent = clampHue(seed.accentHue);
    const blueprint = getThemeBlueprint(seed);
    const baseColors = getBaseColors(seed);
    const colors = mergeThemePart(baseColors, blueprint.colors);
    const borderWidth = seed.buttonStyle === 'retro-3d' ? '2px' : seed.buttonStyle === 'outline' ? '1px' : seed.intensity > 0.95 ? '1.5px' : '1px';
    const radius = Math.max(0, seed.radius);

    const borders = mergeThemePart<UIThemeBorders>({
        width: borderWidth,
        style: seed.borderStyle || 'solid',
        color: colors.border,
        radiusCard: `${radius}px`,
        radiusButton: seed.buttonStyle === 'retro-3d' ? '0px' : `${Math.max(0, radius - 2)}px`,
        radiusModal: `${radius + 8}px`,
    }, blueprint.borders);

    const shadows = mergeThemePart<UIThemeShadows>({
        card: seed.shadowStyle === 'hard'
            ? `5px 5px 0 ${hsla(hue, 30, dark ? 3 : 25, 0.45)}`
            : seed.shadowStyle === 'flat'
                ? 'none'
                : `0 14px 38px ${hsla(hue, 30, 4, dark ? 0.38 : 0.16)}`,
        button: seed.shadowStyle === 'glow'
            ? `0 0 18px ${hsla(accent, 90, 62, 0.5)}`
            : `0 6px 16px ${hsla(hue, 30, 4, dark ? 0.32 : 0.14)}`,
        modal: `0 24px 70px ${hsla(hue, 38, 4, dark ? 0.55 : 0.24)}`,
        glow: `0 0 28px ${hsla(accent, 90, 62, seed.shadowStyle === 'glow' ? 0.66 : 0.42)}`,
        sm: `0 2px 10px ${hsla(hue, 30, 4, dark ? 0.3 : 0.12)}`,
        md: `0 10px 28px ${hsla(hue, 36, 4, dark ? 0.36 : 0.16)}`,
        lg: `0 18px 54px ${hsla(hue, 38, 4, dark ? 0.48 : 0.22)}`,
    }, blueprint.shadows);

    const typography = mergeThemePart<UIThemeTypography>({
        fontFamily: seed.fontFamily,
        fontSizeMultiplier: seed.category === 'Retro' ? '1.04' : seed.category === 'Gaming' ? '0.98' : '1',
        letterSpacing: seed.category === 'Gaming' ? '0.02em' : '0',
        textTransformHeaders: seed.category === 'Gaming' || seed.buttonStyle === 'neon' ? 'uppercase' : 'none',
    }, blueprint.typography);

    const effects = mergeThemePart<UIThemeEffects>({
        background: getTexture(seed, colors),
        backdropFilter: seed.buttonStyle === 'glass' ? 'blur(22px) saturate(145%)' : seed.texture === 'aero' ? 'blur(18px) saturate(135%)' : 'none',
        transitionSpeed: seed.transitionSpeed,
        animationName: seed.texture === 'grid' ? 'theme-grid-drift' : seed.texture === 'glass' || seed.texture === 'aero' ? 'theme-aurora-drift' : undefined,
        scrollbarStyle: seed.buttonStyle === 'retro-3d' || seed.texture === 'scanline' ? 'classic' : 'modern',
        panel: seed.buttonStyle === 'retro-3d'
            ? colors.bgSecondary
            : `linear-gradient(135deg, ${colors.glassBg}, ${hsla(seed.hue + 34, 56, dark ? 21 : 94, dark ? 0.54 : 0.78)})`,
        button: getButtonGradient(seed.buttonStyle, colors, seed),
        texture: getTexture(seed, colors),
        glowPink: shadows.glow,
        glowBlue: `0 0 28px ${hsla(seed.hue + 76, 90, 58, 0.42)}`,
        backdropBlur: seed.buttonStyle === 'glass' ? 'blur(22px)' : seed.texture === 'aero' ? 'blur(18px)' : 'blur(10px)',
    }, blueprint.effects);

    return {
        id: seed.id,
        name: seed.name,
        category: seed.category,
        tags: seed.tags || [],
        colors,
        borders,
        shadows,
        typography,
        effects,
        buttonStyle: seed.buttonStyle,
        surface: seed.surface,
        corners: {
            sm: `${Math.max(0, radius - 4)}px`,
            md: borders.radiusCard,
            lg: borders.radiusModal,
            full: radius < 4 ? '2px' : '999px',
        },
    };
}

const UI_THEME_SEEDS: UIThemeSeed[] = [
    // Apple / iOS / macOS (25)
    { id: 'system-7-classic', name: 'System 7 Classic', category: 'Apple/iOS/macOS', hue: 210, accentHue: 210, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.36, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['system 7', 'classic', 'retro'] },
    { id: 'platinum-os', name: 'Platinum OS', category: 'Apple/iOS/macOS', hue: 214, accentHue: 210, surface: 'light', buttonStyle: 'retro-3d', radius: 2, intensity: 0.4, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['platinum', 'classic'] },
    { id: 'macos-aqua-blue', name: 'macOS Aqua', category: 'Apple/iOS/macOS', hue: 202, accentHue: 198, surface: 'light', buttonStyle: 'bubble-aqua', radius: 16, intensity: 0.82, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'aero', shadowStyle: 'soft', tags: ['aqua', 'gel', 'blue'] },
    { id: 'macos-aqua-graphite', name: 'macOS Aqua Graphite', category: 'Apple/iOS/macOS', hue: 214, accentHue: 214, surface: 'light', buttonStyle: 'bubble-aqua', radius: 14, intensity: 0.56, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'metal', shadowStyle: 'soft', tags: ['aqua', 'graphite'] },
    { id: 'macos-brushed-metal', name: 'Mac Brushed Metal', category: 'Apple/iOS/macOS', hue: 218, accentHue: 206, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.48, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'metal', shadowStyle: 'inset', tags: ['metal', 'brushed'] },
    { id: 'macos-tiger', name: 'Mac OS X Tiger', category: 'Apple/iOS/macOS', hue: 205, accentHue: 190, surface: 'light', buttonStyle: 'bubble-aqua', radius: 14, intensity: 0.74, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['tiger', 'aqua'] },
    { id: 'macos-snow-leopard', name: 'Mac OS X Snow Leopard', category: 'Apple/iOS/macOS', hue: 216, accentHue: 206, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.42, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['snow', 'metal'] },
    { id: 'macos-yosemite', name: 'macOS Yosemite Flat', category: 'Apple/iOS/macOS', hue: 210, accentHue: 204, surface: 'light', buttonStyle: 'glass', radius: 12, intensity: 0.54, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['flat', 'translucent'] },
    { id: 'macos-mojave', name: 'macOS Mojave Dark', category: 'Apple/iOS/macOS', hue: 226, accentHue: 208, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.78, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['dark', 'mojave'] },
    { id: 'macos-big-sur', name: 'macOS Big Sur', category: 'Apple/iOS/macOS', hue: 216, accentHue: 318, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.78, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['big sur', 'rounded'] },
    { id: 'macos-sonoma', name: 'macOS Sonoma', category: 'Apple/iOS/macOS', hue: 258, accentHue: 24, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.9, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['sonoma', 'gradient'] },
    { id: 'macos-sequoia', name: 'macOS Sequoia Forest', category: 'Apple/iOS/macOS', hue: 156, accentHue: 110, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.76, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'nature', tags: ['sequoia', 'forest'] },
    { id: 'ios-1', name: 'iOS 1 Vintage', category: 'Apple/iOS/macOS', hue: 215, accentHue: 205, surface: 'dark', buttonStyle: 'glossy-luna', radius: 8, intensity: 0.68, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'linen', tags: ['ios', 'vintage'] },
    { id: 'ios-4-slate', name: 'iOS 4 Slate', category: 'Apple/iOS/macOS', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.72, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'linen', tags: ['ios', 'slate'] },
    { id: 'ios-7-flat', name: 'iOS 7 Ultra Thin', category: 'Apple/iOS/macOS', hue: 198, accentHue: 330, surface: 'light', buttonStyle: 'outline', radius: 4, intensity: 0.7, transitionSpeed: '0.25s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['ios', 'flat'] },
    { id: 'ios-16', name: 'iOS 16 Depth', category: 'Apple/iOS/macOS', hue: 222, accentHue: 292, surface: 'dark', buttonStyle: 'soft-modern', radius: 22, intensity: 0.82, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['ios', 'depth'] },
    { id: 'ios-18', name: 'iOS 18 Dark Neon', category: 'Apple/iOS/macOS', hue: 236, accentHue: 312, surface: 'dark', buttonStyle: 'neon', radius: 22, intensity: 0.92, transitionSpeed: '0.25s', fontFamily: FONT_SYSTEM, texture: 'glass', shadowStyle: 'glow', tags: ['ios', 'neon'] },
    { id: 'ios-glass-aero', name: 'iOS Glass', category: 'Apple/iOS/macOS', hue: 205, accentHue: 300, surface: 'light', buttonStyle: 'glass', radius: 24, intensity: 0.86, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['ios', 'glass', 'aero'] },
    { id: 'ios-crystal', name: 'iOS Crystal Clear', category: 'Apple/iOS/macOS', hue: 192, accentHue: 286, surface: 'light', buttonStyle: 'glass', radius: 26, intensity: 0.78, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['ios', 'crystal'] },
    { id: 'cupertino-silver', name: 'Cupertino Silver', category: 'Apple/iOS/macOS', hue: 216, accentHue: 206, surface: 'light', buttonStyle: 'soft-modern', radius: 20, intensity: 0.42, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['silver'] },
    { id: 'cupertino-gold', name: 'Cupertino Gold', category: 'Apple/iOS/macOS', hue: 42, accentHue: 38, surface: 'light', buttonStyle: 'soft-modern', radius: 20, intensity: 0.54, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['gold'] },
    { id: 'cupertino-midnight', name: 'Cupertino Midnight', category: 'Apple/iOS/macOS', hue: 226, accentHue: 204, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.86, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['midnight'] },
    { id: 'orchard-mist', name: 'Orchard Mist', category: 'Apple/iOS/macOS', hue: 120, accentHue: 98, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.6, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'nature', tags: ['orchard', 'mist'] },
    { id: 'quartz-extreme', name: 'Quartz Extreme', category: 'Apple/iOS/macOS', hue: 206, accentHue: 320, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.94, transitionSpeed: '0.32s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['quartz', 'glass'] },
    { id: 'ipod-classic', name: 'iPod Clickwheel', category: 'Apple/iOS/macOS', hue: 88, accentHue: 90, surface: 'light', buttonStyle: 'retro-3d', radius: 20, intensity: 0.4, transitionSpeed: '0.05s', fontFamily: FONT_MONO, texture: 'plain', tags: ['ipod', 'clickwheel'] },

    // Windows (25)
    { id: 'windows-95', name: 'Windows 95', category: 'Windows', hue: 186, accentHue: 208, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.42, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['classic', 'retro'] },
    { id: 'windows-98', name: 'Windows 98', category: 'Windows', hue: 204, accentHue: 214, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.46, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['classic', 'retro'] },
    { id: 'windows-2000', name: 'Windows 2000 Professional', category: 'Windows', hue: 208, accentHue: 204, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.38, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['classic'] },
    { id: 'windows-me', name: 'Windows ME Edition', category: 'Windows', hue: 164, accentHue: 190, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.42, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['classic'] },
    { id: 'windows-xp-luna', name: 'Windows XP', category: 'Windows', hue: 214, accentHue: 112, surface: 'light', buttonStyle: 'glossy-luna', radius: 8, intensity: 0.78, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['xp', 'luna'] },
    { id: 'windows-xp-olive', name: 'Windows XP Luna Olive', category: 'Windows', hue: 82, accentHue: 62, surface: 'light', buttonStyle: 'glossy-luna', radius: 8, intensity: 0.7, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['xp', 'olive'] },
    { id: 'windows-xp-metallic', name: 'Windows XP Metallic', category: 'Windows', hue: 218, accentHue: 28, surface: 'light', buttonStyle: 'glossy-luna', radius: 8, intensity: 0.62, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['xp', 'metallic'] },
    { id: 'windows-longhorn', name: 'Windows Longhorn Plex', category: 'Windows', hue: 220, accentHue: 32, surface: 'dark', buttonStyle: 'glass', radius: 12, intensity: 0.9, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['longhorn', 'plex'] },
    { id: 'windows-vista', name: 'Windows Vista Aero', category: 'Windows', hue: 212, accentHue: 190, surface: 'dark', buttonStyle: 'glass', radius: 12, intensity: 0.88, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['vista', 'aero'] },
    { id: 'windows-7-aero', name: 'Windows 7 Aero', category: 'Windows', hue: 204, accentHue: 189, surface: 'dark', buttonStyle: 'glass', radius: 12, intensity: 0.86, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['windows 7', 'aero'] },
    { id: 'windows-8-metro-blue', name: 'Windows 8 Metro Blue', category: 'Windows', hue: 198, accentHue: 198, surface: 'dark', buttonStyle: 'solid', radius: 0, intensity: 0.82, transitionSpeed: '0.12s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['metro', 'flat'] },
    { id: 'windows-8-metro-red', name: 'Windows 8 Metro Red', category: 'Windows', hue: 350, accentHue: 350, surface: 'dark', buttonStyle: 'solid', radius: 0, intensity: 0.82, transitionSpeed: '0.12s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['metro', 'flat'] },
    { id: 'windows-10-flat', name: 'Windows 10 Flat', category: 'Windows', hue: 208, accentHue: 198, surface: 'dark', buttonStyle: 'solid', radius: 2, intensity: 0.76, transitionSpeed: '0.12s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['flat'] },
    { id: 'windows-11-fluent', name: 'Windows 11 Fluent', category: 'Windows', hue: 214, accentHue: 263, surface: 'light', buttonStyle: 'glass', radius: 8, intensity: 0.64, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['fluent', 'mica'] },
    { id: 'office-classic', name: 'Office Classic', category: 'Windows', hue: 218, accentHue: 206, surface: 'light', buttonStyle: 'retro-3d', radius: 2, intensity: 0.44, transitionSpeed: '0.05s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['office'] },
    { id: 'office-2007', name: 'Office 2007 Blue', category: 'Windows', hue: 214, accentHue: 204, surface: 'light', buttonStyle: 'glossy-luna', radius: 10, intensity: 0.58, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['office'] },
    { id: 'office-2013', name: 'Office 2013 White', category: 'Windows', hue: 210, accentHue: 214, surface: 'light', buttonStyle: 'outline', radius: 2, intensity: 0.36, transitionSpeed: '0.12s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['office', 'white'] },
    { id: 'office-dark', name: 'Office Dark Mode', category: 'Windows', hue: 220, accentHue: 204, surface: 'dark', buttonStyle: 'solid', radius: 4, intensity: 0.62, transitionSpeed: '0.14s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['office', 'dark'] },
    { id: 'windows-server-grey', name: 'Windows Server Grey', category: 'Windows', hue: 214, accentHue: 210, surface: 'light', buttonStyle: 'solid', radius: 2, intensity: 0.36, transitionSpeed: '0.08s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['server'] },
    { id: 'chicago-beta', name: 'Chicago Beta', category: 'Windows', hue: 212, accentHue: 204, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.38, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['chicago', 'beta'] },
    { id: 'whistler-luna', name: 'Whistler Luna', category: 'Windows', hue: 204, accentHue: 180, surface: 'light', buttonStyle: 'glossy-luna', radius: 9, intensity: 0.74, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['whistler', 'beta'] },
    { id: 'longhorn-slate', name: 'Longhorn Slate', category: 'Windows', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'glass', radius: 8, intensity: 0.76, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['longhorn', 'slate'] },
    { id: 'slate-taskbar', name: 'Slate Taskbar', category: 'Windows', hue: 140, accentHue: 130, surface: 'dark', buttonStyle: 'solid', radius: 6, intensity: 0.72, transitionSpeed: '0.14s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['taskbar'] },
    { id: 'aurora-glass', name: 'Aurora Glass', category: 'Windows', hue: 236, accentHue: 156, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.96, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['aurora', 'glass'] },
    { id: 'redstone-flat', name: 'Redstone Flat', category: 'Windows', hue: 358, accentHue: 358, surface: 'dark', buttonStyle: 'solid', radius: 0, intensity: 0.78, transitionSpeed: '0.12s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['redstone', 'flat'] },

    // Android (20)
    { id: 'android-material-teal', name: 'Material Teal', category: 'Android', hue: 174, accentHue: 176, surface: 'light', buttonStyle: 'soft-modern', radius: 16, intensity: 0.58, transitionSpeed: '0.2s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material', 'teal'] },
    { id: 'material-you-pink', name: 'Material You Pastel Pink', category: 'Android', hue: 334, accentHue: 336, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material you'] },
    { id: 'material-you-green', name: 'Material You Pastel Green', category: 'Android', hue: 132, accentHue: 150, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material you'] },
    { id: 'material-you-blue', name: 'Material You Pastel Blue', category: 'Android', hue: 216, accentHue: 204, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material you'] },
    { id: 'material-you-peach', name: 'Material You Pastel Peach', category: 'Android', hue: 30, accentHue: 18, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material you'] },
    { id: 'material-you-lavender', name: 'Material You Lavender', category: 'Android', hue: 270, accentHue: 286, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.52, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['material you'] },
    { id: 'miui-orange', name: 'MIUI Orange', category: 'Android', hue: 26, accentHue: 26, surface: 'light', buttonStyle: 'soft-modern', radius: 18, intensity: 0.7, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['miui'] },
    { id: 'hyperos-glass', name: 'HyperOS Glass', category: 'Android', hue: 207, accentHue: 271, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.74, transitionSpeed: '0.28s', fontFamily: FONT_ROUNDED, texture: 'glass', tags: ['hyperos', 'glass'] },
    { id: 'one-ui-blue', name: 'One UI', category: 'Android', hue: 218, accentHue: 202, surface: 'light', buttonStyle: 'soft-modern', radius: 26, intensity: 0.56, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['one ui'] },
    { id: 'one-ui-purple', name: 'One UI Purple', category: 'Android', hue: 270, accentHue: 286, surface: 'light', buttonStyle: 'soft-modern', radius: 26, intensity: 0.58, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['one ui'] },
    { id: 'one-ui-dark', name: 'One UI Dark Mode', category: 'Android', hue: 225, accentHue: 210, surface: 'dark', buttonStyle: 'soft-modern', radius: 26, intensity: 0.68, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['one ui', 'dark'] },
    { id: 'coloros-green', name: 'ColorOS Pastel Green', category: 'Android', hue: 152, accentHue: 142, surface: 'light', buttonStyle: 'soft-modern', radius: 22, intensity: 0.5, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['coloros'] },
    { id: 'coloros-pink', name: 'ColorOS Pastel Pink', category: 'Android', hue: 334, accentHue: 342, surface: 'light', buttonStyle: 'soft-modern', radius: 22, intensity: 0.5, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['coloros'] },
    { id: 'oxygenos-crimson', name: 'OxygenOS Crimson', category: 'Android', hue: 235, accentHue: 358, surface: 'dark', buttonStyle: 'solid', radius: 12, intensity: 0.9, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['oxygenos', 'amoled'] },
    { id: 'oxygenos-slate', name: 'OxygenOS Slate', category: 'Android', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'outline', radius: 12, intensity: 0.7, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['oxygenos'] },
    { id: 'android-holo-blue', name: 'Holo Blue', category: 'Android', hue: 202, accentHue: 191, surface: 'dark', buttonStyle: 'outline', radius: 4, intensity: 0.86, transitionSpeed: '0.1s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['holo'] },
    { id: 'emerald-droid', name: 'Emerald Droid', category: 'Android', hue: 144, accentHue: 156, surface: 'dark', buttonStyle: 'soft-modern', radius: 16, intensity: 0.78, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['emerald'] },
    { id: 'clay-phone', name: 'Clay Phone', category: 'Android', hue: 24, accentHue: 312, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.44, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'paper', tags: ['clay', 'neumorphism'] },
    { id: 'neon-widget', name: 'Neon Widget', category: 'Android', hue: 268, accentHue: 178, surface: 'dark', buttonStyle: 'neon', radius: 18, intensity: 0.98, transitionSpeed: '0.18s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['neon', 'widget'] },
    { id: 'sunrise-mobile', name: 'Sunrise Mobile', category: 'Android', hue: 31, accentHue: 340, surface: 'light', buttonStyle: 'soft-modern', radius: 24, intensity: 0.72, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['sunrise'] },
    
    // Linux (20)
    { id: 'ubuntu-orange', name: 'Ubuntu', category: 'Linux', hue: 20, accentHue: 20, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.86, transitionSpeed: '0.16s', fontFamily: FONT_UBUNTU, texture: 'plain', tags: ['ubuntu'] },
    { id: 'ubuntu-yaru', name: 'Ubuntu Yaru Dark', category: 'Linux', hue: 225, accentHue: 20, surface: 'dark', buttonStyle: 'soft-modern', radius: 10, intensity: 0.78, transitionSpeed: '0.18s', fontFamily: FONT_UBUNTU, texture: 'plain', tags: ['ubuntu', 'yaru'] },
    { id: 'kde-breeze-light', name: 'KDE Breeze Light', category: 'Linux', hue: 205, accentHue: 198, surface: 'light', buttonStyle: 'glass', radius: 8, intensity: 0.46, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['kde', 'breeze'] },
    { id: 'kde-breeze-dark', name: 'KDE Plasma', category: 'Linux', hue: 214, accentHue: 204, surface: 'dark', buttonStyle: 'glass', radius: 8, intensity: 0.66, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['kde', 'breeze'] },
    { id: 'gnome-adwaita-light', name: 'GNOME Adwaita', category: 'Linux', hue: 220, accentHue: 210, surface: 'light', buttonStyle: 'soft-modern', radius: 8, intensity: 0.4, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['gnome'] },
    { id: 'gnome-adwaita-dark', name: 'GNOME Adwaita Dark', category: 'Linux', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'soft-modern', radius: 8, intensity: 0.62, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['gnome'] },
    { id: 'mint-cinnamon', name: 'Cinnamon Mint', category: 'Linux', hue: 144, accentHue: 118, surface: 'light', buttonStyle: 'soft-modern', radius: 10, intensity: 0.54, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['mint'] },
    { id: 'fedora-blue', name: 'Fedora Slate Blue', category: 'Linux', hue: 218, accentHue: 205, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.72, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['fedora'] },
    { id: 'arch-terminal', name: 'Arch CLI', category: 'Linux', hue: 206, accentHue: 198, surface: 'dark', buttonStyle: 'outline', radius: 3, intensity: 0.88, transitionSpeed: '0s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['arch', 'terminal'] },
    { id: 'debian-red', name: 'Debian Spiral Red', category: 'Linux', hue: 350, accentHue: 344, surface: 'light', buttonStyle: 'outline', radius: 8, intensity: 0.48, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['debian'] },
    { id: 'solarized-light', name: 'Solarized Light', category: 'Linux', hue: 44, accentHue: 192, surface: 'light', buttonStyle: 'outline', radius: 8, intensity: 0.42, transitionSpeed: '0.16s', fontFamily: FONT_MONO, texture: 'paper', tags: ['solarized'] },
    { id: 'solarized-dark', name: 'Solarized Dark', category: 'Linux', hue: 192, accentHue: 43, surface: 'dark', buttonStyle: 'outline', radius: 8, intensity: 0.62, transitionSpeed: '0.16s', fontFamily: FONT_MONO, texture: 'plain', tags: ['solarized'] },
    { id: 'dracula-shell', name: 'Dracula Shell', category: 'Linux', hue: 270, accentHue: 326, surface: 'dark', buttonStyle: 'neon', radius: 10, intensity: 0.86, transitionSpeed: '0.16s', fontFamily: FONT_MONO, texture: 'plain', shadowStyle: 'glow', tags: ['dracula'] },
    { id: 'amber-terminal', name: 'Amber Terminal', category: 'Linux', hue: 36, accentHue: 41, surface: 'dark', buttonStyle: 'outline', radius: 4, intensity: 0.86, transitionSpeed: '0s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['terminal'] },
    { id: 'cosmic-desktop', name: 'Cosmic Desktop', category: 'Linux', hue: 232, accentHue: 176, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.88, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'glass', tags: ['cosmic'] },
    { id: 'nord-frost', name: 'Nord Frost', category: 'Linux', hue: 220, accentHue: 194, surface: 'dark', buttonStyle: 'soft-modern', radius: 10, intensity: 0.62, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'plain', tags: ['nord'] },
    { id: 'alpine-minimal', name: 'Alpine Minimal', category: 'Linux', hue: 196, accentHue: 180, surface: 'light', buttonStyle: 'outline', radius: 6, intensity: 0.34, transitionSpeed: '0.14s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'flat', tags: ['minimal'] },
    { id: 'paper-window', name: 'Paper Window', category: 'Linux', hue: 210, accentHue: 150, surface: 'light', buttonStyle: 'soft-modern', radius: 8, intensity: 0.42, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'paper', tags: ['paper'] },
    { id: 'xfce-classic', name: 'XFCE Classic', category: 'Linux', hue: 210, accentHue: 202, surface: 'light', buttonStyle: 'retro-3d', radius: 2, intensity: 0.38, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', tags: ['xfce', 'classic'] },
    { id: 'deepin-beauty', name: 'Deepin Glassmorphism', category: 'Linux', hue: 206, accentHue: 286, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.9, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['deepin', 'glass'] },

    // Gaming (20)
    { id: 'rgb-gamer-night', name: 'RGB Gamer Night', category: 'Gaming', hue: 258, accentHue: 176, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 1.06, transitionSpeed: '0.16s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['rgb'] },
    { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', category: 'Gaming', hue: 246, accentHue: 57, surface: 'dark', buttonStyle: 'neon', radius: 6, intensity: 1.08, transitionSpeed: '0.14s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['cyberpunk'] },
    { id: 'arcade-cabinet', name: 'Arcade Cabinet', category: 'Gaming', hue: 248, accentHue: 352, surface: 'dark', buttonStyle: 'retro-3d', radius: 4, intensity: 0.94, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'scanline', shadowStyle: 'hard', tags: ['arcade'] },
    { id: 'laser-grid', name: 'Laser Grid Synthwave', category: 'Gaming', hue: 268, accentHue: 188, surface: 'dark', buttonStyle: 'neon', radius: 4, intensity: 1.08, transitionSpeed: '0.16s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['synthwave'] },
    { id: 'retro-console', name: 'Retro Console Grey', category: 'Gaming', hue: 210, accentHue: 356, surface: 'light', buttonStyle: 'retro-3d', radius: 4, intensity: 0.48, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['console'] },
    { id: 'plasma-arena', name: 'Plasma Arena', category: 'Gaming', hue: 252, accentHue: 15, surface: 'dark', buttonStyle: 'neon', radius: 16, intensity: 0.98, transitionSpeed: '0.18s', fontFamily: FONT_GAMING, texture: 'glass', shadowStyle: 'glow', tags: ['plasma'] },
    { id: 'speedrun-mint', name: 'Speedrun Mint', category: 'Gaming', hue: 154, accentHue: 194, surface: 'dark', buttonStyle: 'neon', radius: 10, intensity: 0.9, transitionSpeed: '0.12s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['speedrun'] },
    { id: 'boss-battle', name: 'Boss Battle Red', category: 'Gaming', hue: 6, accentHue: 42, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.98, transitionSpeed: '0.16s', fontFamily: FONT_GAMING, texture: 'nature', shadowStyle: 'glow', tags: ['boss'] },
    { id: 'mech-lab', name: 'Mech Lab', category: 'Gaming', hue: 216, accentHue: 28, surface: 'dark', buttonStyle: 'solid', radius: 6, intensity: 0.82, transitionSpeed: '0.12s', fontFamily: FONT_GAMING, texture: 'carbon', tags: ['mech'] },
    { id: 'holo-hud', name: 'Holo HUD', category: 'Gaming', hue: 146, accentHue: 160, surface: 'dark', buttonStyle: 'outline', radius: 8, intensity: 0.9, transitionSpeed: '0.1s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['hud'] },
    { id: 'toxic-green', name: 'Toxic Waste', category: 'Gaming', hue: 110, accentHue: 92, surface: 'dark', buttonStyle: 'neon', radius: 8, intensity: 1.02, transitionSpeed: '0.14s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['toxic'] },
    { id: 'rpg-quest', name: 'RPG Parchment', category: 'Gaming', hue: 42, accentHue: 30, surface: 'light', buttonStyle: 'solid', radius: 8, intensity: 0.48, transitionSpeed: '0.16s', fontFamily: "Georgia, 'Times New Roman', serif", texture: 'paper', tags: ['rpg', 'parchment'] },
    { id: 'steampunk-brass', name: 'Steampunk Brass', category: 'Gaming', hue: 32, accentHue: 42, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.86, transitionSpeed: '0.16s', fontFamily: FONT_ROUNDED, texture: 'metal', tags: ['steampunk'] },
    { id: 'pixel-fighter', name: 'Pixel Fighter', category: 'Gaming', hue: 218, accentHue: 18, surface: 'dark', buttonStyle: 'retro-3d', radius: 2, intensity: 0.9, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'scanline', shadowStyle: 'hard', tags: ['pixel'] },
    { id: 'virtual-reality', name: 'VR Neon Blue', category: 'Gaming', hue: 220, accentHue: 190, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 0.98, transitionSpeed: '0.14s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['vr'] },
    { id: 'handheld-retro', name: 'Handheld Yellow', category: 'Gaming', hue: 50, accentHue: 350, surface: 'light', buttonStyle: 'retro-3d', radius: 10, intensity: 0.64, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['handheld'] },
    { id: 'space-cadet', name: 'Space Cadet', category: 'Gaming', hue: 232, accentHue: 286, surface: 'dark', buttonStyle: 'glossy-luna', radius: 12, intensity: 0.92, transitionSpeed: '0.16s', fontFamily: FONT_GAMING, texture: 'aero', shadowStyle: 'glow', tags: ['space'] },
    { id: 'gladiator-gold', name: 'Gladiator Gold', category: 'Gaming', hue: 36, accentHue: 278, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.9, transitionSpeed: '0.18s', fontFamily: FONT_ROUNDED, texture: 'metal', tags: ['gold'] },
    { id: 'cosmic-nebula', name: 'Cosmic Nebula', category: 'Gaming', hue: 256, accentHue: 306, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 1.0, transitionSpeed: '0.24s', fontFamily: FONT_GAMING, texture: 'aero', shadowStyle: 'glow', tags: ['nebula'] },
    { id: 'neon-racer', name: 'Neon Racer', category: 'Gaming', hue: 248, accentHue: 0, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 1.06, transitionSpeed: '0.14s', fontFamily: FONT_GAMING, texture: 'grid', shadowStyle: 'glow', tags: ['racer'] },

    // Retro & Vintage (15)
    { id: 'crt-green', name: 'CRT Monitor Green', category: 'Retro', hue: 128, accentHue: 120, surface: 'dark', buttonStyle: 'outline', radius: 3, intensity: 0.86, transitionSpeed: '0s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['crt'] },
    { id: 'crt-amber', name: 'CRT Monitor Amber', category: 'Retro', hue: 34, accentHue: 36, surface: 'dark', buttonStyle: 'outline', radius: 3, intensity: 0.84, transitionSpeed: '0s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'glow', tags: ['crt'] },
    { id: 'ms-dos', name: 'MS-DOS Command Line', category: 'Retro', hue: 220, accentHue: 220, surface: 'dark', buttonStyle: 'outline', radius: 0, intensity: 0.68, transitionSpeed: '0s', fontFamily: FONT_MONO, texture: 'scanline', shadowStyle: 'flat', tags: ['dos', 'terminal'] },
    { id: 'commodore-64', name: 'C64 Blue', category: 'Retro', hue: 228, accentHue: 206, surface: 'dark', buttonStyle: 'retro-3d', radius: 0, intensity: 0.72, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'scanline', shadowStyle: 'hard', tags: ['c64'] },
    { id: 'amiga-workbench', name: 'Amiga Workbench', category: 'Retro', hue: 204, accentHue: 28, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.5, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['amiga'] },
    { id: 'macintosh-plus', name: 'Macintosh Plus B&W', category: 'Retro', hue: 214, accentHue: 214, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.32, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'paper', shadowStyle: 'hard', tags: ['macintosh', 'mono'] },
    { id: 'vintage-web', name: 'Web 1.0', category: 'Retro', hue: 204, accentHue: 240, surface: 'light', buttonStyle: 'retro-3d', radius: 0, intensity: 0.42, transitionSpeed: '0s', fontFamily: "Arial, 'Times New Roman', serif", texture: 'plain', tags: ['web'] },
    { id: 'memphis-pattern', name: 'Memphis Group', category: 'Retro', hue: 188, accentHue: 330, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.76, transitionSpeed: '0.16s', fontFamily: FONT_ROUNDED, texture: 'grid', tags: ['memphis'] },
    { id: 'eight-bit-love', name: '8-Bit Love', category: 'Retro', hue: 322, accentHue: 340, surface: 'dark', buttonStyle: 'retro-3d', radius: 0, intensity: 0.9, transitionSpeed: '0s', fontFamily: FONT_RETRO, texture: 'scanline', shadowStyle: 'hard', tags: ['8-bit'] },
    { id: 'cassette-tape', name: 'Cassette Tape', category: 'Retro', hue: 32, accentHue: 326, surface: 'light', buttonStyle: 'solid', radius: 8, intensity: 0.54, transitionSpeed: '0.16s', fontFamily: FONT_ROUNDED, texture: 'paper', tags: ['cassette'] },
    { id: 'floppy-disc', name: 'Floppy Disc', category: 'Retro', hue: 220, accentHue: 202, surface: 'light', buttonStyle: 'retro-3d', radius: 3, intensity: 0.5, transitionSpeed: '0.05s', fontFamily: FONT_RETRO, texture: 'plain', shadowStyle: 'hard', tags: ['floppy'] },
    { id: 'typewriter', name: 'Typewriter Paper', category: 'Retro', hue: 40, accentHue: 30, surface: 'light', buttonStyle: 'outline', radius: 6, intensity: 0.38, transitionSpeed: '0.08s', fontFamily: "Georgia, 'Times New Roman', serif", texture: 'paper', tags: ['typewriter'] },
    { id: 'polaroid', name: 'Polaroid Frame', category: 'Retro', hue: 42, accentHue: 210, surface: 'light', buttonStyle: 'solid', radius: 4, intensity: 0.4, transitionSpeed: '0.16s', fontFamily: FONT_ROUNDED, texture: 'paper', tags: ['photo'] },
    { id: 'art-deco', name: 'Art Deco Gold', category: 'Retro', hue: 236, accentHue: 42, surface: 'dark', buttonStyle: 'outline', radius: 2, intensity: 0.82, transitionSpeed: '0.16s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['deco', 'gold'] },
    { id: 'bauhaus', name: 'Bauhaus Grid', category: 'Retro', hue: 44, accentHue: 0, surface: 'light', buttonStyle: 'solid', radius: 0, intensity: 0.72, transitionSpeed: '0.12s', fontFamily: FONT_ROUNDED, texture: 'grid', tags: ['bauhaus'] },

    // Premium & Glass (15)
    { id: 'gold-vip', name: 'Gold VIP Lounge', category: 'Premium', hue: 38, accentHue: 42, surface: 'dark', buttonStyle: 'solid', radius: 16, intensity: 0.9, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'metal', tags: ['vip', 'gold'] },
    { id: 'champagne', name: 'Champagne Sparkle', category: 'Premium', hue: 38, accentHue: 348, surface: 'light', buttonStyle: 'soft-modern', radius: 16, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'glass', tags: ['champagne'] },
    { id: 'velvet-royal', name: 'Velvet Royal Purple', category: 'Premium', hue: 282, accentHue: 316, surface: 'dark', buttonStyle: 'soft-modern', radius: 18, intensity: 0.84, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'plain', tags: ['royal'] },
    { id: 'diamond-frost', name: 'Diamond Frost', category: 'Premium', hue: 196, accentHue: 210, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.58, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['diamond'] },
    { id: 'obsidian-luxe', name: 'Obsidian Luxe', category: 'Premium', hue: 230, accentHue: 282, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.86, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'carbon', tags: ['obsidian'] },
    { id: 'emerald-vip', name: 'Emerald VIP', category: 'Premium', hue: 150, accentHue: 158, surface: 'dark', buttonStyle: 'solid', radius: 16, intensity: 0.86, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'glass', tags: ['emerald'] },
    { id: 'sapphire-luxe', name: 'Sapphire Luxe', category: 'Premium', hue: 220, accentHue: 202, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.84, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'glass', tags: ['sapphire'] },
    { id: 'ruby-night', name: 'Ruby Night', category: 'Premium', hue: 348, accentHue: 330, surface: 'dark', buttonStyle: 'solid', radius: 16, intensity: 0.88, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'glass', tags: ['ruby'] },
    { id: 'liquid-mercury', name: 'Liquid Mercury', category: 'Premium', hue: 214, accentHue: 202, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.54, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['mercury'] },
    { id: 'glassmorphism-aurora', name: 'Glassmorphism Aurora', category: 'Premium', hue: 214, accentHue: 286, surface: 'dark', buttonStyle: 'glass', radius: 22, intensity: 0.92, transitionSpeed: '0.28s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['default', 'glass', 'aurora'] },
    { id: 'platinum-card', name: 'Platinum Card', category: 'Premium', hue: 216, accentHue: 208, surface: 'light', buttonStyle: 'soft-modern', radius: 14, intensity: 0.42, transitionSpeed: '0.22s', fontFamily: FONT_SYSTEM, texture: 'metal', tags: ['platinum'] },
    { id: 'satin-rose', name: 'Satin Rose Gold', category: 'Premium', hue: 340, accentHue: 20, surface: 'light', buttonStyle: 'soft-modern', radius: 18, intensity: 0.52, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'metal', tags: ['rose gold'] },
    { id: 'carbon-fiber', name: 'Carbon Fiber Dark', category: 'Premium', hue: 230, accentHue: 198, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.78, transitionSpeed: '0.16s', fontFamily: FONT_SYSTEM, texture: 'carbon', tags: ['carbon'] },
    { id: 'alabaster-clean', name: 'Alabaster Clean', category: 'Premium', hue: 40, accentHue: 206, surface: 'light', buttonStyle: 'outline', radius: 14, intensity: 0.34, transitionSpeed: '0.2s', fontFamily: FONT_SYSTEM, texture: 'plain', shadowStyle: 'soft', tags: ['clean'] },
    { id: 'cosmic-dust', name: 'Cosmic Dust', category: 'Premium', hue: 252, accentHue: 42, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.9, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'aero', tags: ['cosmic'] },

    // Nature & Espace (10)
    { id: 'space-galaxy', name: 'Deep Space Galaxy', category: 'Nature', hue: 248, accentHue: 292, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 1.02, transitionSpeed: '0.26s', fontFamily: FONT_ROUNDED, texture: 'aero', tags: ['space', 'galaxy'] },
    { id: 'coral-reef', name: 'Coral Reef', category: 'Nature', hue: 178, accentHue: 12, surface: 'light', buttonStyle: 'soft-modern', radius: 20, intensity: 0.66, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'nature', tags: ['coral'] },
    { id: 'ocean-depth', name: 'Ocean Depths', category: 'Nature', hue: 198, accentHue: 184, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.84, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'nature', tags: ['ocean'] },
    { id: 'forest-moss', name: 'Forest Moss', category: 'Nature', hue: 136, accentHue: 104, surface: 'dark', buttonStyle: 'soft-modern', radius: 16, intensity: 0.74, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'nature', tags: ['forest'] },
    { id: 'desert-dune', name: 'Desert Dune', category: 'Nature', hue: 34, accentHue: 24, surface: 'light', buttonStyle: 'solid', radius: 12, intensity: 0.62, transitionSpeed: '0.22s', fontFamily: FONT_ROUNDED, texture: 'paper', tags: ['desert'] },
    { id: 'sakura-blossom', name: 'Sakura Blossom', category: 'Nature', hue: 328, accentHue: 342, surface: 'light', buttonStyle: 'soft-modern', radius: 22, intensity: 0.58, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'nature', tags: ['sakura'] },
    { id: 'arctic-ice', name: 'Arctic Ice', category: 'Nature', hue: 196, accentHue: 206, surface: 'light', buttonStyle: 'glass', radius: 18, intensity: 0.5, transitionSpeed: '0.24s', fontFamily: FONT_SYSTEM, texture: 'aero', tags: ['ice'] },
    { id: 'sunset-glow', name: 'Sunset Glow', category: 'Nature', hue: 18, accentHue: 330, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.92, transitionSpeed: '0.24s', fontFamily: FONT_ROUNDED, texture: 'aero', tags: ['sunset'] },
    { id: 'storm-cloud', name: 'Storm Cloud', category: 'Nature', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'outline', radius: 12, intensity: 0.76, transitionSpeed: '0.18s', fontFamily: FONT_SYSTEM, texture: 'nature', tags: ['storm'] },
    { id: 'volcano', name: 'Volcano Magma', category: 'Nature', hue: 10, accentHue: 30, surface: 'dark', buttonStyle: 'solid', radius: 14, intensity: 0.98, transitionSpeed: '0.2s', fontFamily: FONT_ROUNDED, texture: 'nature', shadowStyle: 'glow', tags: ['volcano'] },
];

const UI_THEMES = UI_THEME_SEEDS.map(createUITheme);

function getUIThemes(): UITheme[] {
    return UI_THEMES;
}

function getUIThemeFilters(): Array<UIThemeCategory | 'Tous'> {
    return UI_THEME_FILTERS;
}

function getUIThemeById(themeId?: string | null): UITheme {
    return UI_THEMES.find(theme => theme.id === themeId) ||
        UI_THEMES.find(theme => theme.id === DEFAULT_UI_THEME_ID) ||
        UI_THEMES[0];
}

function filterUIThemes(query: string, category: UIThemeCategory | 'Tous'): UITheme[] {
    const cleanQuery = query.trim().toLowerCase();

    return UI_THEMES.filter(theme => {
        const categoryMatches = category === 'Tous' || theme.category === category;
        const queryMatches = !cleanQuery ||
            theme.name.toLowerCase().includes(cleanQuery) ||
            theme.id.toLowerCase().includes(cleanQuery) ||
            theme.category.toLowerCase().includes(cleanQuery) ||
            theme.tags.some(tag => tag.toLowerCase().includes(cleanQuery));

        return categoryMatches && queryMatches;
    });
}

function setThemeVariable(style: CSSStyleDeclaration, name: string, value: string): void {
    style.setProperty(name, value);
}

function applyUITheme(themeId?: string | null): UITheme {
    const theme = getUIThemeById(themeId);
    const root = document.documentElement;
    const style = root.style;

    root.dataset.uiTheme = theme.id;
    root.dataset.uiThemeCategory = theme.category;
    root.dataset.uiButtonStyle = theme.buttonStyle;
    root.dataset.uiSurface = theme.surface;
    root.dataset.uiScrollbar = theme.effects.scrollbarStyle;

    setThemeVariable(style, '--bg-primary', theme.colors.bgPrimary);
    setThemeVariable(style, '--bg-secondary', theme.colors.bgSecondary);
    setThemeVariable(style, '--bg-card', theme.colors.bgCard);
    setThemeVariable(style, '--bg-hover', theme.colors.bgHover);
    setThemeVariable(style, '--text-primary', theme.colors.textPrimary);
    setThemeVariable(style, '--text-secondary', theme.colors.textSecondary);
    setThemeVariable(style, '--text-muted', theme.colors.textMuted);
    setThemeVariable(style, '--accent-pink', theme.colors.accentPink);
    setThemeVariable(style, '--accent-blue', theme.colors.accentBlue);
    setThemeVariable(style, '--accent-purple', theme.colors.accentPurple);
    setThemeVariable(style, '--accent-gold', theme.colors.accentGold);
    setThemeVariable(style, '--success', theme.colors.success);
    setThemeVariable(style, '--error', theme.colors.error);
    setThemeVariable(style, '--warning', theme.colors.warning);
    setThemeVariable(style, '--info', theme.colors.info);
    setThemeVariable(style, '--glass-bg', theme.colors.glassBg);
    setThemeVariable(style, '--glass-bg-strong', theme.colors.glassBgStrong);
    setThemeVariable(style, '--glass-border', theme.colors.glassBorder);
    setThemeVariable(style, '--premium-pink', theme.colors.accentPink);
    setThemeVariable(style, '--premium-violet', theme.colors.accentPurple);
    setThemeVariable(style, '--premium-cyan', theme.colors.accentBlue);
    setThemeVariable(style, '--night-blue', theme.colors.bgPrimary);
    setThemeVariable(style, '--radius-sm', theme.corners.sm);
    setThemeVariable(style, '--radius-md', theme.corners.md);
    setThemeVariable(style, '--radius-lg', theme.corners.lg);
    setThemeVariable(style, '--radius-full', theme.corners.full);
    setThemeVariable(style, '--shadow-sm', theme.shadows.sm);
    setThemeVariable(style, '--shadow-md', theme.shadows.md);
    setThemeVariable(style, '--shadow-lg', theme.shadows.lg);
    setThemeVariable(style, '--shadow-glow-pink', theme.shadows.glow);
    setThemeVariable(style, '--shadow-glow-blue', theme.effects.glowBlue);
    setThemeVariable(style, '--ui-font-family', theme.typography.fontFamily);
    setThemeVariable(style, '--ui-font-size-multiplier', theme.typography.fontSizeMultiplier);
    setThemeVariable(style, '--ui-letter-spacing', theme.typography.letterSpacing);
    setThemeVariable(style, '--ui-header-text-transform', theme.typography.textTransformHeaders);
    setThemeVariable(style, '--ui-bg-primary', theme.colors.bgPrimary);
    setThemeVariable(style, '--ui-bg-secondary', theme.colors.bgSecondary);
    setThemeVariable(style, '--ui-bg-card', theme.colors.bgCard);
    setThemeVariable(style, '--ui-bg-hover', theme.colors.bgHover);
    setThemeVariable(style, '--ui-border-color', theme.colors.border);
    setThemeVariable(style, '--ui-card-border-width', theme.borders.width);
    setThemeVariable(style, '--ui-card-border-style', theme.borders.style);
    setThemeVariable(style, '--ui-card-border-color', theme.borders.color);
    setThemeVariable(style, '--ui-card-radius', theme.borders.radiusCard);
    setThemeVariable(style, '--ui-modal-border-width', theme.borders.width);
    setThemeVariable(style, '--ui-modal-border-style', theme.borders.style);
    setThemeVariable(style, '--ui-modal-border-color', theme.borders.color);
    setThemeVariable(style, '--ui-button-radius', theme.borders.radiusButton);
    setThemeVariable(style, '--ui-modal-radius', theme.borders.radiusModal);
    setThemeVariable(style, '--ui-card-shadow', theme.shadows.card);
    setThemeVariable(style, '--ui-button-shadow', theme.shadows.button);
    setThemeVariable(style, '--ui-modal-shadow', theme.shadows.modal);
    setThemeVariable(style, '--ui-theme-background', theme.effects.background);
    setThemeVariable(style, '--ui-theme-panel', theme.effects.panel);
    setThemeVariable(style, '--ui-theme-button', theme.effects.button);
    setThemeVariable(style, '--ui-theme-texture', theme.effects.texture);
    setThemeVariable(style, '--ui-theme-backdrop-blur', theme.effects.backdropBlur);
    setThemeVariable(style, '--ui-backdrop-filter', theme.effects.backdropFilter);
    setThemeVariable(style, '--ui-transition-speed', theme.effects.transitionSpeed);
    setThemeVariable(style, '--ui-theme-animation', theme.effects.animationName || 'none');
    setThemeVariable(style, '--ui-scrollbar-thumb', theme.colors.accentBlue);
    setThemeVariable(style, '--ui-scrollbar-track', theme.colors.bgSecondary);

    return theme;
}
