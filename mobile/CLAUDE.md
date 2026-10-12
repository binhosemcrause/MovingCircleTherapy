# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the `mobile/` app. Run all commands below from inside `mobile/`.

## Commands

```bash
# Start the dev server (opens Expo Go QR code)
npm start

# Run on a specific platform
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Browser

# Install dependencies
npm install
```

There is no lint or test setup in this project.

## Architecture

This is a React Native Expo app (JavaScript, not TypeScript) with React Native's new architecture enabled (`newArchEnabled: true` in `app.json`).

**Entry point:** `index.js` → `App.js` → four tab screens

**Navigation:** Single-level bottom tab navigator (React Navigation `@react-navigation/bottom-tabs`). All screens are top-level tabs; there is no stack navigator or nested navigation.

**Screens** (`src/screens/`):
- `HomeScreen.js` — landing page with quick actions and contact info
- `ServicesScreen.js` — therapy service listings with pricing
- `BookScreen.js` — appointment booking form and existing appointments list
- `ProfileScreen.js` — mock auth (login/register), user info, insurance, and settings

**State management:** Local `useState` only — no Redux, Context API, or global store. Authentication is mocked with no real backend integration.

**Design system** (`src/utils/theme.ts`, tokens defined in `DESIGN.md`): Import `colors`, `tones`, `typography`, `spacing`, and `borderRadius` from this file rather than hardcoding values inline. Use `typography.*` text styles instead of setting font families and sizes by hand, `tones` for any coloured fill that carries text (the pairings are contrast-checked), and `src/components/Button.tsx` for actions.

**Fonts:** `Fraunces` (headings) and `Josefin Sans` (body), loaded in `App.tsx` via `expo-font` from `@expo-google-fonts/*`. DESIGN.md type sizes are on the 656-wide design canvas; `theme.ts` scales them to points.
