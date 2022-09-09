<script lang="ts">
    import { Form, FormList, InputTextarea, Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import Card from './card.svelte';

    export let show = false;

    const dispatch = createEventDispatcher();

    let feedback: string;
    const handleSubmit = () => {
        dispatch('feedback', feedback);
    };
</script>

<Form on:action={handleSubmit}>
    <Card>
        <section class="u-flex common-section">
            <h3 class="body-text-1"><slot name="title" /></h3>
            <button
                type="button"
                class="x-button u-margin-inline-start-auto"
                aria-label="Close Modal"
                title="Close Modal"
                on:click={() => (show = false)}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        </section>
        <div class="common-section"><slot /></div>
        <FormList>
            <InputTextarea
                id="feedback"
                placeholder="Your message here"
                showLabel={false}
                label="Feedback"
                bind:value={feedback} />
        </FormList>

        <div class="u-flex u-main-end u-gap-12">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button disabled={!feedback} secondary submit>Submit</Button>
        </div>
    </Card>
</Form>
