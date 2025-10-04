<script lang="ts">
    import { fade } from 'svelte/transition';
    import { Skeleton, Typography } from '@appwrite.io/pink-svelte';

    let {
        value,
        resource,
        unit = null,
        loading = false
    }: {
        loading: boolean;
        resource: string;
        unit?: string;
        value: string | number | boolean;
    } = $props();
</script>

<Typography.Title>
    <div class="overlay-container">
        {#if loading}
            <div class="overlay-item skeleton" transition:fade={{ duration: 300 }}>
                <Skeleton
                    height="100%"
                    width="5rem"
                    variant="line"
                    style="opacity: 0.35; margin-bottom: 1rem; margin-inline-start: -2px" />
            </div>
        {:else}
            <div class="overlay-item" transition:fade={{ duration: 300, delay: 150 }}>
                {value}
                {#if unit}
                    <span style:line-height="0%" style:font-size="var(--font-size-0)">
                        {unit}
                    </span>
                {/if}
            </div>
        {/if}
    </div>
</Typography.Title>

<Typography.Text>
    {resource}
</Typography.Text>

<style lang="scss">
    .overlay-container {
        display: grid;
        min-height: 1lh;
        align-items: stretch;
        grid-template-areas: 'content';
    }

    .overlay-item {
        grid-area: content;

        &.skeleton {
            display: flex;
            align-items: center;
        }
    }
</style>
