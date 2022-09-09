<script lang="ts">
    import { Form, FormList, InputTextarea, Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    export let show = false;

    const dispatch = createEventDispatcher();

    let feedback: string;
    const handleSubmit = () => {
        dispatch('feedback', feedback);
    };
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

    <Form on:action={handleSubmit}>
        <FormList>
            <InputTextarea
                id="feedback"
                placeholder="Your message here"
                showLabel={false}
                label="Feedback"
                bind:value={feedback} />
        </FormList>

        <div class="u-flex u-main-end u-gap-16 u-margin-block-start-24">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button disabled={!feedback} secondary submit>Submit</Button>
        </div>
    </Form>
</section>
