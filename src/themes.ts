/**
 * World of Love — Themes UI v1.1.2
 *
 * Catalogue original inspire de grandes familles visuelles, sans logos ni assets
 * officiels. Les themes pilotent l'interface via des variables CSS.
 */

type UIThemeCategory =
    | 'Apple/iOS/macOS'
    | 'Windows'
    | 'Android'
    | 'Linux'
    | 'Gaming'
    | 'Retro'
    | 'Premium'
    | 'Nature'
    | 'Anime';

type UIThemeSurface = 'dark' | 'light';
type UIThemeButtonStyle = 'glass' | 'solid' | 'outline' | 'neon' | 'soft' | 'pixel';

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
    glassBg: string;
    glassBgStrong: string;
    glassBorder: string;
    success: string;
    error: string;
    warning: string;
    info: string;
}

interface UIThemeEffects {
    background: string;
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

interface UIThemeShadows {
    sm: string;
    md: string;
    lg: string;
}

interface UITheme {
    id: string;
    name: string;
    category: UIThemeCategory;
    tags: string[];
    colors: UIThemeColors;
    effects: UIThemeEffects;
    corners: UIThemeCorners;
    shadows: UIThemeShadows;
    buttonStyle: UIThemeButtonStyle;
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
    tags?: string[];
}

const APP_DISPLAY_VERSION = 'v1.1.2';
const DEFAULT_UI_THEME_ID = 'dark-premium';
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
    'Anime',
];

function clampHue(value: number): number {
    return ((value % 360) + 360) % 360;
}

function hsl(hue: number, saturation: number, lightness: number): string {
    return `hsl(${clampHue(hue)}, ${saturation}%, ${lightness}%)`;
}

function hsla(hue: number, saturation: number, lightness: number, alpha: number): string {
    return `hsla(${clampHue(hue)}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function createUITheme(seed: UIThemeSeed): UITheme {
    const dark = seed.surface === 'dark';
    const hue = clampHue(seed.hue);
    const accent = clampHue(seed.accentHue);
    const secondAccent = clampHue((seed.hue + seed.accentHue) / 2 + 38);
    const intensity = Math.max(0.35, Math.min(1.15, seed.intensity));
    const radius = Math.max(0, seed.radius);
    const softAlpha = dark ? 0.72 : 0.82;
    const cardLightness = dark ? Math.round(14 + intensity * 7) : Math.round(96 - intensity * 3);

    const colors: UIThemeColors = {
        bgPrimary: dark ? hsl(hue, 48, Math.round(7 + intensity * 2)) : hsl(hue, 54, 96),
        bgSecondary: dark ? hsl(hue, 46, Math.round(12 + intensity * 4)) : hsl(hue, 46, 91),
        bgCard: dark ? hsla(hue, 44, cardLightness, softAlpha) : hsla(hue, 42, cardLightness, softAlpha),
        bgHover: dark ? hsl(hue, 42, Math.round(20 + intensity * 5)) : hsl(hue, 44, 86),
        textPrimary: dark ? hsl(hue, 24, 96) : hsl(hue, 30, 13),
        textSecondary: dark ? hsl(hue, 22, 74) : hsl(hue, 20, 36),
        textMuted: dark ? hsl(hue, 15, 47) : hsl(hue, 16, 54),
        accentPink: hsl(accent, 88, dark ? 67 : 45),
        accentBlue: hsl(secondAccent, 88, dark ? 64 : 42),
        accentPurple: hsl(clampHue(accent + 52), 82, dark ? 62 : 44),
        accentGold: hsl(clampHue(accent + 148), 92, dark ? 63 : 46),
        glassBg: dark ? hsla(hue, 46, cardLightness, seed.buttonStyle === 'glass' ? 0.68 : 0.82) : hsla(hue, 42, 96, seed.buttonStyle === 'glass' ? 0.74 : 0.9),
        glassBgStrong: dark ? hsla(hue, 48, Math.round(cardLightness + 2), 0.9) : hsla(hue, 42, 98, 0.94),
        glassBorder: dark ? hsla(accent, 70, 78, 0.2 + intensity * 0.08) : hsla(hue, 42, 34, 0.14 + intensity * 0.08),
        success: hsl(145, 62, dark ? 54 : 38),
        error: hsl(2, 78, dark ? 62 : 48),
        warning: hsl(40, 90, dark ? 60 : 43),
        info: hsl(secondAccent, 82, dark ? 62 : 42),
    };

    const background = dark
        ? [
            `radial-gradient(circle at 12% 8%, ${hsla(accent, 92, 64, 0.16 + intensity * 0.1)}, transparent 31rem)`,
            `radial-gradient(circle at 88% 12%, ${hsla(secondAccent, 92, 62, 0.12 + intensity * 0.09)}, transparent 34rem)`,
            `linear-gradient(180deg, ${hsl(hue, 52, Math.round(8 + intensity * 2))}, ${colors.bgPrimary} 48%, ${hsl(hue + 12, 46, 5)})`,
        ].join(', ')
        : [
            `radial-gradient(circle at 12% 10%, ${hsla(accent, 80, 72, 0.2)}, transparent 29rem)`,
            `radial-gradient(circle at 88% 8%, ${hsla(secondAccent, 76, 68, 0.18)}, transparent 32rem)`,
            `linear-gradient(180deg, ${hsl(hue, 60, 98)}, ${colors.bgPrimary} 48%, ${hsl(hue + 10, 44, 91)})`,
        ].join(', ');

    const effects: UIThemeEffects = {
        background,
        panel: seed.buttonStyle === 'pixel'
            ? `linear-gradient(135deg, ${colors.bgCard}, ${hsla(hue, 38, dark ? 12 : 92, 0.95)})`
            : `linear-gradient(135deg, ${colors.glassBg}, ${hsla(secondAccent, 62, dark ? 22 : 94, dark ? 0.5 : 0.72)})`,
        button: seed.buttonStyle === 'outline'
            ? `linear-gradient(135deg, ${hsla(accent, 90, dark ? 58 : 46, 0.18)}, ${hsla(secondAccent, 88, dark ? 54 : 42, 0.22)})`
            : `linear-gradient(135deg, ${colors.accentPink}, ${colors.accentPurple})`,
        texture: seed.buttonStyle === 'pixel'
            ? `linear-gradient(90deg, ${hsla(hue, 40, dark ? 86 : 20, 0.05)} 1px, transparent 1px), linear-gradient(0deg, ${hsla(hue, 40, dark ? 86 : 20, 0.05)} 1px, transparent 1px)`
            : `radial-gradient(circle at 18% 82%, ${hsla(accent, 82, 64, 0.1)}, transparent 42%), radial-gradient(circle at 82% 18%, ${hsla(secondAccent, 82, 60, 0.09)}, transparent 42%)`,
        glowPink: `0 0 24px ${hsla(accent, 90, 62, 0.42)}`,
        glowBlue: `0 0 24px ${hsla(secondAccent, 88, 58, 0.42)}`,
        backdropBlur: seed.buttonStyle === 'glass' ? 'blur(22px)' : seed.surface === 'light' ? 'blur(12px)' : 'blur(16px)',
    };

    return {
        id: seed.id,
        name: seed.name,
        category: seed.category,
        tags: seed.tags || [],
        colors,
        effects,
        corners: {
            sm: `${Math.max(0, radius - 4)}px`,
            md: `${radius}px`,
            lg: `${radius + 6}px`,
            full: radius < 4 ? '2px' : '999px',
        },
        shadows: {
            sm: `0 2px 10px ${hsla(hue, 30, 4, dark ? 0.3 : 0.12)}`,
            md: `0 10px 28px ${hsla(hue, 36, 4, dark ? 0.36 : 0.16)}`,
            lg: `0 18px 54px ${hsla(hue, 38, 4, dark ? 0.48 : 0.22)}`,
        },
        buttonStyle: seed.buttonStyle,
    };
}

const UI_THEME_SEEDS: UIThemeSeed[] = [
    // Apple/iOS/macOS inspired originals (20)
    { id: 'ios-moderne', name: 'iOS moderne', category: 'Apple/iOS/macOS', hue: 214, accentHue: 332, surface: 'light', buttonStyle: 'soft', radius: 18, intensity: 0.65, tags: ['ios', 'mobile'] },
    { id: 'ios-glass-aero', name: 'iOS 26 Glass Aero', category: 'Apple/iOS/macOS', hue: 205, accentHue: 300, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.82, tags: ['ios', 'glass', 'aero'] },
    { id: 'ios-26-crystal', name: 'iOS 26 Crystal', category: 'Apple/iOS/macOS', hue: 196, accentHue: 286, surface: 'light', buttonStyle: 'glass', radius: 24, intensity: 0.9, tags: ['ios', 'crystal'] },
    { id: 'macos-classique', name: 'macOS classique', category: 'Apple/iOS/macOS', hue: 215, accentHue: 206, surface: 'light', buttonStyle: 'solid', radius: 8, intensity: 0.52, tags: ['macos', 'classic'] },
    { id: 'macos-aqua', name: 'macOS Aqua', category: 'Apple/iOS/macOS', hue: 202, accentHue: 188, surface: 'light', buttonStyle: 'glass', radius: 18, intensity: 0.8, tags: ['macos', 'aqua'] },
    { id: 'macos-big-sur', name: 'macOS Big Sur', category: 'Apple/iOS/macOS', hue: 216, accentHue: 321, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.78, tags: ['macos'] },
    { id: 'macos-sonoma', name: 'macOS Sonoma / Sequoia style', category: 'Apple/iOS/macOS', hue: 249, accentHue: 24, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.9, tags: ['macos', 'sonoma', 'sequoia'] },
    { id: 'sequoia-mist', name: 'Sequoia Mist', category: 'Apple/iOS/macOS', hue: 174, accentHue: 210, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.62, tags: ['macos', 'mist'] },
    { id: 'liquid-mist', name: 'Liquid Mist', category: 'Apple/iOS/macOS', hue: 182, accentHue: 268, surface: 'light', buttonStyle: 'glass', radius: 26, intensity: 0.76, tags: ['glass'] },
    { id: 'graphite-studio', name: 'Graphite Studio', category: 'Apple/iOS/macOS', hue: 222, accentHue: 204, surface: 'dark', buttonStyle: 'soft', radius: 14, intensity: 0.7, tags: ['studio'] },
    { id: 'silver-dock', name: 'Silver Dock', category: 'Apple/iOS/macOS', hue: 212, accentHue: 222, surface: 'light', buttonStyle: 'soft', radius: 16, intensity: 0.48, tags: ['dock'] },
    { id: 'orchard-glass', name: 'Orchard Glass', category: 'Apple/iOS/macOS', hue: 118, accentHue: 336, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.62, tags: ['fresh'] },
    { id: 'cobalt-glass', name: 'Cobalt Glass', category: 'Apple/iOS/macOS', hue: 222, accentHue: 202, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.86, tags: ['blue'] },
    { id: 'candy-control', name: 'Candy Control', category: 'Apple/iOS/macOS', hue: 326, accentHue: 340, surface: 'light', buttonStyle: 'soft', radius: 24, intensity: 0.64, tags: ['pink'] },
    { id: 'pearlescent-ui', name: 'Pearlescent UI', category: 'Apple/iOS/macOS', hue: 278, accentHue: 186, surface: 'light', buttonStyle: 'glass', radius: 24, intensity: 0.58, tags: ['pearl'] },
    { id: 'midnight-finder', name: 'Midnight Finder', category: 'Apple/iOS/macOS', hue: 228, accentHue: 296, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.9, tags: ['night'] },
    { id: 'aurora-desktop', name: 'Aurora Desktop', category: 'Apple/iOS/macOS', hue: 250, accentHue: 151, surface: 'dark', buttonStyle: 'glass', radius: 22, intensity: 1.0, tags: ['aurora'] },
    { id: 'brushed-platinum', name: 'Brushed Platinum', category: 'Apple/iOS/macOS', hue: 218, accentHue: 202, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.44, tags: ['platinum'] },
    { id: 'clear-sky-mobile', name: 'Clear Sky Mobile', category: 'Apple/iOS/macOS', hue: 200, accentHue: 198, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.56, tags: ['mobile'] },
    { id: 'opal-window', name: 'Opal Window', category: 'Apple/iOS/macOS', hue: 168, accentHue: 306, surface: 'light', buttonStyle: 'glass', radius: 24, intensity: 0.66, tags: ['opal'] },

    // Windows inspired originals (18)
    { id: 'windows-95', name: 'Windows 95', category: 'Windows', hue: 186, accentHue: 208, surface: 'light', buttonStyle: 'pixel', radius: 2, intensity: 0.42, tags: ['classic', 'retro'] },
    { id: 'windows-98-cloud', name: 'Windows 98 Cloud', category: 'Windows', hue: 196, accentHue: 206, surface: 'light', buttonStyle: 'pixel', radius: 3, intensity: 0.48, tags: ['retro'] },
    { id: 'windows-xp', name: 'Windows XP', category: 'Windows', hue: 213, accentHue: 113, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.78, tags: ['xp'] },
    { id: 'windows-7-aero', name: 'Windows 7 Aero', category: 'Windows', hue: 204, accentHue: 189, surface: 'dark', buttonStyle: 'glass', radius: 12, intensity: 0.86, tags: ['aero', 'glass'] },
    { id: 'windows-10', name: 'Windows 10', category: 'Windows', hue: 210, accentHue: 204, surface: 'dark', buttonStyle: 'solid', radius: 4, intensity: 0.78, tags: ['flat'] },
    { id: 'windows-11', name: 'Windows 11', category: 'Windows', hue: 214, accentHue: 263, surface: 'light', buttonStyle: 'soft', radius: 12, intensity: 0.64, tags: ['soft'] },
    { id: 'metro-tiles', name: 'Metro Tiles', category: 'Windows', hue: 196, accentHue: 188, surface: 'dark', buttonStyle: 'solid', radius: 2, intensity: 0.82, tags: ['tiles'] },
    { id: 'soft-ribbon', name: 'Soft Ribbon', category: 'Windows', hue: 218, accentHue: 260, surface: 'light', buttonStyle: 'soft', radius: 10, intensity: 0.56, tags: ['ribbon'] },
    { id: 'taskbar-night', name: 'Taskbar Night', category: 'Windows', hue: 225, accentHue: 205, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.84, tags: ['night'] },
    { id: 'classic-start', name: 'Classic Start', category: 'Windows', hue: 190, accentHue: 43, surface: 'light', buttonStyle: 'pixel', radius: 2, intensity: 0.44, tags: ['classic'] },
    { id: 'longhorn-dream', name: 'Longhorn Dream', category: 'Windows', hue: 218, accentHue: 32, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.9, tags: ['glass'] },
    { id: 'glass-start', name: 'Glass Start', category: 'Windows', hue: 202, accentHue: 194, surface: 'light', buttonStyle: 'glass', radius: 16, intensity: 0.72, tags: ['glass'] },
    { id: 'graphite-panels', name: 'Graphite Panels', category: 'Windows', hue: 216, accentHue: 210, surface: 'dark', buttonStyle: 'outline', radius: 6, intensity: 0.7, tags: ['work'] },
    { id: 'teal-workstation', name: 'Teal Workstation', category: 'Windows', hue: 180, accentHue: 188, surface: 'dark', buttonStyle: 'solid', radius: 6, intensity: 0.74, tags: ['teal'] },
    { id: 'ribbon-workbench', name: 'Ribbon Workbench', category: 'Windows', hue: 221, accentHue: 30, surface: 'light', buttonStyle: 'solid', radius: 8, intensity: 0.58, tags: ['office'] },
    { id: 'flat-modern', name: 'Flat Modern', category: 'Windows', hue: 208, accentHue: 198, surface: 'light', buttonStyle: 'solid', radius: 4, intensity: 0.52, tags: ['flat'] },
    { id: 'slate-desktop', name: 'Slate Desktop', category: 'Windows', hue: 222, accentHue: 215, surface: 'dark', buttonStyle: 'soft', radius: 10, intensity: 0.7, tags: ['slate'] },
    { id: 'aurora-taskbar', name: 'Aurora Taskbar', category: 'Windows', hue: 236, accentHue: 156, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.96, tags: ['aurora'] },

    // Android inspired originals (20)
    { id: 'android-material', name: 'Android Material', category: 'Android', hue: 152, accentHue: 198, surface: 'light', buttonStyle: 'soft', radius: 16, intensity: 0.6, tags: ['material'] },
    { id: 'material-you', name: 'Material You', category: 'Android', hue: 284, accentHue: 322, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.62, tags: ['material'] },
    { id: 'miui-inspired', name: 'MIUI inspire', category: 'Android', hue: 26, accentHue: 346, surface: 'light', buttonStyle: 'soft', radius: 18, intensity: 0.7, tags: ['miui'] },
    { id: 'hyperos-inspired', name: 'HyperOS inspire', category: 'Android', hue: 207, accentHue: 271, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.74, tags: ['hyperos'] },
    { id: 'one-ui-inspired', name: 'One UI inspire', category: 'Android', hue: 218, accentHue: 202, surface: 'light', buttonStyle: 'soft', radius: 24, intensity: 0.58, tags: ['one ui'] },
    { id: 'coloros-inspired', name: 'ColorOS inspire', category: 'Android', hue: 164, accentHue: 304, surface: 'light', buttonStyle: 'glass', radius: 22, intensity: 0.7, tags: ['coloros'] },
    { id: 'oxygenos-inspired', name: 'OxygenOS inspire', category: 'Android', hue: 228, accentHue: 356, surface: 'dark', buttonStyle: 'solid', radius: 12, intensity: 0.82, tags: ['oxygenos'] },
    { id: 'holo-blue', name: 'Holo Blue', category: 'Android', hue: 202, accentHue: 191, surface: 'dark', buttonStyle: 'outline', radius: 6, intensity: 0.82, tags: ['holo'] },
    { id: 'pixel-soft', name: 'Pixel Soft', category: 'Android', hue: 182, accentHue: 34, surface: 'light', buttonStyle: 'soft', radius: 20, intensity: 0.54, tags: ['pixel'] },
    { id: 'emerald-droid', name: 'Emerald Droid', category: 'Android', hue: 144, accentHue: 156, surface: 'dark', buttonStyle: 'soft', radius: 16, intensity: 0.78, tags: ['green'] },
    { id: 'clay-mobile', name: 'Clay Mobile', category: 'Android', hue: 22, accentHue: 312, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.52, tags: ['clay'] },
    { id: 'graphite-phone', name: 'Graphite Phone', category: 'Android', hue: 220, accentHue: 212, surface: 'dark', buttonStyle: 'solid', radius: 18, intensity: 0.66, tags: ['amoled'] },
    { id: 'sunrise-widget', name: 'Sunrise Widget', category: 'Android', hue: 31, accentHue: 340, surface: 'light', buttonStyle: 'soft', radius: 24, intensity: 0.72, tags: ['widget'] },
    { id: 'neon-widget', name: 'Neon Widget', category: 'Android', hue: 268, accentHue: 178, surface: 'dark', buttonStyle: 'neon', radius: 18, intensity: 0.98, tags: ['neon'] },
    { id: 'round-shell', name: 'Round Shell', category: 'Android', hue: 190, accentHue: 136, surface: 'light', buttonStyle: 'soft', radius: 28, intensity: 0.5, tags: ['round'] },
    { id: 'amoled-black', name: 'AMOLED Black', category: 'Android', hue: 240, accentHue: 198, surface: 'dark', buttonStyle: 'outline', radius: 14, intensity: 1.0, tags: ['amoled'] },
    { id: 'chroma-card', name: 'Chroma Card', category: 'Android', hue: 126, accentHue: 278, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.88, tags: ['chroma'] },
    { id: 'cloud-device', name: 'Cloud Device', category: 'Android', hue: 204, accentHue: 218, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.5, tags: ['cloud'] },
    { id: 'lunar-mobile', name: 'Lunar Mobile', category: 'Android', hue: 242, accentHue: 294, surface: 'dark', buttonStyle: 'soft', radius: 18, intensity: 0.8, tags: ['moon'] },
    { id: 'mint-android', name: 'Mint Android', category: 'Android', hue: 154, accentHue: 176, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.58, tags: ['mint'] },

    // Linux inspired originals (14)
    { id: 'ubuntu-inspired', name: 'Ubuntu inspire', category: 'Linux', hue: 20, accentHue: 281, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.84, tags: ['ubuntu'] },
    { id: 'kde-plasma-inspired', name: 'KDE Plasma inspire', category: 'Linux', hue: 205, accentHue: 180, surface: 'dark', buttonStyle: 'glass', radius: 12, intensity: 0.82, tags: ['kde'] },
    { id: 'gnome-inspired', name: 'GNOME inspire', category: 'Linux', hue: 224, accentHue: 205, surface: 'light', buttonStyle: 'soft', radius: 12, intensity: 0.5, tags: ['gnome'] },
    { id: 'mint-cinnamon', name: 'Mint Cinnamon', category: 'Linux', hue: 144, accentHue: 118, surface: 'light', buttonStyle: 'soft', radius: 10, intensity: 0.54, tags: ['mint'] },
    { id: 'fedora-blue', name: 'Fedora Blue', category: 'Linux', hue: 218, accentHue: 205, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.72, tags: ['blue'] },
    { id: 'open-desktop', name: 'Open Desktop', category: 'Linux', hue: 184, accentHue: 106, surface: 'light', buttonStyle: 'outline', radius: 8, intensity: 0.48, tags: ['desktop'] },
    { id: 'terminal-tiling', name: 'Terminal Tiling', category: 'Linux', hue: 154, accentHue: 120, surface: 'dark', buttonStyle: 'outline', radius: 4, intensity: 0.88, tags: ['terminal'] },
    { id: 'solarized-desktop', name: 'Solarized Desktop', category: 'Linux', hue: 192, accentHue: 43, surface: 'light', buttonStyle: 'soft', radius: 8, intensity: 0.45, tags: ['solarized'] },
    { id: 'purple-shell', name: 'Purple Shell', category: 'Linux', hue: 270, accentHue: 320, surface: 'dark', buttonStyle: 'solid', radius: 12, intensity: 0.78, tags: ['shell'] },
    { id: 'amber-terminal', name: 'Amber Terminal', category: 'Linux', hue: 36, accentHue: 41, surface: 'dark', buttonStyle: 'outline', radius: 5, intensity: 0.86, tags: ['terminal'] },
    { id: 'alpine-minimal', name: 'Alpine Minimal', category: 'Linux', hue: 196, accentHue: 180, surface: 'light', buttonStyle: 'outline', radius: 6, intensity: 0.38, tags: ['minimal'] },
    { id: 'cosmic-shell', name: 'Cosmic Shell', category: 'Linux', hue: 232, accentHue: 26, surface: 'dark', buttonStyle: 'glass', radius: 14, intensity: 0.94, tags: ['cosmic'] },
    { id: 'nord-workspace', name: 'Nord Workspace', category: 'Linux', hue: 220, accentHue: 194, surface: 'dark', buttonStyle: 'soft', radius: 10, intensity: 0.62, tags: ['nord'] },
    { id: 'paper-window', name: 'Paper Window', category: 'Linux', hue: 210, accentHue: 150, surface: 'light', buttonStyle: 'soft', radius: 8, intensity: 0.42, tags: ['paper'] },

    // Gaming originals (18)
    { id: 'nintendo-style', name: 'Nintendo style', category: 'Gaming', hue: 355, accentHue: 198, surface: 'light', buttonStyle: 'solid', radius: 18, intensity: 0.78, tags: ['console'] },
    { id: 'gamer-rgb', name: 'Gamer RGB', category: 'Gaming', hue: 258, accentHue: 176, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 1.06, tags: ['rgb', 'neon'] },
    { id: 'cyberpunk', name: 'Cyberpunk', category: 'Gaming', hue: 246, accentHue: 57, surface: 'dark', buttonStyle: 'neon', radius: 6, intensity: 1.08, tags: ['cyberpunk'] },
    { id: 'neon', name: 'Neon', category: 'Gaming', hue: 284, accentHue: 177, surface: 'dark', buttonStyle: 'neon', radius: 14, intensity: 1.04, tags: ['neon'] },
    { id: 'arcade-storm', name: 'Arcade Storm', category: 'Gaming', hue: 244, accentHue: 344, surface: 'dark', buttonStyle: 'neon', radius: 8, intensity: 0.96, tags: ['arcade'] },
    { id: 'esports-night', name: 'Esports Night', category: 'Gaming', hue: 230, accentHue: 198, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.9, tags: ['esports'] },
    { id: 'laser-grid', name: 'Laser Grid', category: 'Gaming', hue: 268, accentHue: 188, surface: 'dark', buttonStyle: 'neon', radius: 4, intensity: 1.08, tags: ['grid'] },
    { id: 'synthwave-drive', name: 'Synthwave Drive', category: 'Gaming', hue: 280, accentHue: 330, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 1.02, tags: ['synthwave'] },
    { id: 'plasma-arena', name: 'Plasma Arena', category: 'Gaming', hue: 252, accentHue: 15, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.98, tags: ['plasma'] },
    { id: 'console-pop', name: 'Console Pop', category: 'Gaming', hue: 201, accentHue: 342, surface: 'light', buttonStyle: 'solid', radius: 18, intensity: 0.72, tags: ['console'] },
    { id: 'speedrun-mint', name: 'Speedrun Mint', category: 'Gaming', hue: 154, accentHue: 194, surface: 'dark', buttonStyle: 'neon', radius: 10, intensity: 0.9, tags: ['speedrun'] },
    { id: 'boss-battle', name: 'Boss Battle', category: 'Gaming', hue: 6, accentHue: 42, surface: 'dark', buttonStyle: 'solid', radius: 8, intensity: 0.98, tags: ['battle'] },
    { id: 'rgb-carbon', name: 'RGB Carbon', category: 'Gaming', hue: 236, accentHue: 300, surface: 'dark', buttonStyle: 'neon', radius: 10, intensity: 1.02, tags: ['rgb'] },
    { id: 'holo-hud', name: 'Holo HUD', category: 'Gaming', hue: 204, accentHue: 176, surface: 'dark', buttonStyle: 'outline', radius: 8, intensity: 0.9, tags: ['hud'] },
    { id: 'toxic-green', name: 'Toxic Green', category: 'Gaming', hue: 110, accentHue: 92, surface: 'dark', buttonStyle: 'neon', radius: 8, intensity: 1.02, tags: ['green'] },
    { id: 'mech-lab', name: 'Mech Lab', category: 'Gaming', hue: 216, accentHue: 28, surface: 'dark', buttonStyle: 'solid', radius: 6, intensity: 0.82, tags: ['mech'] },
    { id: 'neon-racer', name: 'Neon Racer', category: 'Gaming', hue: 248, accentHue: 0, surface: 'dark', buttonStyle: 'neon', radius: 12, intensity: 1.06, tags: ['racer'] },
    { id: 'pixel-fight', name: 'Pixel Fight', category: 'Gaming', hue: 218, accentHue: 18, surface: 'dark', buttonStyle: 'pixel', radius: 2, intensity: 0.9, tags: ['pixel'] },

    // Retro originals (16)
    { id: 'retro-pixel', name: 'Retro Pixel', category: 'Retro', hue: 222, accentHue: 332, surface: 'dark', buttonStyle: 'pixel', radius: 2, intensity: 0.84, tags: ['pixel'] },
    { id: 'terminal-hacker', name: 'Terminal Hacker', category: 'Retro', hue: 135, accentHue: 122, surface: 'dark', buttonStyle: 'outline', radius: 4, intensity: 0.9, tags: ['terminal'] },
    { id: 'crt-green', name: 'CRT Green', category: 'Retro', hue: 128, accentHue: 120, surface: 'dark', buttonStyle: 'pixel', radius: 3, intensity: 0.86, tags: ['crt'] },
    { id: 'retro-workbench', name: 'Retro Workbench', category: 'Retro', hue: 210, accentHue: 31, surface: 'light', buttonStyle: 'pixel', radius: 3, intensity: 0.44, tags: ['classic'] },
    { id: 'vaporwave', name: 'Vaporwave', category: 'Retro', hue: 288, accentHue: 326, surface: 'dark', buttonStyle: 'neon', radius: 8, intensity: 0.98, tags: ['vaporwave'] },
    { id: 'cassette-pop', name: 'Cassette Pop', category: 'Retro', hue: 32, accentHue: 326, surface: 'light', buttonStyle: 'solid', radius: 8, intensity: 0.64, tags: ['cassette'] },
    { id: 'eight-bit-love', name: '8-bit Love', category: 'Retro', hue: 322, accentHue: 340, surface: 'dark', buttonStyle: 'pixel', radius: 2, intensity: 0.9, tags: ['8-bit'] },
    { id: 'dot-matrix', name: 'Dot Matrix', category: 'Retro', hue: 198, accentHue: 178, surface: 'light', buttonStyle: 'pixel', radius: 2, intensity: 0.4, tags: ['print'] },
    { id: 'arcade-cabinet', name: 'Arcade Cabinet', category: 'Retro', hue: 248, accentHue: 352, surface: 'dark', buttonStyle: 'pixel', radius: 4, intensity: 0.94, tags: ['arcade'] },
    { id: 'sepia-terminal', name: 'Sepia Terminal', category: 'Retro', hue: 36, accentHue: 32, surface: 'dark', buttonStyle: 'outline', radius: 4, intensity: 0.72, tags: ['sepia'] },
    { id: 'memphis-ui', name: 'Memphis UI', category: 'Retro', hue: 188, accentHue: 330, surface: 'light', buttonStyle: 'solid', radius: 10, intensity: 0.76, tags: ['memphis'] },
    { id: 'vintage-web', name: 'Vintage Web', category: 'Retro', hue: 204, accentHue: 28, surface: 'light', buttonStyle: 'pixel', radius: 2, intensity: 0.46, tags: ['web'] },
    { id: 'floppy-blue', name: 'Floppy Blue', category: 'Retro', hue: 220, accentHue: 202, surface: 'light', buttonStyle: 'pixel', radius: 3, intensity: 0.5, tags: ['floppy'] },
    { id: 'monochrome-classic', name: 'Monochrome Classic', category: 'Retro', hue: 218, accentHue: 218, surface: 'light', buttonStyle: 'outline', radius: 2, intensity: 0.36, tags: ['mono'] },
    { id: 'amber-crt', name: 'Amber CRT', category: 'Retro', hue: 34, accentHue: 36, surface: 'dark', buttonStyle: 'pixel', radius: 3, intensity: 0.84, tags: ['crt'] },
    { id: 'chunky-aqua', name: 'Chunky Aqua', category: 'Retro', hue: 190, accentHue: 202, surface: 'light', buttonStyle: 'pixel', radius: 8, intensity: 0.72, tags: ['aqua'] },

    // Premium originals (18)
    { id: 'dark-premium', name: 'Dark Premium', category: 'Premium', hue: 236, accentHue: 330, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.9, tags: ['default'] },
    { id: 'blue-night', name: 'Blue Night', category: 'Premium', hue: 225, accentHue: 204, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.82, tags: ['blue'] },
    { id: 'pink-love', name: 'Pink Love', category: 'Premium', hue: 326, accentHue: 340, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.94, tags: ['love'] },
    { id: 'algeria-green', name: 'Algeria Green', category: 'Premium', hue: 142, accentHue: 154, surface: 'dark', buttonStyle: 'solid', radius: 14, intensity: 0.82, tags: ['green'] },
    { id: 'gold-vip', name: 'Gold VIP', category: 'Premium', hue: 38, accentHue: 42, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.9, tags: ['vip', 'gold'] },
    { id: 'glassmorphism', name: 'Glassmorphism', category: 'Premium', hue: 214, accentHue: 286, surface: 'dark', buttonStyle: 'glass', radius: 22, intensity: 0.92, tags: ['glass'] },
    { id: 'frutiger-aero', name: 'Frutiger Aero', category: 'Premium', hue: 186, accentHue: 122, surface: 'light', buttonStyle: 'glass', radius: 18, intensity: 0.82, tags: ['aero'] },
    { id: 'minimal-white', name: 'Minimal White', category: 'Premium', hue: 210, accentHue: 202, surface: 'light', buttonStyle: 'outline', radius: 10, intensity: 0.35, tags: ['minimal'] },
    { id: 'purple-dream', name: 'Purple Dream', category: 'Premium', hue: 270, accentHue: 310, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.92, tags: ['purple'] },
    { id: 'black-gold', name: 'Black Gold', category: 'Premium', hue: 236, accentHue: 42, surface: 'dark', buttonStyle: 'solid', radius: 12, intensity: 0.86, tags: ['gold'] },
    { id: 'red-passion', name: 'Red Passion', category: 'Premium', hue: 352, accentHue: 4, surface: 'dark', buttonStyle: 'solid', radius: 14, intensity: 0.92, tags: ['red'] },
    { id: 'velvet-royal', name: 'Velvet Royal', category: 'Premium', hue: 282, accentHue: 316, surface: 'dark', buttonStyle: 'soft', radius: 18, intensity: 0.84, tags: ['royal'] },
    { id: 'diamond-frost', name: 'Diamond Frost', category: 'Premium', hue: 196, accentHue: 210, surface: 'light', buttonStyle: 'glass', radius: 20, intensity: 0.58, tags: ['frost'] },
    { id: 'champagne-ui', name: 'Champagne UI', category: 'Premium', hue: 38, accentHue: 348, surface: 'light', buttonStyle: 'soft', radius: 16, intensity: 0.5, tags: ['champagne'] },
    { id: 'emerald-vip', name: 'Emerald VIP', category: 'Premium', hue: 150, accentHue: 158, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.86, tags: ['emerald'] },
    { id: 'sapphire-luxe', name: 'Sapphire Luxe', category: 'Premium', hue: 220, accentHue: 202, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.84, tags: ['sapphire'] },
    { id: 'ruby-night', name: 'Ruby Night', category: 'Premium', hue: 348, accentHue: 330, surface: 'dark', buttonStyle: 'glass', radius: 16, intensity: 0.88, tags: ['ruby'] },
    { id: 'platinum-card', name: 'Platinum Card', category: 'Premium', hue: 216, accentHue: 208, surface: 'light', buttonStyle: 'soft', radius: 14, intensity: 0.42, tags: ['platinum'] },

    // Nature originals (16)
    { id: 'space-galaxy', name: 'Space Galaxy', category: 'Nature', hue: 248, accentHue: 292, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 1.02, tags: ['space'] },
    { id: 'ocean', name: 'Ocean', category: 'Nature', hue: 196, accentHue: 184, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.84, tags: ['water'] },
    { id: 'sakura', name: 'Sakura', category: 'Nature', hue: 328, accentHue: 342, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.58, tags: ['flower'] },
    { id: 'desert', name: 'Desert', category: 'Nature', hue: 34, accentHue: 24, surface: 'light', buttonStyle: 'solid', radius: 12, intensity: 0.62, tags: ['sand'] },
    { id: 'ice', name: 'Ice', category: 'Nature', hue: 196, accentHue: 206, surface: 'light', buttonStyle: 'glass', radius: 18, intensity: 0.5, tags: ['frost'] },
    { id: 'fire', name: 'Fire', category: 'Nature', hue: 12, accentHue: 36, surface: 'dark', buttonStyle: 'solid', radius: 14, intensity: 0.96, tags: ['fire'] },
    { id: 'forest', name: 'Forest', category: 'Nature', hue: 136, accentHue: 104, surface: 'dark', buttonStyle: 'soft', radius: 16, intensity: 0.74, tags: ['forest'] },
    { id: 'rain', name: 'Rain', category: 'Nature', hue: 207, accentHue: 190, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.7, tags: ['rain'] },
    { id: 'aurora', name: 'Aurora', category: 'Nature', hue: 238, accentHue: 150, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.98, tags: ['aurora'] },
    { id: 'sunset', name: 'Sunset', category: 'Nature', hue: 18, accentHue: 330, surface: 'dark', buttonStyle: 'glass', radius: 18, intensity: 0.92, tags: ['sunset'] },
    { id: 'coral-reef', name: 'Coral Reef', category: 'Nature', hue: 178, accentHue: 12, surface: 'light', buttonStyle: 'soft', radius: 20, intensity: 0.66, tags: ['coral'] },
    { id: 'mountain-mist', name: 'Mountain Mist', category: 'Nature', hue: 204, accentHue: 148, surface: 'light', buttonStyle: 'glass', radius: 18, intensity: 0.48, tags: ['mountain'] },
    { id: 'lavender-field', name: 'Lavender Field', category: 'Nature', hue: 268, accentHue: 300, surface: 'light', buttonStyle: 'soft', radius: 20, intensity: 0.56, tags: ['lavender'] },
    { id: 'bamboo', name: 'Bamboo', category: 'Nature', hue: 112, accentHue: 134, surface: 'light', buttonStyle: 'soft', radius: 16, intensity: 0.52, tags: ['green'] },
    { id: 'storm-cloud', name: 'Storm Cloud', category: 'Nature', hue: 220, accentHue: 210, surface: 'dark', buttonStyle: 'outline', radius: 12, intensity: 0.76, tags: ['storm'] },
    { id: 'honey-sand', name: 'Honey Sand', category: 'Nature', hue: 42, accentHue: 30, surface: 'light', buttonStyle: 'soft', radius: 16, intensity: 0.5, tags: ['honey'] },

    // Anime originals (10)
    { id: 'anime', name: 'Anime', category: 'Anime', hue: 316, accentHue: 342, surface: 'light', buttonStyle: 'soft', radius: 24, intensity: 0.68, tags: ['anime'] },
    { id: 'magical-pastel', name: 'Magical Pastel', category: 'Anime', hue: 290, accentHue: 332, surface: 'light', buttonStyle: 'soft', radius: 26, intensity: 0.6, tags: ['pastel'] },
    { id: 'mecha-blue', name: 'Mecha Blue', category: 'Anime', hue: 216, accentHue: 190, surface: 'dark', buttonStyle: 'solid', radius: 10, intensity: 0.86, tags: ['mecha'] },
    { id: 'kawaii-night', name: 'Kawaii Night', category: 'Anime', hue: 300, accentHue: 340, surface: 'dark', buttonStyle: 'glass', radius: 22, intensity: 0.92, tags: ['kawaii'] },
    { id: 'manga-ink', name: 'Manga Ink', category: 'Anime', hue: 218, accentHue: 8, surface: 'light', buttonStyle: 'outline', radius: 8, intensity: 0.4, tags: ['manga'] },
    { id: 'sakura-school', name: 'Sakura School', category: 'Anime', hue: 336, accentHue: 352, surface: 'light', buttonStyle: 'soft', radius: 22, intensity: 0.58, tags: ['sakura'] },
    { id: 'neon-shojo', name: 'Neon Shojo', category: 'Anime', hue: 296, accentHue: 188, surface: 'dark', buttonStyle: 'neon', radius: 18, intensity: 0.98, tags: ['neon'] },
    { id: 'hero-energy', name: 'Hero Energy', category: 'Anime', hue: 24, accentHue: 206, surface: 'dark', buttonStyle: 'solid', radius: 14, intensity: 0.9, tags: ['hero'] },
    { id: 'pastel-dream', name: 'Pastel Dream', category: 'Anime', hue: 270, accentHue: 170, surface: 'light', buttonStyle: 'glass', radius: 24, intensity: 0.52, tags: ['dream'] },
    { id: 'moonlight-idol', name: 'Moonlight Idol', category: 'Anime', hue: 248, accentHue: 320, surface: 'dark', buttonStyle: 'glass', radius: 20, intensity: 0.88, tags: ['idol'] },
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
    setThemeVariable(style, '--shadow-glow-pink', theme.effects.glowPink);
    setThemeVariable(style, '--shadow-glow-blue', theme.effects.glowBlue);
    setThemeVariable(style, '--ui-theme-background', theme.effects.background);
    setThemeVariable(style, '--ui-theme-panel', theme.effects.panel);
    setThemeVariable(style, '--ui-theme-button', theme.effects.button);
    setThemeVariable(style, '--ui-theme-texture', theme.effects.texture);
    setThemeVariable(style, '--ui-theme-backdrop-blur', theme.effects.backdropBlur);

    return theme;
}
