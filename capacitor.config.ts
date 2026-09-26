import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor packages the built Vite site, including the local level images, into Android.
const config: CapacitorConfig = {
  appId: "com.hal2105.pixelpaintmilitary",
  appName: "Pixel Paint Military",
  webDir: "dist",
};

export default config;