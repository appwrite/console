<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';
    import { loadEmailTemplate } from './+page.svelte';
    import { emailTemplate } from './strote';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';

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
            const template = await loadEmailTemplate(projectId, 'verification', locale);
            clearTimeout(timeout);
            emailTemplate.set(template);
        } catch (error) {
            clearTimeout(timeout);
            console.log(error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="box u-margin-block-start-16" style:--box-border-radius="var(--border-radius-small)">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    {#if loading}
        <div
            class="u-width-full-100 u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32">
            <div class="loader" />
            <p class="text">Loading template...</p>
        </div>
    {/if}
    <div class:u-opacity-0={loading} style={loading ? 'pointer-events: none' : ''}>
        <EmailTemplate>
            <Id value={'{{name}}'}>{'{{name}}'}</Id>
            <Id value={'{{project}}'}>{'{{project}}'}</Id>
        </EmailTemplate>
    </div>
</div>
