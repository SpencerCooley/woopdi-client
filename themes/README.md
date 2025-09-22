# Themes

This folder contains theme configurations that can be imported and used in the application.

## Usage

Import themes directly from this folder:

```tsx
import { mintCreamTheme, mintCreamDarkTheme } from '../themes';

// Use in your theme context or component
const theme = createTheme(mintCreamTheme);
```

## Available Themes

- `mintCreamTheme` - Light theme with mint green primary and cream backgrounds
- `mintCreamDarkTheme` - Dark theme with mint green primary and softer gray backgrounds

## Adding New Themes

1. Create a new file (e.g., `myTheme.ts`)
2. Export your theme configuration
3. Update the `index.ts` file to export your new theme
