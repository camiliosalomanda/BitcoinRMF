# 🐔 Egg Drop Chaos

A fun, addictive 2D mobile game where you control a chicken fluttering through a neighborhood, dropping eggs on cars, mailboxes, trashcans, and other targets! Built with Flutter and the Flame game engine.

## 🎮 Game Features

- **Flappy Bird-style gameplay**: Tap to flap and keep your chicken airborne
- **Drop eggs on targets**: Cars, mailboxes, trashcans, bicycles, doghouses, gnomes, and flamingos
- **Combo system**: Hit consecutive targets for bonus points
- **Progressive difficulty**: Game speeds up as your score increases
- **Detailed graphics**: Custom-drawn targets with animations
- **Sound effects & music**: Immersive audio experience
- **Statistics tracking**: Track your progress across games

## 💰 Monetization

### Freemium Version
- Banner ads during gameplay (bottom of screen)
- Interstitial ads every 3 games
- Rewarded ads for bonus points
- In-app purchases to remove ads or upgrade to premium

### Paid Version
- Set `isPaidVersion = true` in `lib/config/app_config.dart`
- No advertisements
- All features unlocked

## 🛠️ Setup Instructions

### Prerequisites

1. **Flutter SDK** (3.16.0 or higher)
   ```bash
   flutter --version
   ```

2. **Xcode** (for iOS, macOS only)
3. **Android Studio** (for Android)
4. **CocoaPods** (for iOS)
   ```bash
   sudo gem install cocoapods
   ```

### Initial Setup

1. **Clone and setup the project**
   ```bash
   cd egg_drop_chaos
   flutter pub get
   ```

2. **Generate app icons** (after adding assets/images/app_icon.png)
   ```bash
   flutter pub run flutter_launcher_icons
   ```

### Adding Required Assets

Create the following asset files:

```
assets/
├── images/
│   └── app_icon.png          # 1024x1024 app icon
├── audio/
│   ├── flap.wav              # Wing flap sound
│   ├── egg_drop.wav          # Egg dropping sound
│   ├── hit.wav               # Target hit sound
│   ├── miss.wav              # Miss sound
│   ├── powerup.wav           # Bonus/powerup sound
│   ├── game_over.wav         # Game over sound
│   └── background_music.mp3  # Background music loop
└── fonts/
    └── PressStart2P-Regular.ttf  # Retro pixel font
```

**Font Download**: Get PressStart2P from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)

### AdMob Configuration

1. **Create AdMob account**: https://admob.google.com

2. **Create app entries** for iOS and Android

3. **Create ad units**:
   - Banner Ad
   - Interstitial Ad
   - Rewarded Ad

4. **Update `lib/config/app_config.dart`** with your actual Ad Unit IDs:
   ```dart
   // Replace test IDs with production IDs
   static String get bannerAdUnitId {
     if (Platform.isAndroid) {
       return 'ca-app-pub-XXXXX/YYYYY'; // Your Android Banner ID
     } else if (Platform.isIOS) {
       return 'ca-app-pub-XXXXX/YYYYY'; // Your iOS Banner ID
     }
   }
   ```

### Android Setup

1. **Update `android/app/build.gradle`**:
   ```gradle
   android {
       defaultConfig {
           applicationId "com.yourstudio.eggdropchaos.free"
           minSdkVersion 21
           targetSdkVersion 34
       }
   }
   ```

2. **Update `android/app/src/main/AndroidManifest.xml`**:
   ```xml
   <manifest>
       <!-- Add inside <application> tag -->
       <meta-data
           android:name="com.google.android.gms.ads.APPLICATION_ID"
           android:value="ca-app-pub-XXXXXXXXXXXXX~XXXXXXXXXX"/>
       
       <!-- Permissions -->
       <uses-permission android:name="android.permission.INTERNET"/>
       <uses-permission android:name="com.android.vending.BILLING"/>
   </manifest>
   ```

3. **Create `android/app/src/main/res/values/strings.xml`**:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="app_name">Egg Drop Chaos</string>
   </resources>
   ```

### iOS Setup

1. **Update `ios/Runner/Info.plist`**:
   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-XXXXXXXXXXXXX~XXXXXXXXXX</string>
   
   <key>SKAdNetworkItems</key>
   <array>
       <dict>
           <key>SKAdNetworkIdentifier</key>
           <string>cstr6suwn9.skadnetwork</string>
       </dict>
   </array>
   
   <key>NSUserTrackingUsageDescription</key>
   <string>This identifier will be used to deliver personalized ads to you.</string>
   ```

2. **Install CocoaPods dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

### In-App Purchases Setup

#### Google Play Console
1. Create your app in Google Play Console
2. Go to Monetize > Products > In-app products
3. Create products with IDs:
   - `remove_ads` - One-time purchase
   - `premium_upgrade` - One-time purchase

#### App Store Connect
1. Create your app in App Store Connect
2. Go to Features > In-App Purchases
3. Create products with IDs:
   - `remove_ads` - Non-Consumable
   - `premium_upgrade` - Non-Consumable

## 🏗️ Building for Release

### Android Release Build

1. **Create keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias upload
   ```

2. **Create `android/key.properties`**:
   ```properties
   storePassword=<password>
   keyPassword=<password>
   keyAlias=upload
   storeFile=<path-to-keystore>
   ```

3. **Build APK or App Bundle**:
   ```bash
   # App Bundle (recommended for Play Store)
   flutter build appbundle --release
   
   # APK
   flutter build apk --release
   ```

### iOS Release Build

1. **Open in Xcode**:
   ```bash
   open ios/Runner.xcworkspace
   ```

2. **Configure signing**:
   - Select Runner target
   - Go to Signing & Capabilities
   - Select your team and provisioning profile

3. **Archive and upload**:
   - Product > Archive
   - Distribute App > App Store Connect

## 📁 Project Structure

```
lib/
├── main.dart                 # App entry point
├── config/
│   └── app_config.dart       # Game configuration & constants
├── game/
│   ├── egg_drop_game.dart    # Main game loop
│   └── components/
│       ├── chicken.dart      # Player character
│       ├── egg.dart          # Projectile
│       ├── target.dart       # Hit targets
│       ├── background.dart   # Sky & sun
│       ├── ground.dart       # Scrolling ground
│       ├── cloud.dart        # Parallax clouds
│       ├── house.dart        # Background houses
│       └── score_popup.dart  # Floating score text
├── screens/
│   ├── splash_screen.dart    # Loading screen
│   ├── main_menu_screen.dart # Main menu
│   ├── game_screen.dart      # Game container
│   ├── settings_screen.dart  # Settings
│   ├── stats_screen.dart     # Player statistics
│   └── shop_screen.dart      # In-app purchases
├── widgets/
│   ├── game_button.dart      # Styled buttons
│   ├── game_hud.dart         # In-game HUD
│   ├── pause_overlay.dart    # Pause menu
│   ├── game_over_overlay.dart# Game over screen
│   └── animated_background.dart # Menu background
└── services/
    ├── ad_service.dart       # AdMob integration
    ├── audio_service.dart    # Sound effects & music
    ├── game_state_service.dart # Persistence
    └── purchase_service.dart # In-app purchases
```

## 🎯 Target Types & Points

| Target    | Points | Spawn Rate |
|-----------|--------|------------|
| Car       | 10     | 25%        |
| Mailbox   | 15     | 25%        |
| Trashcan  | 12     | 20%        |
| Bicycle   | 20     | 10%        |
| Doghouse  | 25     | 10%        |
| Gnome     | 50     | 5%         |
| Flamingo  | 50     | 5%         |

## 🔧 Customization

### Adjusting Game Difficulty

Edit `lib/config/app_config.dart`:

```dart
// Slower gravity = easier
static const double gravity = 800.0;

// Higher = stronger flap
static const double chickenFlapVelocity = -350.0;

// Starting game speed
static const double gameSpeed = 150.0;

// Maximum speed cap
static const double maxGameSpeed = 350.0;
```

### Creating Paid Version

1. Update `lib/config/app_config.dart`:
   ```dart
   static const bool isPaidVersion = true;
   ```

2. Update bundle ID:
   ```dart
   static const String bundleIdPaid = 'com.yourstudio.eggdropchaos.premium';
   ```

3. Rebuild the app

## 📱 Testing

### Run on Device

```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device_id>

# Run in debug mode
flutter run

# Run in release mode
flutter run --release
```

### Test Ads

The app uses Google's test ad unit IDs by default. These will show test ads without affecting your AdMob account.

## 🐛 Troubleshooting

### iOS Build Issues

```bash
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter pub get
```

### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### AdMob Not Showing

1. Ensure internet permission is granted
2. Check AdMob dashboard for app approval status
3. Wait 24-48 hours after creating new ad units
4. Verify App ID is correct in platform configs

## 📄 License

This game is proprietary software. All rights reserved.

## 👥 Credits

- Game Design & Development: Your Studio
- Built with Flutter & Flame Engine
- Font: Press Start 2P by CodeMan38

---

**Happy Egg Dropping! 🥚💥**
