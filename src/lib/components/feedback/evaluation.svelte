<script lang="ts">
    export let value: number = null;
</script>

<fieldset class="u-margin-block-start-8 u-min-width-0">
    <legend class="label is-required u-margin-0 u-line-height-1-5 u-bold">
        <slot />
    </legend>
    <ol
        class="u-flex u-main-space-between u-margin-block-start-16 u-overflow-x-auto"
        style="padding-block: 0.13rem">
        {#each Array(11) as _, i}
            <li>
                <input
                    on:click={() => (value = i)}
                    type="radio"
                    name="recommend"
                    class="radio-button"
                    data-text={i}
                    checked={value === i} />
            </li>
        {/each}
    </ol>
    <div class="u-flex u-main-space-between u-margin-block-start-8">
        <span class:u-color-text-gray={value === null}>Not at all likely</span>
        <span class:u-color-text-gray={value === null}>Extremely likely</span>
    </div>
</fieldset>
