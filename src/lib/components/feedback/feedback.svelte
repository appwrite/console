<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import {
        feedback,
        selectedFeedback,
        feedbackOptions,
        feedbackData
    } from '$lib/stores/feedback';
    import { user } from '$lib/stores/user';
    import { organization } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import { project } from '$routes/(console)/project-[region]-[project]/store';

    $: $selectedFeedback = feedbackOptions.find((option) => option.type === $feedback.type);

    async function submit() {
        try {
            await feedback.submitFeedback(
                `feedback-${$feedback.type}`,
                $feedbackData.message,
                $page.url.href,
                $user.name,
                $user.email,
                $organization?.billingPlan,
                $feedbackData.value,
                $organization?.$id,
                $project?.$id,
                $user.$id
            );
            addNotification({
                type: 'success',
                message: 'Thank you for your feedback'
            });
            feedback.toggleFeedback();
            feedbackData.reset();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<section class="drop-section u-padding-24">
    <header class="u-flex u-main-space-between u-gap-16">
        <h4 class="label u-bold" style:font-size="var(--font-size-1)">{$selectedFeedback.title}</h4>
        <button
            type="button"
            class="button is-text is-only-icon u-margin-inline-start-auto"
            style="--button-size:1.5rem;"
            aria-label="Close feedback"
            title="Close feedback"
            on:click={() => feedback.toggleFeedback()}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>
    <div class="u-margin-block-start-8 u-line-height-1-5">
        {$selectedFeedback.desc}
    </div>

    <Form onSubmit={submit}>
        <svelte:component this={$selectedFeedback.component} />
        <div class="u-flex u-main-end u-gap-16 u-margin-block-start-24">
            <Button text on:click={() => feedback.toggleFeedback()}>Cancel</Button>
            <Button secondary submit>Submit</Button>
        </div>
    </Form>
</section>
