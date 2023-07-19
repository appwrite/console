<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { isSupportOnline, supportData } from './wizard/support/store';
    import Step1 from './wizard/support/step1.svelte';
    import Step2 from './wizard/support/step2.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';

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
    stepsComponents.set(2, {
        label: 'Your message has been sent',
        component: Step2
    });
</script>

<Wizard title="Contact us" steps={stepsComponents} finalAction="Go back to My Console">
    <svelte:fragment slot="aside">
        <div class="common-section">
            <h4 class="body-text-1">Contact the Appwrite Team</h4>
            <p class="text">
                Found a bug? Need a hand? Just want to say hi? Contact the Appwrite team with your
                queries.
            </p>
        </div>
        <div class="common-section">
            <p class="text">Available: <b>Mon-Fri 09:00 - 17:00 UCT</b></p>
            <p class="text u-flex u-gap-4 u-cross-center">
                Currently: {#if isSupportOnline()}
                    <span class="u-success">
                        <span class="icon-check-circle" aria-hidden="true" />
                    </span>
                    <span class="u-success text">Online</span>
                {:else}
                    <span class="icon-x-circle" aria-hidden="true" />
                    <span class="text">Offline</span>{/if}
            </p>
        </div>
    </svelte:fragment>
</Wizard>
