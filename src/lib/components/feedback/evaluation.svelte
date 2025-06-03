<script lang="ts">
    import { Tag } from '@appwrite.io/pink-svelte';

    export let value: number = null;
</script>

<fieldset class="u-margin-block-start-8 u-min-width-0">
    <ol
        class="u-flex u-main-space-between u-overflow-x-auto u-gap-6"
        style="padding-block: 0.13rem">
        {#each Array(11) as _, i}
            <li>
                <Tag size="m" selected={value === i} on:click={() => (value = i)}>
                    {i}
                </Tag>
            </li>
        {/each}
    </ol>
    <div class="u-flex u-main-space-between u-margin-block-start-8 u-margin-block-end-24">
        <span class:u-color-text-gray={value === null}>Not at all likely</span>
        <span class:u-color-text-gray={value === null}>Extremely likely</span>
    </div>
</fieldset>
