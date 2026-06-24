# Moving Circle Therapy App

A React Native Expo app for Moving Circle Therapy, providing a platform for therapy services, appointment booking, and client profile management.

Built with **TypeScript**, **Expo SDK 54**, and React Native's **New Architecture**.

## Features

### Home Screen
- **Therapy for All** and **Resources** menu cards with descriptions
- **Quick Actions** to jump to Book and Services tabs
- **Contact Information** (phone, email, address)

### Services Screen
- Eight therapy offerings with descriptions, duration, pricing, and feature lists
- Individual, couples, family, group, and specialized services
- Insurance and payment information section

### Book Appointment Screen
- Appointment booking form (name, email, phone, service, date, time, notes)
- Service and time slot pickers
- Existing appointments list (when logged in)
- Sign-in prompt for unauthenticated users

### Profile Screen
- Mock login and registration flows
- User profile with personal, emergency contact, and insurance details
- Account settings toggles and logout

## Design System

Design tokens live in `src/utils/theme.ts`. Import `colors`, `fonts`, `spacing`, and `borderRadius` rather than hardcoding values.

### Colors
| Token | Value | Use |
|---|---|---|
| Primary | `#FEFAF5` | Backgrounds |
| Secondary | `#8DB4D6` | Soft blue, inactive states |
| Accent | `#F2A477` | Active states, CTAs |

### Typography
- **Josefin Sans** — headers and titles
- **Garet** — subheaders and emphasis
- **Arimo** — body text

Custom fonts are defined in the theme and the `expo-font` plugin is configured, but font loading is not yet wired up in the app — system fonts are used as fallbacks until that is implemented.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**
- **Expo Go** on a physical device (must match **SDK 54**), or:
  - **Xcode** + iOS Simulator (macOS), or
  - **Android Studio** + Android emulator

A separate global Expo CLI install is not required — the project includes the `expo` package locally.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MovingCircleTherapy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run the app**
   - **Physical device:** Scan the QR code with Expo Go (Android) or the Camera app (iOS)
   - **Simulator/emulator:**
     ```bash
     npm run ios       # iOS Simulator
     npm run android   # Android emulator
     ```

   If you hit stale cache issues after upgrading dependencies:
   ```bash
   npm start -- --clear
   ```

5. **Type-check** (optional)
   ```bash
   npm run typecheck
   ```

### Web

Web support is not fully configured out of the box. To enable it, install the required packages:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

Then run `npm run web`.

## Project Structure

```
MovingCircleTherapy/
├── index.ts                    # App entry point
├── App.tsx                     # Root component and bottom tab navigation
├── app.json                    # Expo configuration
├── tsconfig.json               # TypeScript configuration
├── assets/                     # App icons, splash, logo
├── src/
│   ├── screens/                # Tab screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ServicesScreen.tsx
│   │   ├── BookScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── types.ts            # RootTabParamList for typed navigation
│   └── utils/
│       └── theme.ts            # Colors, fonts, spacing, borderRadius
└── package.json
```

**Navigation:** Single-level bottom tab navigator (`@react-navigation/bottom-tabs`). All screens are top-level tabs — there is no stack or nested navigation.

**Entry flow:** `index.ts` → `App.tsx` → four tab screens

## Key Technologies

| Technology | Version / Notes |
|---|---|
| Expo SDK | 54 |
| React Native | 0.81 |
| React | 19 |
| TypeScript | 5.9 |
| React Navigation | Bottom tabs |
| Expo Vector Icons | Tab and screen icons |

## Development Notes

### State Management
Local `useState` only — no Redux, Context API, or global store.

### Authentication
Mock authentication with no backend integration. Login and registration update local state only.

### Data Persistence
No API or persistent storage yet. Appointments and profile data are hardcoded or held in component state.

### Production Considerations
- Backend API integration
- Secure token storage and real authentication
- Persistent data (e.g. AsyncStorage or a database)
- Push notifications for appointment reminders
- Custom font loading via `expo-font`

There is no lint or test setup in this project.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run typecheck` and test in Expo Go or a simulator
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about the Moving Circle Therapy app, please contact the development team.
