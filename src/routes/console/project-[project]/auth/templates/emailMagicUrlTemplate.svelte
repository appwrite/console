<script lang="ts">
    import { loadEmailTemplate } from './+page.svelte';
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { baseEmailTemplate, emailTemplate } from './strote';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { Id } from '$lib/components';

    export let localeCodes: Models.LocaleCode[];
    const projectId = $page.params.project;

    let locale = 'en';
    let loading = false;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            loading = true;
        }, 1000);
        try {
            const template = await loadEmailTemplate(projectId, 'magicSession', locale);
            clearTimeout(timeout);
            emailTemplate.set(template);
            $baseEmailTemplate = { ...$emailTemplate };
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
    <EmailTemplate bind:loading>
        <Id value={'{{team}}'}>{'{{team}}'}</Id>
        <Id value={'{{user}}'}>{'{{user}}'}</Id>
        <Id value={'{{project}}'}>{'{{project}}'}</Id>
        <Id value={'{{redirect}}'}>{'{{redirect}}'}</Id>
    </EmailTemplate>
</div>
