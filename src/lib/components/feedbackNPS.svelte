<script lang="ts">
    import { Form, FormList, InputTextarea, Button } from '$lib/elements/forms';
    import { feedback } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import Evaluation from './evaluation.svelte';

    export let show = false;

    let value: number = null;
    let message: string;
    async function handleSubmit() {
        try {
            await feedback.submitFeedback(undefined, undefined, message, ['npm'], [{ value }]);
            console.log(value, message);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<section class="drop-section">
    <header class="u-flex u-main-space-between u-gap-16">
        <h4 class="body-text-1"><slot name="title" /></h4>
        <button
            type="button"
            class="x-button u-margin-inline-start-auto"
            aria-label="Close Modal"
            title="Close Modal"
            on:click={() => (show = false)}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>
    <div class="u-margin-block-start-8 u-line-height-1-5"><slot /></div>

    <Form on:submit={handleSubmit}>
        <Evaluation bind:value>
            How likely are you to recommend Appwrite to a friend or colleague?
        </Evaluation>
        {#if value}
            <FormList>
                <InputTextarea
                    id="feedback"
                    placeholder="Your message here"
                    showLabel={false}
                    label="Feedback"
                    bind:value={message} />
            </FormList>
        {/if}
        <div class="u-flex u-main-end u-gap-16 u-margin-block-start-24">
            <Button text on:click={() => (show = false)}>No thanks</Button>
            <Button disabled={!value} secondary submit>Submit</Button>
        </div>
    </Form>
</section>
