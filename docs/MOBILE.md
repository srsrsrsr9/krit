# MOBILE.md — Mobile App Conventions (React Native / Expo)

---

## Stack Declaration

**Framework:** Expo SDK [version] — Managed workflow
**React Native version:** [version]
**Target platforms:** iOS [min version] · Android [min version]
**Build system:** EAS Build
**OTA updates:** EAS Update (hotfixes only — see §Update Policy)

> Update this section when the stack changes. Claude must read this before writing any mobile code.

---

## Expo vs Bare — Know the Difference

This project uses the **Expo managed workflow** unless stated otherwise above.

| | Managed (Expo Go) | Development Build | Bare |
|---|---|---|---|
| Custom native modules | ❌ | ✅ | ✅ |
| Expo Go compatible | ✅ | ❌ | ❌ |
| OTA updates | ✅ | ✅ | ✅ (manual setup) |
| EAS Build required | No | Yes | Yes |

**Rules for Claude:**
- Never write native module code (Java/Kotlin/Swift/ObjC) in a managed workflow project.
- If a library requires `expo prebuild` or native changes, flag it before installing — don't assume it's fine.
- If unsure whether a package is Expo-compatible, check [expo.dev/packages](https://expo.dev/packages) first.

---

## Navigation

Use Expo Router (file-based routing). Do not use React Navigation directly unless Expo Router is explicitly disabled.

```
app/
  _layout.tsx          ← root layout, wraps everything
  index.tsx            ← / (home)
  (auth)/
    login.tsx          ← /login
    signup.tsx         ← /signup
  (tabs)/
    _layout.tsx        ← tab bar layout
    home.tsx           ← /home
    profile.tsx        ← /profile
  [id].tsx             ← dynamic route
```

```tsx
// Navigate programmatically
import { router } from "expo-router"
router.push("/profile")
router.replace("/(tabs)/home")
router.back()

// Navigate via Link component
import { Link } from "expo-router"
<Link href="/profile">Profile</Link>
```

---

## Platform-Specific Code

Handle iOS and Android differences explicitly. Never assume one platform's behaviour.

```tsx
import { Platform, StyleSheet } from "react-native"

// Inline platform check
const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
})

// Platform-specific files (auto-resolved by Metro)
// Button.ios.tsx    ← loaded on iOS
// Button.android.tsx ← loaded on Android
// Button.tsx         ← fallback
```

---

## Safe Area & Keyboard

Always handle safe areas and keyboard. Ignoring these breaks layout on notch devices and when the keyboard appears.

```tsx
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAvoidingView, Platform } from "react-native"

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
```

**Rules:**
- Wrap every screen in `SafeAreaView` from `react-native-safe-area-context` (not the built-in one).
- Always use `KeyboardAvoidingView` on screens with text inputs.
- Never hardcode status bar heights — use `useSafeAreaInsets()`.

---

## Styling

React Native uses a subset of CSS via `StyleSheet`. Tailwind is not available natively.

```tsx
import { StyleSheet, View, Text } from "react-native"

// ✅ Use StyleSheet.create — better performance, type checking
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
})

// NativeWind — if installed, Tailwind classes work in RN
// Check package.json for "nativewind" before using className
<View className="flex-1 p-4 bg-white">
  <Text className="text-xl font-semibold text-gray-900">Title</Text>
</View>
```

**Rules:**
- If NativeWind is installed (check `package.json`), use Tailwind classes.
- If not, use `StyleSheet.create` — never use plain object styles inline.
- React Native does not support all CSS properties — `box-shadow` is iOS only (`elevation` for Android).
- `flex` direction defaults to `column` in React Native (not `row` like web).

---

## EAS Build Profiles

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "autoIncrement": true,
      "env": { "APP_ENV": "production" }
    }
  }
}
```

```bash
# Development build (install on device for testing)
eas build --profile development --platform ios

# Preview build (internal testing / TestFlight)
eas build --profile preview --platform all

# Production build (App Store / Play Store)
eas build --profile production --platform all
```

**Rules:**
- Development builds go to internal distribution only.
- Preview builds are for TestFlight / internal Play Store track.
- Production builds only after preview has been tested.
- Never use production credentials (`EXPO_PUBLIC_` vars) in development or preview builds.

---

## OTA Update Policy

EAS Update allows pushing JS/asset updates without a store review.

```bash
# Push OTA update to production channel
eas update --branch production --message "Fix checkout crash"

# Push to staging/preview channel first
eas update --branch preview --message "Test fix for checkout crash"
```

**Use OTA for:**
- Bug fixes that don't change native code
- Copy/content changes
- UI tweaks

**Require a store submission for:**
- New native modules or permissions
- Changes to `app.json` (name, icon, splash, permissions)
- Expo SDK upgrades
- Any change to `ios/` or `android/` directories

---

## Deep Linking

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "web": { "bundler": "metro" }
  }
}
```

```tsx
// Handle deep links in root _layout.tsx
import * as Linking from "expo-linking"

const prefix = Linking.createURL("/")
// myapp:// (dev) or https://myapp.com (production)
```

---

## Permissions

Declare all permissions in `app.json` before using them. iOS requires usage descriptions.

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Used to scan QR codes for check-in.",
        "NSLocationWhenInUseUsageDescription": "Used to show nearby locations."
      }
    },
    "android": {
      "permissions": ["CAMERA", "ACCESS_FINE_LOCATION"]
    }
  }
}
```

**Rules:**
- Always add permission descriptions before requesting the permission in code.
- Request permissions at the moment they're needed — not on app launch.
- Handle the case where permission is denied gracefully.

---

## App Store Compliance (iOS)

- **Privacy manifest** (`PrivacyInfo.xcprivacy`) required for iOS 17+ if using certain APIs (UserDefaults, file timestamps, disk space). Expo handles this for built-in APIs — check if any native modules need manual entries.
- **App Tracking Transparency (ATT):** If using any ad/analytics tracking, must show ATT prompt before tracking.
- **In-App Purchase:** Digital goods must use Apple IAP — no linking to external payment flows for digital content.
- **Screenshots:** Required for all supported device sizes before App Store submission.

---

## Offline & Sync

Define the offline strategy before writing data layer code.

```ts
// Default assumption: online-only
// If offline support is needed, document the strategy here:
// - What data is cached and for how long?
// - How are conflicts resolved on reconnect?
// - What operations are queued offline?
```

Recommended: `@tanstack/react-query` with `persistQueryClient` for simple offline caching, or `WatermelonDB` for complex offline-first sync.

---

## Rules for Claude

- Always check which workflow (managed/bare) and Expo SDK version before writing mobile code.
- Never write native (Java/Kotlin/Swift) code in a managed workflow project — flag and ask.
- Always wrap screens in `SafeAreaView` and `KeyboardAvoidingView` where inputs exist.
- Always handle both iOS and Android platform differences explicitly.
- Never hardcode pixel values for safe areas or status bars.
- Use EAS build profiles correctly — never use production env vars in dev/preview builds.
- OTA updates for JS fixes only — flag if a change requires a store submission.
- Check `expo.dev/packages` before installing a library to confirm Expo compatibility.
