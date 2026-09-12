
import { Platform } from 'react-native';

/*
 * SLOTIX — SISTEMA GLOBAL DE TEMA
 *
 * O aplicativo possui dois temas:
 *
 * ☀️ light → modo claro
 * 🌙 dark  → modo escuro
 *
 * O app/_layout.tsx detecta o modo do telefone
 * através do useColorScheme().
 *
 * IMPORTANTE:
 * Este é o ÚNICO arquivo de tema do projeto.
 */

/* =========================================================
   CORES
   ========================================================= */

export const Colors = {
  light: {
    /* Texto */
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    /* Fundos */
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',

    /* Marca SLOTIX */
    primary: '#111827',
    primaryForeground: '#FFFFFF',

    /* Estados */
    success: '#16A34A',
    successBackground: '#DCFCE7',

    warning: '#D97706',
    warningBackground: '#FEF3C7',

    error: '#DC2626',
    errorBackground: '#FEE2E2',

    info: '#2563EB',
    infoBackground: '#DBEAFE',

    /* Bordas */
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',

    /* Componentes */
    card: '#FFFFFF',
    input: '#F9FAFB',

    /* Overlay */
    overlay: 'rgba(0, 0, 0, 0.45)',

    /* Elementos extras */
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    divider: '#E5E7EB',
    icon: '#4B5563',
    iconSecondary: '#9CA3AF',
  },

  dark: {
    /* Texto */
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',

    /* Fundos */
    background: '#05070A',
    backgroundSecondary: '#0B0F14',
    backgroundElement: '#111827',
    backgroundSelected: '#1F2937',

    /* Marca SLOTIX */
    primary: '#FFFFFF',
    primaryForeground: '#05070A',

    /* Estados */
    success: '#22C55E',
    successBackground: '#14532D',

    warning: '#F59E0B',
    warningBackground: '#78350F',

    error: '#EF4444',
    errorBackground: '#7F1D1D',

    info: '#3B82F6',
    infoBackground: '#1E3A8A',

    /* Bordas */
    border: '#1F2937',
    borderStrong: '#374151',

    /* Componentes */
    card: '#0B0F14',
    input: '#111827',

    /* Overlay */
    overlay: 'rgba(0, 0, 0, 0.70)',

    /* Elementos extras */
    surface: '#0B0F14',
    surfaceElevated: '#111827',
    divider: '#1F2937',
    icon: '#D1D5DB',
    iconSecondary: '#6B7280',
  },
} as const;

/* =========================================================
   TIPOS DO TEMA
   ========================================================= */

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

export type ThemeName = 'light' | 'dark';

/* =========================================================
   FONTES
   ========================================================= */

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },

  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-rounded',
    mono: 'monospace',
  },

  web: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },

  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

/* =========================================================
   ESPAÇAMENTOS
   ========================================================= */

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 40,
  eight: 48,
  nine: 64,
} as const;

/* =========================================================
   BORDER RADIUS
   ========================================================= */

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
  pill: 999,
} as const;

/* =========================================================
   TAMANHOS
   ========================================================= */

export const Sizes = {
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconXLarge: 32,

  buttonHeight: 48,
  inputHeight: 52,

  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 48,
  avatarXLarge: 64,
} as const;

/* =========================================================
   SOMBRAS
   ========================================================= */

export const Shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  medium: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  large: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/* =========================================================
   SAFE AREA / TABS
   ========================================================= */

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
    default: 0,
  }) ?? 0;

/* =========================================================
   LARGURA MÁXIMA
   ========================================================= */

export const MaxContentWidth = 800;

