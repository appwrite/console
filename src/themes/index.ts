import ThemeDark from './dark.json';
import ThemeLight from './light.json';
import ThemeDarkCloud from './dark-cloud.json';
import ThemeLightCloud from './light-cloud.json';
import darkStudio from './dark-studio.json';
import lightStudio from './light-studio.json';

export const ThemeDarkStudio = { ...ThemeDarkCloud, ...darkStudio };
export const ThemeLightStudio = { ...ThemeLightCloud, ...lightStudio };
export { ThemeDark, ThemeLight, ThemeDarkCloud, ThemeLightCloud };
