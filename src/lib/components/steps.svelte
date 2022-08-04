<script lang="ts">
    import Step from './step.svelte';

    export let steps: string[];
    export let currentStep = 0;
</script>

<ol class="steps">
    {#each steps as step, index}
        <Step current={currentStep === index} completed={index < currentStep}>
            {step}
        </Step>
    {/each}
</ol>
