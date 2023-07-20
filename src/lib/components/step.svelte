<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let completed = false;
    export let current = false;
    export let currentSub = 0;
    export let isSub = false;
    export let step: { text: string; disabled?: boolean; substeps?: { text: string }[] };
</script>

<li
    on:click|preventDefault
    on:keyup|self={clickOnEnter}
    class:steps-item={!isSub}
    class:steps-sub-item={isSub}
    class:u-opacity-50={step.disabled}
    style={`cursor: ${completed ? 'pointer' : 'default'};`}
    aria-label={`${completed ? 'done' : current ? 'current' : ''} step`}>
    {#if isSub}
        <span class="text">{step.text}</span>
    {:else}
        <div class="steps-item-wrapper">
            {#if completed}
                <div class="bullet is-done">
                    <span class="icon-check" aria-hidden="true" />
                </div>
            {:else}
                <div class="bullet" class:is-current={current} />
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
</li>
