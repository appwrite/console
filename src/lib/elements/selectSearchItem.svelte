<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';

    export let data: string[] = [];
</script>

<div class="u-flex u-cross-baseline u-gap-12">
    <span
        class="u-flex-basis-140 u-flex-shrink-0 u-text-start u-trim-start u-x-small u-color-text-gray u-font-code"
        data-private>
        <slot />
    </span>
    {#if data?.length}
        <span
            class="u-flex u-flex-1 u-trim-1 u-gap-4"
            use:tooltip={{
                content: data.map((e) => e ?? 'null').join(' | ')
            }}>
            {#each data as item, i}
                {#if i}
                    <span class="u-text-color-gray">|</span>
                {/if}
                <span class="text" style="white-space: nowrap" data-private>{item}</span>
            {/each}
        </span>
    {/if}
</div>
