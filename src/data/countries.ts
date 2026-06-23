/**
 * World of Love — Card Game
 * Base de données des 196 pays
 * 
 * Chaque pays a :
 * - code : code ISO 2 lettres
 * - nameFR : nom français
 * - continent : continent
 * - rarityBase : rareté de base (affecte probabilité d'obtention)
 */

// Types de continents
type Continent = 'Europe' | 'Afrique' | 'Asie' | 'Amérique' | 'Océanie';

// Types de raretés
type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

// Interface d'un pays
interface Country {
    code: string;
    nameFR: string;
    continent: Continent;
    rarityBase: Rarity;
    flag: string; // Emoji drapeau
}

// Liste complète des 196 pays
const COUNTRIES: Country[] = [
    // ═══════════════════════════════════════════════════════════════════
    // EUROPE (44 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'FR', nameFR: 'France', continent: 'Europe', rarityBase: 'Rare', flag: '🇫🇷' },
    { code: 'DE', nameFR: 'Allemagne', continent: 'Europe', rarityBase: 'Rare', flag: '🇩🇪' },
    { code: 'IT', nameFR: 'Italie', continent: 'Europe', rarityBase: 'Rare', flag: '🇮🇹' },
    { code: 'ES', nameFR: 'Espagne', continent: 'Europe', rarityBase: 'Rare', flag: '🇪🇸' },
    { code: 'GB', nameFR: 'Royaume-Uni', continent: 'Europe', rarityBase: 'Rare', flag: '🇬🇧' },
    { code: 'PT', nameFR: 'Portugal', continent: 'Europe', rarityBase: 'Common', flag: '🇵🇹' },
    { code: 'NL', nameFR: 'Pays-Bas', continent: 'Europe', rarityBase: 'Common', flag: '🇳🇱' },
    { code: 'BE', nameFR: 'Belgique', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇪' },
    { code: 'CH', nameFR: 'Suisse', continent: 'Europe', rarityBase: 'Epic', flag: '🇨🇭' },
    { code: 'AT', nameFR: 'Autriche', continent: 'Europe', rarityBase: 'Common', flag: '🇦🇹' },
    { code: 'PL', nameFR: 'Pologne', continent: 'Europe', rarityBase: 'Common', flag: '🇵🇱' },
    { code: 'CZ', nameFR: 'République Tchèque', continent: 'Europe', rarityBase: 'Common', flag: '🇨🇿' },
    { code: 'SK', nameFR: 'Slovaquie', continent: 'Europe', rarityBase: 'Common', flag: '🇸🇰' },
    { code: 'HU', nameFR: 'Hongrie', continent: 'Europe', rarityBase: 'Common', flag: '🇭🇺' },
    { code: 'RO', nameFR: 'Roumanie', continent: 'Europe', rarityBase: 'Common', flag: '🇷🇴' },
    { code: 'BG', nameFR: 'Bulgarie', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇬' },
    { code: 'GR', nameFR: 'Grèce', continent: 'Europe', rarityBase: 'Rare', flag: '🇬🇷' },
    { code: 'HR', nameFR: 'Croatie', continent: 'Europe', rarityBase: 'Common', flag: '🇭🇷' },
    { code: 'SI', nameFR: 'Slovénie', continent: 'Europe', rarityBase: 'Common', flag: '🇸🇮' },
    { code: 'RS', nameFR: 'Serbie', continent: 'Europe', rarityBase: 'Common', flag: '🇷🇸' },
    { code: 'BA', nameFR: 'Bosnie-Herzégovine', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇦' },
    { code: 'ME', nameFR: 'Monténégro', continent: 'Europe', rarityBase: 'Epic', flag: '🇲🇪' },
    { code: 'MK', nameFR: 'Macédoine du Nord', continent: 'Europe', rarityBase: 'Common', flag: '🇲🇰' },
    { code: 'AL', nameFR: 'Albanie', continent: 'Europe', rarityBase: 'Common', flag: '🇦🇱' },
    { code: 'XK', nameFR: 'Kosovo', continent: 'Europe', rarityBase: 'Epic', flag: '🇽🇰' },
    { code: 'UA', nameFR: 'Ukraine', continent: 'Europe', rarityBase: 'Rare', flag: '🇺🇦' },
    { code: 'BY', nameFR: 'Biélorussie', continent: 'Europe', rarityBase: 'Common', flag: '🇧🇾' },
    { code: 'MD', nameFR: 'Moldavie', continent: 'Europe', rarityBase: 'Common', flag: '🇲🇩' },
    { code: 'RU', nameFR: 'Russie', continent: 'Europe', rarityBase: 'Rare', flag: '🇷🇺' },
    { code: 'SE', nameFR: 'Suède', continent: 'Europe', rarityBase: 'Rare', flag: '🇸🇪' },
    { code: 'NO', nameFR: 'Norvège', continent: 'Europe', rarityBase: 'Epic', flag: '🇳🇴' },
    { code: 'FI', nameFR: 'Finlande', continent: 'Europe', rarityBase: 'Common', flag: '🇫🇮' },
    { code: 'DK', nameFR: 'Danemark', continent: 'Europe', rarityBase: 'Common', flag: '🇩🇰' },
    { code: 'IS', nameFR: 'Islande', continent: 'Europe', rarityBase: 'Epic', flag: '🇮🇸' },
    { code: 'IE', nameFR: 'Irlande', continent: 'Europe', rarityBase: 'Common', flag: '🇮🇪' },
    { code: 'EE', nameFR: 'Estonie', continent: 'Europe', rarityBase: 'Common', flag: '🇪🇪' },
    { code: 'LV', nameFR: 'Lettonie', continent: 'Europe', rarityBase: 'Common', flag: '🇱🇻' },
    { code: 'LT', nameFR: 'Lituanie', continent: 'Europe', rarityBase: 'Common', flag: '🇱🇹' },
    { code: 'LU', nameFR: 'Luxembourg', continent: 'Europe', rarityBase: 'Epic', flag: '🇱🇺' },
    { code: 'MT', nameFR: 'Malte', continent: 'Europe', rarityBase: 'Epic', flag: '🇲🇹' },
    { code: 'CY', nameFR: 'Chypre', continent: 'Europe', rarityBase: 'Common', flag: '🇨🇾' },
    { code: 'MC', nameFR: 'Monaco', continent: 'Europe', rarityBase: 'Legendary', flag: '🇲🇨' },
    { code: 'SM', nameFR: 'Saint-Marin', continent: 'Europe', rarityBase: 'Legendary', flag: '🇸🇲' },
    { code: 'VA', nameFR: 'Vatican', continent: 'Europe', rarityBase: 'Legendary', flag: '🇻🇦' },

    // ═══════════════════════════════════════════════════════════════════
    // AFRIQUE (54 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'MA', nameFR: 'Maroc', continent: 'Afrique', rarityBase: 'Rare', flag: '🇲🇦' },
    { code: 'DZ', nameFR: 'Algérie', continent: 'Afrique', rarityBase: 'Common', flag: '🇩🇿' },
    { code: 'TN', nameFR: 'Tunisie', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇳' },
    { code: 'LY', nameFR: 'Libye', continent: 'Afrique', rarityBase: 'Common', flag: '🇱🇾' },
    { code: 'EG', nameFR: 'Égypte', continent: 'Afrique', rarityBase: 'Rare', flag: '🇪🇬' },
    { code: 'SD', nameFR: 'Soudan', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇩' },
    { code: 'SS', nameFR: 'Soudan du Sud', continent: 'Afrique', rarityBase: 'Epic', flag: '🇸🇸' },
    { code: 'ET', nameFR: 'Éthiopie', continent: 'Afrique', rarityBase: 'Common', flag: '🇪🇹' },
    { code: 'ER', nameFR: 'Érythrée', continent: 'Afrique', rarityBase: 'Epic', flag: '🇪🇷' },
    { code: 'DJ', nameFR: 'Djibouti', continent: 'Afrique', rarityBase: 'Epic', flag: '🇩🇯' },
    { code: 'SO', nameFR: 'Somalie', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇴' },
    { code: 'KE', nameFR: 'Kenya', continent: 'Afrique', rarityBase: 'Common', flag: '🇰🇪' },
    { code: 'UG', nameFR: 'Ouganda', continent: 'Afrique', rarityBase: 'Common', flag: '🇺🇬' },
    { code: 'TZ', nameFR: 'Tanzanie', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇿' },
    { code: 'RW', nameFR: 'Rwanda', continent: 'Afrique', rarityBase: 'Common', flag: '🇷🇼' },
    { code: 'BI', nameFR: 'Burundi', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇮' },
    { code: 'CD', nameFR: 'RD Congo', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇩' },
    { code: 'CG', nameFR: 'Congo', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇬' },
    { code: 'GA', nameFR: 'Gabon', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇦' },
    { code: 'GQ', nameFR: 'Guinée Équatoriale', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇶' },
    { code: 'CM', nameFR: 'Cameroun', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇲' },
    { code: 'CF', nameFR: 'Centrafrique', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇫' },
    { code: 'TD', nameFR: 'Tchad', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇩' },
    { code: 'NE', nameFR: 'Niger', continent: 'Afrique', rarityBase: 'Common', flag: '🇳🇪' },
    { code: 'NG', nameFR: 'Nigéria', continent: 'Afrique', rarityBase: 'Rare', flag: '🇳🇬' },
    { code: 'BJ', nameFR: 'Bénin', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇯' },
    { code: 'TG', nameFR: 'Togo', continent: 'Afrique', rarityBase: 'Common', flag: '🇹🇬' },
    { code: 'GH', nameFR: 'Ghana', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇭' },
    { code: 'CI', nameFR: 'Côte d\'Ivoire', continent: 'Afrique', rarityBase: 'Common', flag: '🇨🇮' },
    { code: 'BF', nameFR: 'Burkina Faso', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇫' },
    { code: 'ML', nameFR: 'Mali', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇱' },
    { code: 'SN', nameFR: 'Sénégal', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇳' },
    { code: 'GM', nameFR: 'Gambie', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇲' },
    { code: 'GW', nameFR: 'Guinée-Bissau', continent: 'Afrique', rarityBase: 'Epic', flag: '🇬🇼' },
    { code: 'GN', nameFR: 'Guinée', continent: 'Afrique', rarityBase: 'Common', flag: '🇬🇳' },
    { code: 'SL', nameFR: 'Sierra Leone', continent: 'Afrique', rarityBase: 'Common', flag: '🇸🇱' },
    { code: 'LR', nameFR: 'Libéria', continent: 'Afrique', rarityBase: 'Common', flag: '🇱🇷' },
    { code: 'MR', nameFR: 'Mauritanie', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇷' },
    { code: 'CV', nameFR: 'Cap-Vert', continent: 'Afrique', rarityBase: 'Epic', flag: '🇨🇻' },
    { code: 'ST', nameFR: 'Sao Tomé-et-Príncipe', continent: 'Afrique', rarityBase: 'Legendary', flag: '🇸🇹' },
    { code: 'AO', nameFR: 'Angola', continent: 'Afrique', rarityBase: 'Common', flag: '🇦🇴' },
    { code: 'ZM', nameFR: 'Zambie', continent: 'Afrique', rarityBase: 'Common', flag: '🇿🇲' },
    { code: 'ZW', nameFR: 'Zimbabwe', continent: 'Afrique', rarityBase: 'Common', flag: '🇿🇼' },
    { code: 'MW', nameFR: 'Malawi', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇼' },
    { code: 'MZ', nameFR: 'Mozambique', continent: 'Afrique', rarityBase: 'Common', flag: '🇲🇿' },
    { code: 'MG', nameFR: 'Madagascar', continent: 'Afrique', rarityBase: 'Rare', flag: '🇲🇬' },
    { code: 'MU', nameFR: 'Maurice', continent: 'Afrique', rarityBase: 'Epic', flag: '🇲🇺' },
    { code: 'SC', nameFR: 'Seychelles', continent: 'Afrique', rarityBase: 'Legendary', flag: '🇸🇨' },
    { code: 'KM', nameFR: 'Comores', continent: 'Afrique', rarityBase: 'Epic', flag: '🇰🇲' },
    { code: 'ZA', nameFR: 'Afrique du Sud', continent: 'Afrique', rarityBase: 'Rare', flag: '🇿🇦' },
    { code: 'NA', nameFR: 'Namibie', continent: 'Afrique', rarityBase: 'Common', flag: '🇳🇦' },
    { code: 'BW', nameFR: 'Botswana', continent: 'Afrique', rarityBase: 'Common', flag: '🇧🇼' },
    { code: 'SZ', nameFR: 'Eswatini', continent: 'Afrique', rarityBase: 'Epic', flag: '🇸🇿' },
    { code: 'LS', nameFR: 'Lesotho', continent: 'Afrique', rarityBase: 'Epic', flag: '🇱🇸' },

    // ═══════════════════════════════════════════════════════════════════
    // ASIE (48 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'CN', nameFR: 'Chine', continent: 'Asie', rarityBase: 'Rare', flag: '🇨🇳' },
    { code: 'JP', nameFR: 'Japon', continent: 'Asie', rarityBase: 'Epic', flag: '🇯🇵' },
    { code: 'KR', nameFR: 'Corée du Sud', continent: 'Asie', rarityBase: 'Rare', flag: '🇰🇷' },
    { code: 'KP', nameFR: 'Corée du Nord', continent: 'Asie', rarityBase: 'Epic', flag: '🇰🇵' },
    { code: 'MN', nameFR: 'Mongolie', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇳' },
    { code: 'TW', nameFR: 'Taïwan', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇼' },
    { code: 'HK', nameFR: 'Hong Kong', continent: 'Asie', rarityBase: 'Epic', flag: '🇭🇰' },
    { code: 'MO', nameFR: 'Macao', continent: 'Asie', rarityBase: 'Legendary', flag: '🇲🇴' },
    { code: 'VN', nameFR: 'Viêt Nam', continent: 'Asie', rarityBase: 'Common', flag: '🇻🇳' },
    { code: 'LA', nameFR: 'Laos', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇦' },
    { code: 'KH', nameFR: 'Cambodge', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇭' },
    { code: 'TH', nameFR: 'Thaïlande', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇭' },
    { code: 'MM', nameFR: 'Myanmar', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇲' },
    { code: 'MY', nameFR: 'Malaisie', continent: 'Asie', rarityBase: 'Common', flag: '🇲🇾' },
    { code: 'SG', nameFR: 'Singapour', continent: 'Asie', rarityBase: 'Epic', flag: '🇸🇬' },
    { code: 'ID', nameFR: 'Indonésie', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇩' },
    { code: 'PH', nameFR: 'Philippines', continent: 'Asie', rarityBase: 'Common', flag: '🇵🇭' },
    { code: 'BN', nameFR: 'Brunei', continent: 'Asie', rarityBase: 'Epic', flag: '🇧🇳' },
    { code: 'TL', nameFR: 'Timor Oriental', continent: 'Asie', rarityBase: 'Epic', flag: '🇹🇱' },
    { code: 'IN', nameFR: 'Inde', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇳' },
    { code: 'PK', nameFR: 'Pakistan', continent: 'Asie', rarityBase: 'Common', flag: '🇵🇰' },
    { code: 'BD', nameFR: 'Bangladesh', continent: 'Asie', rarityBase: 'Common', flag: '🇧🇩' },
    { code: 'NP', nameFR: 'Népal', continent: 'Asie', rarityBase: 'Common', flag: '🇳🇵' },
    { code: 'BT', nameFR: 'Bhoutan', continent: 'Asie', rarityBase: 'Legendary', flag: '🇧🇹' },
    { code: 'LK', nameFR: 'Sri Lanka', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇰' },
    { code: 'MV', nameFR: 'Maldives', continent: 'Asie', rarityBase: 'Legendary', flag: '🇲🇻' },
    { code: 'AF', nameFR: 'Afghanistan', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇫' },
    { code: 'IR', nameFR: 'Iran', continent: 'Asie', rarityBase: 'Common', flag: '🇮🇷' },
    { code: 'IQ', nameFR: 'Irak', continent: 'Asie', rarityBase: 'Common', flag: '🇮🇶' },
    { code: 'SY', nameFR: 'Syrie', continent: 'Asie', rarityBase: 'Common', flag: '🇸🇾' },
    { code: 'LB', nameFR: 'Liban', continent: 'Asie', rarityBase: 'Common', flag: '🇱🇧' },
    { code: 'JO', nameFR: 'Jordanie', continent: 'Asie', rarityBase: 'Common', flag: '🇯🇴' },
    { code: 'IL', nameFR: 'Israël', continent: 'Asie', rarityBase: 'Rare', flag: '🇮🇱' },
    { code: 'PS', nameFR: 'Palestine', continent: 'Asie', rarityBase: 'Epic', flag: '🇵🇸' },
    { code: 'SA', nameFR: 'Arabie Saoudite', continent: 'Asie', rarityBase: 'Rare', flag: '🇸🇦' },
    { code: 'YE', nameFR: 'Yémen', continent: 'Asie', rarityBase: 'Common', flag: '🇾🇪' },
    { code: 'OM', nameFR: 'Oman', continent: 'Asie', rarityBase: 'Common', flag: '🇴🇲' },
    { code: 'AE', nameFR: 'Émirats Arabes Unis', continent: 'Asie', rarityBase: 'Epic', flag: '🇦🇪' },
    { code: 'QA', nameFR: 'Qatar', continent: 'Asie', rarityBase: 'Epic', flag: '🇶🇦' },
    { code: 'BH', nameFR: 'Bahreïn', continent: 'Asie', rarityBase: 'Epic', flag: '🇧🇭' },
    { code: 'KW', nameFR: 'Koweït', continent: 'Asie', rarityBase: 'Epic', flag: '🇰🇼' },
    { code: 'TR', nameFR: 'Turquie', continent: 'Asie', rarityBase: 'Rare', flag: '🇹🇷' },
    { code: 'GE', nameFR: 'Géorgie', continent: 'Asie', rarityBase: 'Common', flag: '🇬🇪' },
    { code: 'AM', nameFR: 'Arménie', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇲' },
    { code: 'AZ', nameFR: 'Azerbaïdjan', continent: 'Asie', rarityBase: 'Common', flag: '🇦🇿' },
    { code: 'KZ', nameFR: 'Kazakhstan', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇿' },
    { code: 'UZ', nameFR: 'Ouzbékistan', continent: 'Asie', rarityBase: 'Common', flag: '🇺🇿' },
    { code: 'TM', nameFR: 'Turkménistan', continent: 'Asie', rarityBase: 'Epic', flag: '🇹🇲' },
    { code: 'TJ', nameFR: 'Tadjikistan', continent: 'Asie', rarityBase: 'Common', flag: '🇹🇯' },
    { code: 'KG', nameFR: 'Kirghizistan', continent: 'Asie', rarityBase: 'Common', flag: '🇰🇬' },

    // ═══════════════════════════════════════════════════════════════════
    // AMÉRIQUE (35 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'US', nameFR: 'États-Unis', continent: 'Amérique', rarityBase: 'Rare', flag: '🇺🇸' },
    { code: 'CA', nameFR: 'Canada', continent: 'Amérique', rarityBase: 'Rare', flag: '🇨🇦' },
    { code: 'MX', nameFR: 'Mexique', continent: 'Amérique', rarityBase: 'Rare', flag: '🇲🇽' },
    { code: 'GT', nameFR: 'Guatemala', continent: 'Amérique', rarityBase: 'Common', flag: '🇬🇹' },
    { code: 'BZ', nameFR: 'Belize', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇿' },
    { code: 'SV', nameFR: 'Salvador', continent: 'Amérique', rarityBase: 'Common', flag: '🇸🇻' },
    { code: 'HN', nameFR: 'Honduras', continent: 'Amérique', rarityBase: 'Common', flag: '🇭🇳' },
    { code: 'NI', nameFR: 'Nicaragua', continent: 'Amérique', rarityBase: 'Common', flag: '🇳🇮' },
    { code: 'CR', nameFR: 'Costa Rica', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇷' },
    { code: 'PA', nameFR: 'Panama', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇦' },
    { code: 'CU', nameFR: 'Cuba', continent: 'Amérique', rarityBase: 'Rare', flag: '🇨🇺' },
    { code: 'JM', nameFR: 'Jamaïque', continent: 'Amérique', rarityBase: 'Epic', flag: '🇯🇲' },
    { code: 'HT', nameFR: 'Haïti', continent: 'Amérique', rarityBase: 'Common', flag: '🇭🇹' },
    { code: 'DO', nameFR: 'République Dominicaine', continent: 'Amérique', rarityBase: 'Common', flag: '🇩🇴' },
    { code: 'PR', nameFR: 'Porto Rico', continent: 'Amérique', rarityBase: 'Epic', flag: '🇵🇷' },
    { code: 'TT', nameFR: 'Trinité-et-Tobago', continent: 'Amérique', rarityBase: 'Epic', flag: '🇹🇹' },
    { code: 'BB', nameFR: 'Barbade', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇧' },
    { code: 'GD', nameFR: 'Grenade', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇬🇩' },
    { code: 'VC', nameFR: 'Saint-Vincent-et-les-Grenadines', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇻🇨' },
    { code: 'LC', nameFR: 'Sainte-Lucie', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇱🇨' },
    { code: 'DM', nameFR: 'Dominique', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇩🇲' },
    { code: 'AG', nameFR: 'Antigua-et-Barbuda', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇦🇬' },
    { code: 'KN', nameFR: 'Saint-Kitts-et-Nevis', continent: 'Amérique', rarityBase: 'Legendary', flag: '🇰🇳' },
    { code: 'BS', nameFR: 'Bahamas', continent: 'Amérique', rarityBase: 'Epic', flag: '🇧🇸' },
    { code: 'CO', nameFR: 'Colombie', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇴' },
    { code: 'VE', nameFR: 'Venezuela', continent: 'Amérique', rarityBase: 'Common', flag: '🇻🇪' },
    { code: 'GY', nameFR: 'Guyana', continent: 'Amérique', rarityBase: 'Epic', flag: '🇬🇾' },
    { code: 'SR', nameFR: 'Suriname', continent: 'Amérique', rarityBase: 'Epic', flag: '🇸🇷' },
    { code: 'EC', nameFR: 'Équateur', continent: 'Amérique', rarityBase: 'Common', flag: '🇪🇨' },
    { code: 'PE', nameFR: 'Pérou', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇪' },
    { code: 'BO', nameFR: 'Bolivie', continent: 'Amérique', rarityBase: 'Common', flag: '🇧🇴' },
    { code: 'BR', nameFR: 'Brésil', continent: 'Amérique', rarityBase: 'Rare', flag: '🇧🇷' },
    { code: 'PY', nameFR: 'Paraguay', continent: 'Amérique', rarityBase: 'Common', flag: '🇵🇾' },
    { code: 'UY', nameFR: 'Uruguay', continent: 'Amérique', rarityBase: 'Common', flag: '🇺🇾' },
    { code: 'AR', nameFR: 'Argentine', continent: 'Amérique', rarityBase: 'Rare', flag: '🇦🇷' },
    { code: 'CL', nameFR: 'Chili', continent: 'Amérique', rarityBase: 'Common', flag: '🇨🇱' },

    // ═══════════════════════════════════════════════════════════════════
    // OCÉANIE (14 pays)
    // ═══════════════════════════════════════════════════════════════════
    { code: 'AU', nameFR: 'Australie', continent: 'Océanie', rarityBase: 'Rare', flag: '🇦🇺' },
    { code: 'NZ', nameFR: 'Nouvelle-Zélande', continent: 'Océanie', rarityBase: 'Rare', flag: '🇳🇿' },
    { code: 'PG', nameFR: 'Papouasie-Nouvelle-Guinée', continent: 'Océanie', rarityBase: 'Common', flag: '🇵🇬' },
    { code: 'FJ', nameFR: 'Fidji', continent: 'Océanie', rarityBase: 'Epic', flag: '🇫🇯' },
    { code: 'SB', nameFR: 'Îles Salomon', continent: 'Océanie', rarityBase: 'Epic', flag: '🇸🇧' },
    { code: 'VU', nameFR: 'Vanuatu', continent: 'Océanie', rarityBase: 'Epic', flag: '🇻🇺' },
    { code: 'WS', nameFR: 'Samoa', continent: 'Océanie', rarityBase: 'Epic', flag: '🇼🇸' },
    { code: 'TO', nameFR: 'Tonga', continent: 'Océanie', rarityBase: 'Epic', flag: '🇹🇴' },
    { code: 'KI', nameFR: 'Kiribati', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇰🇮' },
    { code: 'FM', nameFR: 'Micronésie', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇫🇲' },
    { code: 'MH', nameFR: 'Îles Marshall', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇲🇭' },
    { code: 'PW', nameFR: 'Palaos', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇵🇼' },
    { code: 'NR', nameFR: 'Nauru', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇳🇷' },
    { code: 'TV', nameFR: 'Tuvalu', continent: 'Océanie', rarityBase: 'Legendary', flag: '🇹🇻' },
];

const SPECIAL_CARD_COUNTRY_CODES = new Set(['HK', 'MO']);
const COLLECTIBLE_COUNTRIES = COUNTRIES.filter(country => !SPECIAL_CARD_COUNTRY_CODES.has(country.code));
const TOTAL_COUNTRIES = COLLECTIBLE_COUNTRIES.length;

// Fonction pour obtenir tous les pays
function getAllCountries(): Country[] {
    return COUNTRIES;
}

function getCollectibleCountries(): Country[] {
    return COLLECTIBLE_COUNTRIES;
}

// Fonction pour obtenir un pays par code
function getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find(c => c.code === code);
}

// Fonction pour obtenir les pays par continent
function getCountriesByContinent(continent: Continent): Country[] {
    return COUNTRIES.filter(c => c.continent === continent);
}

// Fonction pour obtenir les pays par rareté
function getCountriesByRarity(rarity: Rarity): Country[] {
    return COUNTRIES.filter(c => c.rarityBase === rarity);
}
