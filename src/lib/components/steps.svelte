<script lang="ts">
    import Step from './step.svelte';

    export let steps: {
        text: string;
        optional: boolean;
        substeps?: {
            text: string;
        }[];
    }[];
    export let currentStep = 1;
    export let currentSub = 1;

    $: firstOptional = steps.findIndex((step) => step.optional);

    //TODO: remove inline styling
</script>

<ol class="steps">
    {#if steps}
        {#each steps as step, index}
            {@const stepNumber = index + 1}
            {#if firstOptional === index}
                <span style="margin-block: 1.5rem;">OPTIONAL</span>
            {/if}
            <Step
                bind:currentSub
                current={currentStep === stepNumber}
                completed={stepNumber < currentStep}
                {step} />
        {/each}
    {/if}
</ol>
