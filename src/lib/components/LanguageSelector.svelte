<script lang="ts">
    import { locale } from '../../i18n/i18n-svelte';

    let languages = [
        { lng: 'select language', value: window.localStorage.getItem('getUserlanguage') },
        { lng: 'english', value: 'en' },
        { lng: 'german', value: 'de' },
        { lng: 'italian', value: 'it' }
    ];

    let selected;

    const onChangeValue = () => {
        $locale && localStorage.setItem('lang', selected.value);
        window.location.reload();
    };
</script>

<select bind:value={selected} on:change={onChangeValue}>
    {#each languages as language}
        <option value={language}>
            {language.lng}
        </option>
    {/each}
</select>
