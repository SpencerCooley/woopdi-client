import { useState, useEffect } from 'react';
import { useTheme } from '../context/theme-context';
import logoService, { LogoConfig } from '../services/logoService';

export function useLogo() {
  const [logoConfig, setLogoConfig] = useState<LogoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useTheme();

  useEffect(() => {
    const loadLogoConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = await logoService.getLogoConfig();
        setLogoConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logo configuration');
        console.error('Error loading logo config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLogoConfig();
  }, []);

  const currentLogoUrl = logoConfig
    ? logoService.getCurrentLogoUrl(mode)
    : logoService.getCurrentLogoUrl(mode);

  const hasLogo = currentLogoUrl !== null && currentLogoUrl !== '';

  const refreshLogoConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await logoService.refreshLogoConfig();
      setLogoConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh logo configuration');
      console.error('Error refreshing logo config:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    logoConfig,
    currentLogoUrl,
    hasLogo,
    loading,
    error,
    refreshLogoConfig,
    hasError: !!error
  };
}

export default useLogo;
