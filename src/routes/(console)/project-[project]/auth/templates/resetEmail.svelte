<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { EmailTemplateLocale, EmailTemplateType } from '@appwrite.io/console';
    import { project } from '../../store';
    import { loadEmailTemplate } from './+page.svelte';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { Dialog, Layout, Alert } from '@appwrite.io/pink-svelte';

    export let show = false;

    let error: string;

    async function reset() {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            await sdk.forConsole.projects.deleteEmailTemplate(
                $project.$id,
                $emailTemplate.type as EmailTemplateType,
                $emailTemplate.locale as EmailTemplateLocale
            );
            $emailTemplate = await loadEmailTemplate(
                $project.$id,
                $emailTemplate.type,
                $emailTemplate.locale
            );
            $baseEmailTemplate = { ...$emailTemplate };
            addNotification({
                type: 'success',
                message: 'Email template has been reset'
            });
            trackEvent(Submit.EmailResetTemplate, {
                locale: $emailTemplate.locale,
                type: $emailTemplate.type
            });

            show = false;
        } catch (e) {
            trackError(e, Submit.EmailResetTemplate);
            error = e.message;
        }
    }
</script>

<Dialog bind:open={show} title="Reset changes">
    <svelte:fragment slot="title">Reset email template?</svelte:fragment>

    <Layout.Stack>
        <p class="text">
            Are you sure you want to reset the email template?
            <b>Default values will be set in all inputs.</b>
        </p>

        {#if error}
            <Alert.Inline status="warning">{error}</Alert.Inline>
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text secondary on:click={() => (show = false)}>Cancel</Button>
            <Button on:click={reset}>Reset</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
