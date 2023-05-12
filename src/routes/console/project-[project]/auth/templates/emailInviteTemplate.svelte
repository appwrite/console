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
    import { addNotification } from '$lib/stores/notifications';

    export let localeCodes: Models.LocaleCode[];

    const projectId = $page.params.project;
    let locale = 'en-us';
    let loading = false;
    let timeout: NodeJS.Timeout;

    async function onLocaleChange() {
        timeout = setTimeout(() => {
            loading = true;
        }, 1);
        try {
            const template = await loadEmailTemplate(projectId, 'invitation', locale);
            clearTimeout(timeout);
            emailTemplate.set(template);
        } catch (error) {
            clearTimeout(timeout);
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            loading = false;
        }
    }
</script>

<div class="boxes-wrapper u-margin-block-start-16">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate />
</div>
