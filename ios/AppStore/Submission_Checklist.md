# iOS App Store Submission Checklist & Guide

This guide covers what was added automatically and the manual steps you still need to perform to submit Job-Hunter to the iOS App Store.

## 1. App Store Connect Metadata ✅
- Created `ios/AppStore/metadata.md`. This contains your Title, Subtitle, Keywords, Description, and URLs.
- **Manual Step:** Copy-paste the content from `metadata.md` into your App Store Connect listing at [appstoreconnect.apple.com](https://appstoreconnect.apple.com/).

## 2. Privacy Policy ✅
- Created `public/privacy-policy.html` to host your privacy policy.
- **Manual Step:** Host this page (if you deploy the `public/` directory via Netlify/Vercel/etc., it will be live at `yourdomain.com/privacy-policy.html`). Paste the live link into App Store Connect.

## 3. Entitlements & Capabilities ✅
- Created `ios/App/App/App.entitlements` with placeholders for Push Notifications (`aps-environment`), Universal Links (`associated-domains`), and In-App Purchases.
- **Manual Step:** In Xcode, select the `App` target, go to **Signing & Capabilities**, and ensure the required capabilities are actually toggled on. If you do not use Push or IAP, remove them from the capabilities list or the `.entitlements` file before submission.

## 4. App Icons & Launch Screens ⏳ (Manual Setup Required)
App Store Connect requires app icons in exact dimensions, otherwise the build is rejected.
- **Manual Step (Icons):** Use [MakeAppIcon](https://makeappicon.com/) or the built-in Capacitor tool (`npx @capacitor/assets generate --iconBackgroundColor #ffffff --splashBackgroundColor #ffffff`) to generate the `AppIcon.appiconset`.
  - Place your master `icon.png` and `splash.png` (at least 1024x1024) in the `resources/` folder.
  - Run `npm install @capacitor/assets --save-dev` and `npx capacitor-assets generate --ios`.
- **Manual Step (Launch Screen):** If you use Capacitor 5+, the splash screen logic is handled. Verify your LaunchScreen.storyboard in Xcode.

## 5. Build Configuration for Release (Signing/Provisioning) ⏳
- **Manual Step:** Open the project in Xcode:
  ```bash
  npx cap sync ios
  npx cap open ios
  ```
- Go to the **App** project target -> **Signing & Capabilities**.
- Check **"Automatically manage signing"**.
- Select your Apple Developer account as the **Team**.
- Ensure the **Bundle Identifier** matches what's registered in the Apple Developer Portal (e.g., `com.dvlli.jobhunter`).

## 6. App Store Guidelines Compliance ⚠️
To prevent rejection, ensure:
1. **Login Requirements:** If the app uses login, provide a test account/password in the "App Review Information" section of App Store Connect.
2. **Data Collection:** If using any analytics (e.g., Google Analytics, Mixpanel), fill out the **App Privacy** questionnaire in App Store Connect.
3. **App Tracking Transparency (ATT):** If using third-party ads or tracking, update your `Info.plist` with `NSUserTrackingUsageDescription` explaining *why* you track them.
4. **Camera/Photos:** If your app uploads resumes from photos, ensure `NSPhotoLibraryUsageDescription` and `NSCameraUsageDescription` are in `Info.plist`.

## 7. Submission (Archive & Upload)
- Select **Any iOS Device (arm64)** as the target device in Xcode.
- Go to **Product > Archive**.
- Once archived, the Organizer window will open. Click **Distribute App** and follow the prompts to upload it to App Store Connect.
- After processing, submit it for review!
