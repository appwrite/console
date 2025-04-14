<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import {
        selectedFeedback,
        feedbackData,
        feedbackOptions,
        feedback
    } from '$lib/stores/feedback';
    import { user } from '$lib/stores/user';
    import { organization } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import { project } from '$routes/(console)/project-[region]-[project]/store';

    $: $selectedFeedback = feedbackOptions.find((option) => option.type === $feedback.type);

    async function beforeSubmit() {
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
