import { createContext, useContext } from 'react';
import { createTheme, ThemeOptions } from '@mui/material/styles';

// Import themes from themes folder
import { mintCreamTheme, mintCreamDarkTheme } from '../themes';
import { midnightGlowTheme, midnightGlowDarkTheme } from '../themes';
import { playfulCandyTheme, playfulCandyDarkTheme } from '../themes';
import { hackerBuzzTheme, hackerBuzzDarkTheme } from '../themes';
import { luxeartTheme, luxeartDarkTheme } from '../themes';
import { retroGamifyTheme, retroGamifyDarkTheme } from '../themes';
import { scientificAcademiaTheme, scientificAcademiaDarkTheme } from '../themes';


// Export themes for easy access
export { mintCreamTheme, mintCreamDarkTheme } from '../themes';

// Simple theme selector - just import the theme you want to use
export const themeSettings = (mode: 'light' | 'dark'): ThemeOptions => {
  // Return the appropriate theme based on mode
  return mode === 'light' ? hackerBuzzTheme : hackerBuzzDarkTheme;
};

export type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
