<script lang="ts">
    import {
        Form,
        FormList,
        InputTextarea,
        Button,
        InputText,
        InputEmail
    } from '$lib/elements/forms';
    import { feedback } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';

    export let show = false;

    let message: string;
    let name: string;
    let email: string;
    async function handleSubmit() {
        try {
            await feedback.submitFeedback(
                undefined,
                email,
                message,
                ['general'],
                [{ firstname: name }]
            );
            show = false;
        } catch (error) {
            show = false;
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<section class="drop-section">
    <header class="u-flex u-main-space-between u-gap-16">
        <h4 class="body-text-1">How can we improve?</h4>
        <button
            type="button"
            class="x-button u-margin-inline-start-auto"
            aria-label="Close Modal"
            title="Close Modal"
            on:click={() => (show = false)}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>
    <div class="u-margin-block-start-8 u-line-height-1-5">
        Your feedback is important to us. Please be honest and tell us what you think.
    </div>

    <Form on:submit={handleSubmit}>
        <FormList>
            <InputText
                label="name"
                id="name"
                bind:value={name}
                placeholder="Enter name"
                showLabel={false} />
            <InputEmail
                label="email"
                id="email"
                bind:value={email}
                placeholder="Enter email"
                showLabel={false} />
            <InputTextarea
                id="feedback"
                placeholder="Your message here"
                showLabel={false}
                label="Feedback"
                required
                bind:value={message} />
        </FormList>

        <div class="u-flex u-main-end u-gap-16 u-margin-block-start-24">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button secondary submit>Submit</Button>
        </div>
    </Form>
</section>
