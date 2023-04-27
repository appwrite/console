<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { loadEmailTemplate } from './+page.svelte';
    import { emailTemplate } from './strote';
    import { page } from '$app/stores';

    export let localeCodes: Models.LocaleCode[];
    const projectId = $page.params.project;

    let locale = 'en-us';

    async function onLocaleChange() {
        let template = await loadEmailTemplate(projectId, 'verification', locale);
        emailTemplate.set(template);
    }
</script>

<div class="box common-section">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate />
</div>
