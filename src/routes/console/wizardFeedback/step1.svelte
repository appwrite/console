<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import {
        selectedFeedback,
        feedbackData,
        feedbackOptions,
        feedback
    } from '$lib/stores/feedback';
    import { addNotification } from '$lib/stores/notifications';

    $: $selectedFeedback = feedbackOptions.find((option) => option.type === $feedback.type);

    async function beforeSubmit() {
        try {
            await feedback.submitFeedback(
                `feedback-${$feedback.type}`,
                $feedbackData.message,
                $feedbackData.name,
                $feedbackData.email
            );
            addNotification({
                type: 'success',
                message: 'Feedback submitted successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">{$selectedFeedback.title}</svelte:fragment>
    <svelte:fragment slot="subtitle">{$selectedFeedback.desc}</svelte:fragment>

    <svelte:component this={$selectedFeedback.component} />
</WizardStep>
