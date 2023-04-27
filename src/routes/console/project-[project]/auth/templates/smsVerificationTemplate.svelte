<script lang="ts">
    import { afterUpdate } from 'svelte';
    import SmsTemplate from './smsTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';

    let locale = 'en-us';
    export let localeCodes: Models.LocaleCode[];
    export let loadSmsTemplate: (type: string, locale: string) => Promise<void> | void;
    export let saveSmsTemplate: (type: string, data: any) => Promise<void> | void;

    export let template: SmsTemplate;

    afterUpdate(() => {
        template = template;
    });

    function onLocaleChange() {
        console.log('locale changed, loading template');
        loadSmsTemplate('verification', locale);
    }
</script>

<div class="box">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <SmsTemplate
        message={template?.message}
        onSubmit={(data) => saveSmsTemplate('verification', { ...data, locale })} />
</div>
