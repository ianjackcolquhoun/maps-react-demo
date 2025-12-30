# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo-based React Native application using React 19, React Native 0.81.5, and Expo SDK ~54. The project uses file-based routing via `expo-router` and supports iOS, Android, and web platforms with React's new architecture enabled.

## Development Commands

### Running the app
```bash
# Start the Expo development server
npx expo start

# Start on specific platforms
npm run android
npm run ios
npm run web
```

### Code quality
```bash
# Run linter
npm run lint
```

### Reset project
```bash
# Move starter code to app-example/ and create blank app/ directory
npm run reset-project
```

## Architecture

### File-Based Routing (Expo Router)
- Routes are defined by the file structure in the `app/` directory
- `app/_layout.tsx` - Root layout with navigation theme provider
- `app/(tabs)/_layout.tsx` - Tab navigation layout
- `app/(tabs)/index.tsx` - Home tab screen
- `app/(tabs)/explore.tsx` - Explore tab screen
- `app/modal.tsx` - Modal screen example
- The `(tabs)` directory uses route groups (parentheses are omitted from URLs)

### Path Aliases
The project uses `@/` as an alias for the root directory (configured in `tsconfig.json`):
```typescript
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
```

### Theming System
The app implements a dual-theme system (light/dark mode):

**Theme definitions**: `constants/theme.ts` exports:
- `Colors` object with light/dark variants for text, background, tint, icons
- `Fonts` object with platform-specific font families

**Theme hooks**:
- `hooks/use-color-scheme.ts` - Detects system color scheme
- `hooks/use-theme-color.ts` - Retrieves theme colors with optional overrides

**Themed components**:
- `components/themed-text.tsx` - Text component with theme-aware colors and typography variants (default, title, subtitle, link, defaultSemiBold)
- `components/themed-view.tsx` - View component with theme-aware background colors
- Components accept `lightColor` and `darkColor` props to override theme defaults

### UI Components
- `components/ui/` - Reusable UI primitives
  - `icon-symbol.tsx` - Cross-platform icon wrapper (iOS uses SF Symbols)
  - `icon-symbol.ios.tsx` - iOS-specific icon implementation
  - `collapsible.tsx` - Collapsible section component
- `components/haptic-tab.tsx` - Tab button with haptic feedback
- `components/parallax-scroll-view.tsx` - Scroll view with parallax header effect
- `components/external-link.tsx` - Link component for external URLs
- `components/hello-wave.tsx` - Animated wave emoji component

### Expo Configuration
Key settings in `app.json`:
- **New Architecture**: Enabled (`newArchEnabled: true`)
- **Experiments**: Typed routes and React Compiler enabled
- **Edge-to-edge**: Android edge-to-edge enabled
- **Schemes**: Deep linking via `mapsreactdemo://`
- **Web**: Static output for deployment

## TypeScript
- Strict mode enabled in `tsconfig.json`
- Type definitions auto-generated in `.expo/types/`
- Expo environment types in `expo-env.d.ts`

## Platform-Specific Code
Use platform-specific file extensions when needed:
- `.ios.tsx` for iOS-specific implementations
- `.android.tsx` for Android-specific implementations
- `.web.ts` for web-specific implementations
- Base file (e.g., `.tsx`) as fallback

## Key Dependencies
- **Navigation**: `expo-router` (file-based), `@react-navigation/native`
- **Animations**: `react-native-reanimated`, `react-native-worklets`
- **Gestures**: `react-native-gesture-handler`
- **Icons**: `@expo/vector-icons`, `expo-symbols` (SF Symbols)
- **Image handling**: `expo-image`
