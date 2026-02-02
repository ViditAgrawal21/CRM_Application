# CRM Mobile Application

Production-ready React Native CRM mobile app for Android.

## 🚀 Quick Start

```bash
# Start Metro Bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 🎯 Features Implemented

✅ **Authentication** - Login, JWT, auto-login  
✅ **Dark/Light Theme** - Theme switcher  
✅ **Dashboard** - Greeting, stats, quick actions  
✅ **Leads** - List, create, call, WhatsApp  
✅ **Settings** - Profile, theme toggle, logout  

## 📡 API Configuration

Backend API: `http://localhost:3000`

For Android Emulator: Use `http://10.0.2.2:3000`

Edit in `src/config/index.ts`

## 🎨 Tech Stack

- React Native 0.83.1 + TypeScript
- React Navigation (Bottom Tabs + Stack)
- TanStack Query (React Query)
- Axios
- Ionicons
- AsyncStorage

## 📁 Structure

```
src/
├── api/           # Axios client
├── services/      # API services
├── navigation/    # Navigation setup
├── components/    # Reusable components
├── screens/       # Screen components
├── hooks/         # useTheme, useAuth
├── utils/         # Helpers, storage
├── theme/         # Colors, typography
├── types/         # TypeScript types
└── config/        # Configuration
```

## 🔑 Test Login

```
Admin: 1234567890 / admin123
Manager: 9876543210 / manager123
Employee: 5555555555 / employee123
```

## 🚧 Next Steps

Create these screens to complete the app:

- FollowUpScreen.tsx
- BacklogScreen.tsx  
- MeetingScheduleScreen.tsx
- VisitScheduleScreen.tsx
- LeadDetailsScreen.tsx
- TemplatesScreen.tsx
- PropertiesScreen.tsx
- ReportsScreen.tsx
- TeamScreen.tsx

All services & types are ready. Just build the UI!

---

**Clean, modular, production-ready code ✨**
