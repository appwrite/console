<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import { loadEmailTemplate } from './+page.svelte';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Layout, Card } from '@appwrite.io/pink-svelte';

    export let loading = false;

    let locale = 'en';
    let isUpdating = false;
    const projectId = page.params.project;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            isUpdating = true;
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
            isUpdating = false;
        }
    }
</script>

<Card.Base variant="secondary" padding="s">
    <Layout.Stack gap="l">
        <LocaleOptions on:change={onLocaleChange} bind:value={locale} />
        <EmailTemplate {loading} {isUpdating}>
            <Id value={'{{user}}'}>{'{{user}}'}</Id>
            <Id value={'{{project}}'}>{'{{project}}'}</Id>
            <Id value={'{{redirect}}'}>{'{{redirect}}'}</Id>
        </EmailTemplate>
    </Layout.Stack>
</Card.Base>
