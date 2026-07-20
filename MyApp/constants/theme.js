import { Platform } from 'react-native';

const tintColorLight = '#047857'; // Deep Emerald Green
const tintColorDark = '#34D399';  // Emerald Green

export const Colors = {
  light: {
    text: '#0F172A',         // Slate 900
    textSecondary: '#64748B',// Slate 500
    background: '#FFFFFF',   // Pure White Background for a Modern Look
    surface: '#FFFFFF',      // White surfaces for cards
    cardBackground: '#FFFFFF',
    border: '#E2E8F0',       // Slate 200
    tint: tintColorLight,
    icon: '#64748B',         // Slate 500
    tabIconDefault: '#94A3B8',// Slate 400
    tabIconSelected: tintColorLight,
    
    // Brand / Priority Colors
    primary: '#047857',      // Deep Emerald Green
    secondary: '#10B981',    // Emerald Green
    success: '#10B981',      // Emerald Green
    warning: '#F59E0B',      // Amber 500
    error: '#EF4444',        // Red 500
    
    // Priority Badges
    highPriority: '#EF4444',
    mediumPriority: '#F59E0B',
    lowPriority: '#3B82F6',
  },
  dark: {
    text: '#F8FAFC',         // Slate 50
    textSecondary: '#94A3B8',// Slate 400
    background: '#0F172A',   // Slate 900
    surface: '#1E293B',      // Slate 800
    cardBackground: '#1E293B',
    border: '#334155',       // Slate 700
    tint: tintColorDark,
    icon: '#94A3B8',         // Slate 400
    tabIconDefault: '#475569',// Slate 600
    tabIconSelected: tintColorDark,
    
    // Brand / Priority Colors
    primary: '#34D399',      // Emerald 400
    secondary: '#059669',    // Emerald 600
    success: '#059669',      // Emerald 600
    warning: '#FBBF24',      // Amber 400
    error: '#F87171',        // Red 400
    
    // Priority Badges
    highPriority: '#F87171',
    mediumPriority: '#FBBF24',
    lowPriority: '#60A5FA',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier New',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
