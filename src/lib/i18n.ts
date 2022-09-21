import i18next from 'i18next';
import type { i18n } from 'i18next';
import { writable, type Readable, type Writable } from 'svelte/store';
import resourcesToBackend from 'i18next-resources-to-backend';

export const supportedLanguages = ['de', 'en'];

interface TranslationService {
    i18n: Readable<i18n>;
}

export const isLoading = writable(true);

export class I18NextTranslationStore implements TranslationService {
    public i18n: Readable<i18n>;
    public isLoading: Writable<boolean>;

    constructor(i18n: i18n) {
        this.i18n = this.createInstance(i18n);
        this.isLoading = this.createLoadingInstance(i18n);
    }

    private createInstance(i18n: i18n): Writable<i18n> {
        const i18nWritable = writable(i18n);

        i18n.on('initialized', () => {
            i18nWritable.set(i18n);
        });
        i18n.on('loaded', () => {
            i18nWritable.set(i18n);
        });
        i18n.on('added', () => i18nWritable.set(i18n));
        i18n.on('languageChanged', () => {
            i18nWritable.set(i18n);
        });
        return i18nWritable;
    }

    private createLoadingInstance(i18n: i18n): Writable<boolean> {
        // if loaded resources are empty || {}, set loading to true
        i18n.on('loaded', (resources) => {
            Object.keys(resources).length !== 0 && isLoading.set(false);
        });

        // if resources failed loading, set loading to true
        i18n.on('failedLoading', () => {
            isLoading.set(true);
        });

        return isLoading;
    }
}

export const createI18nStore = () => {
    i18next
        .use(
            resourcesToBackend((language, _namespace, callback) => {
                import(`$lib/translations/${language}.json`)
                    .then((resources) => {
                        callback(null, resources);
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            })
        )
        .init({
            lng: 'en',
            fallbackLng: 'en'
        });
    const i18nStore = new I18NextTranslationStore(i18next);

    return i18nStore.i18n;
};

export const _ = createI18nStore();
