<script lang="ts">
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { loadEmailTemplate } from './+page.svelte';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { Id } from '$lib/components';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    const projectId = $page.params.project;

    let locale = 'en';
    let loading = false;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            loading = true;
        }, 1000);
        try {
            const template = await loadEmailTemplate(projectId, 'recovery', locale);
            emailTemplate.set(template);
            $baseEmailTemplate = { ...$emailTemplate };
            trackEvent(Submit.EmailChangeLocale, { locale, type: 'recovery' });
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

<div class="boxes-wrapper u-margin-block-start-16">
    <LocaleOptions on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate bind:loading>
        <Id value={'{{user}}'}>{'{{user}}'}</Id>
        <Id value={'{{project}}'}>{'{{project}}'}</Id>
        <Id value={'{{redirect}}'}>{'{{redirect}}'}</Id>
    </EmailTemplate>
</div>
