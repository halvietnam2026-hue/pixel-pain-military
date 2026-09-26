# How to get PixelPaintMilitary.apk

The **Download** button in Arena exports the project's source files as a ZIP. It cannot compile an Android application. Renaming that ZIP to `.apk` does not make it installable.

## Easiest: build online and download the actual APK

1. Download the project ZIP from Arena and **extract it**.
2. Create a GitHub repository (public if you want anyone to download the APK). Upload all extracted project files to the repository root, including the hidden `.github/workflows/android-apk.yml` file. Don't upload the ZIP as a single file. Or push the folder with Git.
3. Open **Actions** > **Build Android APK** > **Run workflow** on the repository's default branch. If Actions isn't enabled, enable it in repository settings first.
4. When the workflow succeeds, open **Releases** and download **PixelPaintMilitary.apk**. This is a direct `.apk` file, not an Actions artifact ZIP.
5. To share it with others, use `https://github.com/OWNER/REPO/releases/latest/download/PixelPaintMilitary.apk` after replacing `OWNER/REPO` with your GitHub username and repository. The repository must be public for a publicly accessible link.

The workflow packages the contents of `dist/` with Capacitor, compiles it with Android SDK and Gradle, and publishes the resulting debug-signed APK as a GitHub Release asset. It does not upload an APK to Arena.

## Build on your Windows PC instead

Install Node.js **22+** and Android Studio with the Android 16 (API 36) SDK. Extract the ZIP, open PowerShell in its folder, and run:

```powershell
npm install
npm run build
npx cap add android
npx cap sync android
node scripts/apply-android-icon.mjs
cd android
.\gradlew.bat assembleDebug
```

Your installable file is `android/app/build/outputs/apk/debug/app-debug.apk`. Rename **this APK only**, if desired, and send it via Google Drive or Discord. For subsequent web code changes, return to the root and run `npm run build`, `npx cap sync android`, then the Gradle build again. Run `npx cap add android` only the first time.

## Important

- The automated build is a **debug APK** for testing and sharing directly, not a Google Play release. Google Play needs a signed release **AAB**.
- GitHub runners generate a new debug signing key on each build. If a new APK cannot install over the old one, uninstall the previous test version first (this erases the app's saved coins/progress). For updates that preserve installed data, build and sign future releases with your own consistent keystore.
- The home-screen icon is `public/icon.png` (the pixel soldier). The GitHub workflow copies it over Capacitor's default launcher icons before compiling the APK.
- The five image files, background, and fonts are bundled for offline play. The music is generated in the app; it does not need an external MP3 file.
- This setup does **not** create an APK inside Arena. Someone must run the GitHub workflow or local Android build before there is a real `.apk` to download.