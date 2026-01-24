# Crochet Buddy - Simplified Version (No Accounts)

This version removes the account system for simpler compliance and easier app store approval.

## What Changed

### Removed ❌
- Email/password accounts
- Sign in / Sign up screens
- Account screen
- User data collection

### Kept ✅
- Pro/Free tier functionality
- Placeholder ads
- Affiliate shopping links
- In-app purchase flow (placeholder - ready for real IAP)
- All pattern generation features
- Local storage for patterns & progress

## File Structure

```
app/
  _layout.tsx      # Main layout with ProProvider
  index.tsx        # Home screen
  create.tsx       # Pattern creation (text + Pro image features)
  pattern.tsx      # Pattern viewer with steps
  my-patterns.tsx  # Saved patterns list
  achievements.tsx # Achievements screen

components/
  AdBanner.tsx     # Placeholder ads (COPPA-ready)
  MaterialCard.tsx # Materials with affiliate links
  UpgradeModal.tsx # Pro upgrade flow
  WoollyMascot.tsx # Mascot component
  StarCounter.tsx  # Stars display
  StepCard.tsx     # Step cards

hooks/
  usePro.tsx       # Simple Pro status (replaces useAuth)

constants/
  Colors.ts        # App colors
  Types.ts         # TypeScript types

utils/
  api.ts           # Anthropic API calls
  storage.ts       # AsyncStorage helpers

PRIVACY_POLICY.md  # Required for app stores
```

## Setup Instructions

1. Copy all files to your existing project (replace existing files)

2. Delete old auth files if they exist:
   - `app/sign-in.tsx`
   - `app/sign-up.tsx`
   - `app/account.tsx`
   - `hooks/useAuth.tsx`

3. Add your API key in `utils/api.ts`:
   ```typescript
   const API_KEY = 'sk-ant-api03-xxxxx';
   ```

4. Restart the app:
   ```
   npx expo start --clear
   ```

## Before Publishing

### Required:
1. ✅ Fill in PRIVACY_POLICY.md with your contact info
2. ✅ Host privacy policy on a website (required by app stores)
3. ✅ Create Apple Developer account ($99/year)
4. ✅ Create Google Play Developer account ($25 one-time)

### For Real In-App Purchases:
1. Set up products in App Store Connect / Google Play Console
2. Install: `npx expo install expo-in-app-purchases`
3. Update `UpgradeModal.tsx` with real purchase code (see comments in file)

### For Real Ads:
1. Create Google AdMob account
2. Set up COPPA-compliant ad unit
3. Update `AdBanner.tsx` with real AdMob code (see comments in file)

### For Affiliate Links:
1. Sign up for Amazon Associates (after app is live)
2. Update affiliate tag in `MaterialCard.tsx`

## Data Storage Summary

| Data | Location | Shared? |
|------|----------|---------|
| Patterns | Device only | No |
| Progress | Device only | No |
| Pro status | Device only | No |
| Payments | App Store/Google | Handled by them |

## Compliance

- ✅ COPPA compliant (no data collection from children)
- ✅ GDPR friendly (no personal data stored)
- ✅ CCPA friendly (no data to sell)
- ✅ Privacy policy included
