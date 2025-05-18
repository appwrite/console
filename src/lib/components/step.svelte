<script lang="ts">
    export let completed = false;
    export let current = false;
    export let currentSub = 0;
    export let isSub = false;
    export let step: { text: string; disabled?: boolean; substeps?: { text: string }[] };
</script>

<li
    class:steps-item={!isSub}
    class:steps-sub-item={isSub}
    class:u-opacity-50={step.disabled}
    style:cursor={completed ? 'pointer' : 'default'}
    aria-label={`${completed ? 'done' : current ? 'current' : ''} step`}>
    <button
        type="button"
        on:click|preventDefault
        disabled={!completed}
        style={`cursor: ${completed ? 'pointer' : 'default'};`}>
        {#if isSub}
            <span class="text">{step.text}</span>
        {:else}
            <div class="steps-item-wrapper">
                {#if completed}
                    <div class="bullet is-done">
                        <span class="icon-check" aria-hidden="true"></span>
                    </div>
                {:else}
                    <div class="bullet" class:is-current={current}></div>
                {/if}
                <div class="steps-item-content">
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
            </div>
        {/if}
    </button>
</li>
