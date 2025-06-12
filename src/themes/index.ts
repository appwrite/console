export { default as ThemeDark } from './dark.json';
export { default as ThemeLight } from './light.json';

export { default as ThemeDarkCloud } from './dark-cloud.json';
export { default as ThemeLightCloud } from './light-cloud.json';

import { default as StudioLightOverride } from './light-studio.json';
import { default as ThemeLightBase } from './light.json';

import { default as StudioDarkOverride } from './dark-studio.json';
import { default as ThemeDarkBase } from './dark.json';

export const ThemeLightStudio = { ...ThemeLightBase, ...StudioLightOverride };
export const ThemeDarkStudio = { ...ThemeDarkBase, ...StudioDarkOverride };
