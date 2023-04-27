<script lang="ts">
    import SmsTemplate from './smsTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { loadSmsTemplate } from './+page.svelte';
    import { smsTemplate } from './strote';

    export let localeCodes: Models.LocaleCode[];

    const projectId = $page.params.project;
    let locale = 'en-us';

    async function onLocaleChange() {
        let template = await loadSmsTemplate(projectId, 'verification', locale);
        smsTemplate.set(template);
    }
</script>

<div class="box">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <SmsTemplate />
</div>
