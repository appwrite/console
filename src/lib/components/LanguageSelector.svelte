<script lang="ts">
    import { locale, setLocale } from '$lib/i18n/i18n-svelte';
    import type { Locales } from '$lib/i18n/i18n-types';
    import { locales } from '$lib/i18n/i18n-util';
    import { loadLocaleAsync } from '$lib/i18n/i18n-util.async';

    const lang = [
        { value: 'de', lng: 'German' },
        { value: 'en', lng: 'English' },
        { value: 'it', lng: 'Italian' }
    ];

    const chooseLocale = async (locale: Locales) => {
        await loadLocaleAsync(locale);
        setLocale(locale);
    };

    let localeToSelect: Locales;
    $: localeToSelect && chooseLocale(localeToSelect);

    $: $locale && localStorage.setItem('lang', $locale);
</script>

<select bind:value={localeToSelect}>
    <option value="" selected disabled>language selector</option>
    {#each locales as locale, i}
        <option value={locale}>{locale === lang[i].value ? lang[i].lng : locale}</option>
    {/each}
</select>
