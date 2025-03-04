<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import { loadEmailTemplate } from './+page.svelte';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Layout } from '@appwrite.io/pink-svelte';

    const projectId = $page.params.project;

    let locale = 'en';
    let loading = false;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            loading = true;
        }, 1000);
        try {
            const template = await loadEmailTemplate(projectId, 'verification', locale);
            emailTemplate.set(template);
            $baseEmailTemplate = { ...$emailTemplate };
            trackEvent(Submit.EmailChangeLocale, { locale, type: 'verification' });
        } catch (error) {
            trackError(error, Submit.EmailChangeLocale);
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            clearTimeout(timeout);
            loading = false;
        }
    }
</script>

<Layout.Stack>
    <LocaleOptions on:change={onLocaleChange} bind:value={locale} />
    <EmailTemplate bind:loading>
        <Id value={'{{user}}'}>{'{{user}}'}</Id>
        <Id value={'{{project}}'}>{'{{project}}'}</Id>
        <Id value={'{{redirect}}'}>{'{{redirect}}'}</Id>
    </EmailTemplate>
</Layout.Stack>
