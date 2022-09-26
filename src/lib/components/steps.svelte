<script lang="ts">
    import Step from './step.svelte';

    export let steps: {
        text: string;
        substeps?: {
            text: string;
        }[];
    }[];
    export let currentStep = 1;
    export let currentSub = 1;
</script>

<ol class="steps">
    {#if steps}
        {#each steps as step, index}
            {@const stepNumber = index + 1}
            <Step
                bind:currentSub
                current={currentStep === stepNumber}
                completed={stepNumber < currentStep}
                {step} />
        {/each}
    {/if}
</ol>
