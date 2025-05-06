<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import { loadEmailTemplate } from './+page.svelte';
    import { page } from '$app/state';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Id } from '$lib/components';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Layout, Card } from '@appwrite.io/pink-svelte';

    const projectId = page.params.project;
    let locale = 'en';
    let loading = false;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            loading = true;
        }, 1000);
        try {
            const template = await loadEmailTemplate(projectId, 'sessionalert', locale);
            emailTemplate.set(template);
            $baseEmailTemplate = { ...$emailTemplate };
            trackEvent(Submit.EmailChangeLocale, { locale, type: 'sessionalert' });
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

<Card.Base variant="secondary" padding="s">
    <Layout.Stack>
        <LocaleOptions on:change={onLocaleChange} bind:value={locale} />
        <EmailTemplate bind:loading>
            <Id value={'{{user}}'}>{'{{user}}'}</Id>
            <Id value={'{{project}}'}>{'{{project}}'}</Id>
            <Id value={'{{device}}'}>{'{{device}}'}</Id>
            <Id value={'{{ipAddress'}>{'{{ipAddress}}'}</Id>
            <Id value={'{{country'}>{'{{country}}'}</Id>
        </EmailTemplate>
    </Layout.Stack>
</Card.Base>
