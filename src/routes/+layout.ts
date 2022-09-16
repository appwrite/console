import '@aw-labs/ui/src/_index.scss';
import 'tippy.js/dist/tippy.css';
import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('$lib/translations/en.json'));
register('de', () => import('$lib/translations/de.json'));

init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator()
});
