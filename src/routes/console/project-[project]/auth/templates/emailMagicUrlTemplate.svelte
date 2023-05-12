<script lang="ts">
    import { loadEmailTemplate } from './+page.svelte';
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { emailTemplate } from './strote';
    import { page } from '$app/stores';
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
            const template = await loadEmailTemplate(projectId, 'magicSession', locale);
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
