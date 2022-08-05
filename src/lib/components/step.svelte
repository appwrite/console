<script lang="ts">
    import SubStep from './subStep.svelte';

    export let completed = false;
    export let current = false;
    export let currentSub = 0;
    export let step: { text: string; substeps?: { text: string }[] };
</script>

<li
    class="steps-item"
    class:is-done={completed}
    class:is-current={current}
    aria-label={` ${completed ? 'done' : current ? 'current' : ''} step`}>
    <div class="step-item-content">
        <span class="text">{step.text}</span>

        {#if step.substeps}
            <ul class="steps-sub">
                {#each step.substeps as step, index}
                    <SubStep current={currentSub === index} completed={index < currentSub}>
                        {step.text}
                    </SubStep>
                {/each}
            </ul>
        {/if}
    </div>
</li>
