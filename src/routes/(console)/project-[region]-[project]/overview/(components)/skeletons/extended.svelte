<script lang="ts">
    import { fade } from 'svelte/transition';
    import { Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';

    let {
        loading = false,
        metricName,
        resourceMetric = null
    }: {
        loading: boolean;
        metricName: string;
        resourceMetric?:
            | string
            | {
                  value: string;
                  unit: string;
              }
            | null;
    } = $props();

    function isMetricObject(
        metric: typeof resourceMetric
    ): metric is { value: string; unit: string } {
        return metric !== null && typeof metric === 'object';
    }
</script>

<Layout.Stack gap="xxxs">
    <Typography.Title>
        <div class="overlay-container">
            {#if loading}
                <div class="overlay-item skeleton" transition:fade={{ duration: 300 }}>
                    <Skeleton height="100%" width="7.5rem" variant="line" style="opacity: 0.35" />
                </div>
            {:else if resourceMetric !== null}
                <div class="overlay-item" transition:fade={{ duration: 300 }}>
                    {#if isMetricObject(resourceMetric)}
                        {resourceMetric.value}
                        <span style:line-height="0%" style:font-size="var(--font-size-0)">
                            {resourceMetric.unit}
                        </span>
                    {:else}
                        {resourceMetric}
                    {/if}
                </div>
            {/if}
        </div>
    </Typography.Title>

    <Typography.Text>{metricName}</Typography.Text>
</Layout.Stack>

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
