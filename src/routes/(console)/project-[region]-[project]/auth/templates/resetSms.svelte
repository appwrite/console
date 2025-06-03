<!-- <script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import type { SmsTemplateLocale, SmsTemplateType } from '@appwrite.io/console';
    import { project } from '../../store';
    import { loadSmsTemplate } from './+page.svelte';
    import { baseSmsTemplate, smsTemplate } from './store';

    export let show = false;

    let error: string;

    async function reset() {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            await sdk.forConsole.projects.deleteSmsTemplate(
                $project.$id,
                $smsTemplate.type as SmsTemplateType,
                $smsTemplate.locale as SmsTemplateLocale
            );

            $smsTemplate = await loadSmsTemplate(
                $project.$id,
                $smsTemplate.type,
                $smsTemplate.locale
            );
            $baseSmsTemplate = { ...$smsTemplate };
            trackEvent(Submit.SmsResetTemplate, {
                locale: $smsTemplate.locale,
                type: $smsTemplate.type
            });
            show = false;
        } catch (e) {
            trackError(e, Submit.SmsResetTemplate);
            error = e.message;
        }
    }
</script>

<Modal onSubmit={reset} {error} bind:show>
    <svelte:fragment slot="title">Reset SMS template?</svelte:fragment>
    <p class="text">
        Are you sure you want to reset the SMS template?
        <b>Default values will be set in all inputs.</b>
    </p>

    <svelte:fragment slot="footer">
        <Button text secondary on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Reset</Button>
    </svelte:fragment>
</Modal> -->
