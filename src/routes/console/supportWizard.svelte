<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { isSupportOnline, supportData } from './wizard/support/store';
    import Step1 from './wizard/support/step1.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { user } from '$lib/stores/user';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { VARS } from '$lib/system';

    onDestroy(() => {
        $supportData = {
            message: null,
            category: 'general',
            file: null
        };
    });

    const stepsComponents: WizardStepsType = new Map();

    stepsComponents.set(1, {
        label: 'How can we help you?',
        component: Step1
    });

    async function handleSubmit() {
        const response = await fetch(`https://${VARS.GROWTH_ENDPOINT}/v1/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: 'support',
                email: $user.email,
                firstName: $user?.name ?? '',
                message: $supportData.message,
                tags: ['cloud'],
                customFields: [{ id: '41612', value: $supportData.category }]
            })
        });
        trackEvent(Submit.SupportTicket);
        if (response.status !== 200) {
            trackError(new Error(response.status.toString()), Submit.SupportTicket);
            addNotification({
                message: 'There was an error submitting your feedback',
                type: 'error'
            });
        } else {
            addNotification({
                message: 'Your feedback was submitted successfully',
                type: 'success'
            });
        }
        resetData();
        wizard.hide();
    }

    function resetData() {
        $supportData = {
            message: null,
            category: 'general',
            file: null
        };
    }
</script>

<Wizard
    title="Contact us"
    steps={stepsComponents}
    finalAction="Submit"
    on:finish={handleSubmit}
    on:exit={resetData}>
    <svelte:fragment slot="aside">
        <h4 class="body-text-1 u-bold">Contact the Appwrite Team</h4>
        <p class="text u-margin-block-start-16">
            If you found a bug or have questions, please reach out to the Appwrite team. We try to
            respond to all messages within our office hours.
        </p>
        <p class="text u-margin-block-start-32">Available: <b>Mon-Fri 09:00 - 17:00 UCT</b></p>
        <div class="u-flex u-gap-4 u-cross-center">
            <span>Currently:</span>
            {#if isSupportOnline()}
                <span class="icon-check-circle u-color-text-success" aria-hidden="true" />
                <span class="u-color-text-success text">Online</span>
            {:else}
                <span class="icon-x-circle" aria-hidden="true" />
                <span class="text">Offline</span>
            {/if}
        </div>
    </svelte:fragment>
</Wizard>
