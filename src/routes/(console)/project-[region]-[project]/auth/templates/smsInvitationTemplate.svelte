<!-- <script lang="ts">
    import SmsTemplate from './smsTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import { baseSmsTemplate, smsTemplate } from './store';
    import { page } from '$app/state';
    import { loadSmsTemplate } from './+page.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Id } from '$lib/components';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    const projectId = page.params.project;
    let locale = 'en';
    let loading = false;

    async function onLocaleChange() {
        const timeout = setTimeout(() => {
            loading = true;
        }, 1000);
        try {
            const template = await loadSmsTemplate(projectId, 'invitation', locale);
            smsTemplate.set(template);
            $baseSmsTemplate = { ...$smsTemplate };
            trackEvent(Submit.SmsChangeLocale, { locale, type: 'invitation' });
        } catch (error) {
            trackError(error, Submit.SmsChangeLocale);
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
    <LocaleOptions on:change={onLocaleChange} bind:value={locale} />
    <SmsTemplate bind:loading>
        <Id value={'{{team}}'}>{'{{team}}'}</Id>
        <Id value={'{{user}}'}>{'{{user}}'}</Id>
        <Id value={'{{project}}'}>{'{{project}}'}</Id>
        <Id value={'{{redirect}}'}>{'{{redirect}}'}</Id>
    </SmsTemplate>
</div> -->
