import { userService, SystemSettings } from './api';

export interface LogoConfig {
  lightMode: string | null;
  darkMode: string | null;
}

const FALLBACK_LOGOS: LogoConfig = {
  lightMode: null,
  darkMode: null
};

class LogoService {
  private logoConfig: LogoConfig | null = null;
  private loading: boolean = false;
  private error: string | null = null;

  async getLogoConfig(): Promise<LogoConfig> {
    // Return cached config if available
    if (this.logoConfig) {
      return this.logoConfig;
    }

    // Prevent multiple simultaneous requests
    if (this.loading) {
      // Wait for the current request to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.logoConfig || FALLBACK_LOGOS;
    }

    this.loading = true;
    this.error = null;

    try {
      const settings: SystemSettings = await userService.getSystemSettings();

      this.logoConfig = {
        lightMode: settings.branding_logo_light_mode || FALLBACK_LOGOS.lightMode,
        darkMode: settings.branding_logo_dark_mode || FALLBACK_LOGOS.darkMode
      };
    } catch (err) {
      console.error('Failed to fetch logo configuration:', err);
      this.error = err instanceof Error ? err.message : 'Unknown error';
      this.logoConfig = FALLBACK_LOGOS;
    } finally {
      this.loading = false;
    }

    return this.logoConfig;
  }

  getCurrentLogoUrl(themeMode: 'light' | 'dark'): string | null {
    if (!this.logoConfig) {
      // Return fallback based on theme mode
      return themeMode === 'light' ? FALLBACK_LOGOS.lightMode : FALLBACK_LOGOS.darkMode;
    }

    return themeMode === 'light' ? this.logoConfig.lightMode : this.logoConfig.darkMode;
  }

  async refreshLogoConfig(): Promise<LogoConfig> {
    // Clear cache to force refresh
    this.logoConfig = null;
    return this.getLogoConfig();
  }

  hasError(): boolean {
    return this.error !== null;
  }

  getError(): string | null {
    return this.error;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

// Export a singleton instance
export const logoService = new LogoService();
export default logoService;
