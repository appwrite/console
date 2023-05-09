<script lang="ts">
    import { loadEmailTemplate } from './+page.svelte';
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { emailTemplate } from './strote';
    import { page } from '$app/stores';

    export let localeCodes: Models.LocaleCode[];
    const projectId = $page.params.project;

    let locale = 'en-us';

    async function onLocaleChange() {
        let template = await loadEmailTemplate(projectId, 'magicSession', locale);
        emailTemplate.set(template);
    }
</script>

<div class="boxes-wrapper u-margin-block-start-16">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate />
</div>
