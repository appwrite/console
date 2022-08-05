<script lang="ts">
    import Step from './step.svelte';

    export let steps: { text: string; substeps?: { text: string }[] }[];
    export let currentStep = 0;
    export let currentSub = 0;
</script>

<ol class="steps">
    {#if steps}
        {#each steps as step, index}
            <Step
                bind:currentSub
                current={currentStep === index}
                completed={index < currentStep}
                {step} />
        {/each}
    {/if}
</ol>
