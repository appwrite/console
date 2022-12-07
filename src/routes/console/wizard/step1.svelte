<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { supportData } from './store';
    import Light from '$lib/images/support/support-wizard-light.svg';
    import Dark from '$lib/images/support/support-wizard-dark.svg';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    async function beforeSubmit() {
        try {
            console.log($supportData.message);
            trackEvent('submit_support_ticket');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">How can we help you?</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Please describe your request in detail. If applicable, include steps for reproduction of any
        in-app issues. We try to respond to all messages within our office hours (Mon-Fri 09:00 -
        17:00 UCT). Expect to receive an email from us soon!
    </svelte:fragment>
    <FormList>
        <InputTextarea
            label="Leave a message"
            id="message"
            placeholder="Type here..."
            bind:value={$supportData.message}
            required />
    </FormList>
</WizardStep>
