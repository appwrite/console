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
    import { EmailTemplateLocale, EmailTemplateType } from '@appwrite.io/console';

    export let loading = false;

    let isUpdating = false;
    let locale = EmailTemplateLocale.En;
    const projectId = page.params.project;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            isUpdating = true;
        }, 1000);
        try {
            const template = await loadEmailTemplate(
                projectId,
                EmailTemplateType.Mfachallenge,
                locale
            );
            emailTemplate.set(template);
            $baseEmailTemplate = { ...$emailTemplate };
            trackEvent(Submit.EmailChangeLocale, { locale, type: EmailTemplateType.Mfachallenge });
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
    <Layout.Stack>
        <LocaleOptions on:change={onLocaleChange} bind:value={locale} />
        <EmailTemplate {loading} {isUpdating}>
            <Id value={'{{user}}'}>{'{{user}}'}</Id>
            <Id value={'{{project}}'}>{'{{project}}'}</Id>
            <Id value={'{{otp}}'}>{'{{otp}}'}</Id>

            <!-- START: for client info -->
            <Id value={'{{agentClient}}'}>{'{{agentClient}}'}</Id>
            <Id value={'{{agentDevice}}'}>{'{{agentDevice}}'}</Id>
            <Id value={'{{agentOs}}'}>{'{{agentOs}}'}</Id>
            <!-- END: for client info -->
        </EmailTemplate>
    </Layout.Stack>
</Card.Base>
