<script lang="ts">
    export let completed = false;
    export let current = false;
    export let currentSub = 0;
    export let isSub = false;
    export let step: { text: string; substeps?: { text: string }[] };

    //TODO: remove inline styling
</script>

<li
    on:click|preventDefault
    class:steps-item={!isSub}
    class:steps-sub-item={isSub}
    style={`cursor: ${completed ? 'pointer' : 'default'};`}
    aria-label={`${completed ? 'done' : current ? 'current' : ''} step`}>
    {#if isSub}
        <span class="text">{step.text}</span>
    {:else}
        {#if completed}
            <div class="bullet is-done">
                <span class="icon-check" aria-hidden="true" />
            </div>
        {:else}
            <div class="bullet" class:is-current={current} />
        {/if}
        <div class="step-item-content">
            <span class="text">{step.text}</span>
            {#if step?.substeps}
                <ul class="steps-sub">
                    {#each step.substeps as subStep, index}
                        <svelte:self
                            isSub={true}
                            step={subStep}
                            current={currentSub === index}
                            completed={index < currentSub} />
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</li>
