<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Step from './step.svelte';

    export let steps: {
        text: string;
        optional: boolean;
        disabled?: boolean;
        substeps?: {
            text: string;
        }[];
    }[];
    export let currentStep = 1;
    export let currentSub = 1;

    const dispatch = createEventDispatcher();

    $: firstOptional = steps.findIndex((step) => step.optional);
</script>

<ol class="steps">
    {#if steps}
        {#each steps as step, index}
            {@const stepNumber = index + 1}
            {#if firstOptional === index}
                {step.disabled}
                <li class="steps-item">
                    <h3 class="eyebrow-heading-3">OPTIONAL</h3>
                </li>
            {/if}
            <Step
                on:click={() => dispatch('step', stepNumber)}
                bind:currentSub
                current={currentStep === stepNumber}
                completed={stepNumber < currentStep}
                {step} />
        {/each}
    {/if}
</ol>
