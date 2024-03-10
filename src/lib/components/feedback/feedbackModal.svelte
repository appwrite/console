<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputTextarea } from '$lib/elements/forms';
    import { feedback } from '$lib/stores/feedback';
    import { addNotification } from '$lib/stores/notifications';
    import { user } from '$lib/stores/user';

    export let show = false;
    let message: string = null;
    let error: string = null;

    const handleSubmit = async () => {
        try {
            feedback.submitFeedback('billing', message, $user?.name ?? '', $user.email);
            show = false;
            addNotification({
                type: 'success',
                message: `Your message has been submitted successfully. We will get back to you soon.`
            });
            trackEvent(Submit.ContactUs, {
                source: 'rbi_mandate_alert'
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ContactUs);
        }
    };
</script>

<Modal title="Contact us" bind:show onSubmit={handleSubmit} headerDivider={false} bind:error>
    <FormList>
        <InputTextarea
            id="feedback"
            placeholder="Enter a message"
            label="Message"
            required
            bind:value={message} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!message}>Submit</Button>
    </svelte:fragment>
</Modal>
