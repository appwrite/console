<script context="module" lang="ts">
    // your script goes here
</script>

<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { loadEmailTemplate } from './+page.svelte';
    import { page } from '$app/stores';
    import { emailTemplate } from './strote';

    export let localeCodes: Models.LocaleCode[];

    const projectId = $page.params.project;
    let locale = 'en-us';

    async function onLocaleChange() {
        let template = await loadEmailTemplate(projectId, 'invitation', locale);
        emailTemplate.set(template);
    }
</script>

<div class="box">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate />
</div>
