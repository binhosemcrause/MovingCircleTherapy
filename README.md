# Moving Circle Therapy App

A React Native Expo app for Moving Circle Therapy, providing a comprehensive platform for therapy services, appointment booking, and client management.

## Features

### 🏠 Home Screen
- **Therapy for All**: Access to comprehensive mental health support for all ages and backgrounds
- **Resources**: Educational materials, self-help tools, and mental health resources
- **Quick Actions**: Direct access to book appointments and view services
- **Contact Information**: Easy access to therapy center contact details

### 🏥 Services Screen
- **Individual Therapy**: One-on-one sessions tailored to specific needs
- **Couples Therapy**: Relationship counseling and communication improvement
- **Family Therapy**: Family dynamics and relationship building
- **Group Therapy**: Peer support in a collaborative environment
- **Specialized Services**: Anxiety & Depression, Trauma Therapy, Child & Adolescent, Substance Abuse
- **Pricing Information**: Transparent pricing for all services
- **Insurance Support**: Information about insurance acceptance

### 📅 Book Appointment Screen
- **Appointment Booking Form**: Comprehensive form for scheduling sessions
- **Service Selection**: Choose from available therapy services
- **Time Slot Selection**: Flexible scheduling options
- **Existing Appointments**: View and manage current appointments
- **Login Integration**: Seamless connection with user profile

### 👤 Profile Screen
- **User Authentication**: Login and registration functionality
- **Personal Information**: Complete user profile management
- **Emergency Contacts**: Important contact information
- **Insurance Details**: Insurance provider and policy information
- **Account Settings**: Notification preferences and account management
- **Logout Functionality**: Secure account logout

## Design System

### Colors
- **Primary**: `#FEFAF5` (Warm off-white)
- **Secondary**: `#8DB4D6` (Soft blue)
- **Accent**: `#F2A477` (Warm orange)

### Typography
- **Josefin Sans**: Headers and titles
- **Garet**: Subheaders and emphasis text
- **Arimo**: Body text and general content

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation Steps

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

4. **Run on your preferred platform**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Project Structure

```
MovingCircleTherapy/
├── App.js                 # Main app component with navigation
├── src/
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── ServicesScreen.js
│   │   ├── BookScreen.js
│   │   └── ProfileScreen.js
│   ├── components/        # Reusable components
│   ├── navigation/        # Navigation configuration
│   ├── utils/            # Utilities and theme
│   │   └── theme.js      # Colors, fonts, spacing
│   └── assets/           # Images and static assets
├── package.json
└── README.md
```

## Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation between screens
- **Expo Vector Icons**: Icon library
- **React Native Vector Icons**: Additional icon support

## Development Notes

### State Management
The app uses React's built-in state management with `useState` hooks for local component state. For a production app, consider implementing:
- Redux or Context API for global state
- AsyncStorage for persistent data
- Secure storage for authentication tokens

### Authentication
Currently implements mock authentication. For production:
- Integrate with a backend authentication service
- Implement secure token storage
- Add biometric authentication options

### Data Persistence
For production implementation:
- Connect to a backend API
- Implement offline data caching
- Add data synchronization

### Additional Features to Consider
- Push notifications for appointment reminders
- Video call integration for telehealth
- Payment processing integration
- Document upload for intake forms
- Progress tracking and journaling features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about the Moving Circle Therapy app, please contact the development team. 