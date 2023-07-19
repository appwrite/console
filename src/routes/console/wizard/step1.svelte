<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { supportData } from './store';
    import Light from '$lib/images/support/support-wizard-light.svg';
    import Dark from '$lib/images/support/support-wizard-dark.svg';
    import { Pill } from '$lib/elements';
    // import { Collapsible, CollapsibleItem } from '$lib/components';
    import { user } from '$lib/stores/user';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    // let files: FileList;

    async function beforeSubmit() {
        const response = await fetch('https://growth.appwrite.io/v1/support', {
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
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">How can we help you?</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Please describe your request in detail. If applicable, include steps for reproduction of any
        in-app issues. We try to respond to all messages within our office hours (Mon-Fri 09:00 -
        17:00 UCT). Expect to receive an email from us soon!
    </svelte:fragment>
    <div class="common-section">
        <p class="label">Choose a topic</p>
        <div class="u-flex u-gap-8 u-margin-block-start-8">
            {#each ['general', 'billing', 'technical'] as topic}
                <Pill
                    button
                    selected={$supportData.category === topic}
                    on:click={() => {
                        $supportData.category = topic;
                    }}>{topic}</Pill>
            {/each}
        </div>
    </div>
    <div class="common-section">
        <FormList>
            <InputTextarea
                label="Tell us a bit more"
                id="message"
                placeholder="Type here..."
                bind:value={$supportData.message}
                required />
        </FormList>
    </div>
    <!-- <div class="common-section">
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Want to attach a file? (optional)</svelte:fragment>
                <svelte:fragment slot="subtitle">
                    A picture is worth a thousand words.
                </svelte:fragment>
                <InputFile bind:files label="Attach a file" />
            </CollapsibleItem>
        </Collapsible>
    </div> -->
</WizardStep>
