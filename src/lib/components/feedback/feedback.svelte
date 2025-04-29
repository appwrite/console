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
    import { page } from '$app/state';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '$routes/(console)/project-[project]/store';

    $: $selectedFeedback = feedbackOptions.find((option) => option.type === $feedback.type);

    export let isMobile: boolean = false;

    async function submit() {
        try {
            await feedback.submitFeedback(
                `feedback-${$feedback.type}`,
                $feedbackData.message,
                page.url.href,
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

<section class="u-flex u-flex-vertical u-gap-24" class:drop-section={!isMobile}>
    <header class="u-flex u-flex-vertical u-gap-4">
        {#if !isMobile}
            <Typography.Title size="s">Feedback</Typography.Title>
        {/if}
        {#if $selectedFeedback.desc}
            <Typography.Text variant="m-400" size="m">{$selectedFeedback.desc}</Typography.Text>
        {/if}
    </header>

    <Form onSubmit={submit}>
        <svelte:component this={$selectedFeedback.component} />

        <div
            class:u-flex-vertical={isMobile}
            class="u-flex u-main-end u-gap-16 u-margin-block-start-24">
            <Button text on:click={() => feedback.toggleFeedback()}>Cancel</Button>
            <Button secondary submit>Submit</Button>
        </div>
    </Form>
</section>

<style lang="scss">
    .drop-section {
        padding: 1rem;

        @media (max-width: 768px) {
            padding: 0;
        }
    }
</style>
