<script lang="ts">
    import { ProgressBar, type ProgressbarData } from '$lib/components/progressbar';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let currentValue: string | undefined = undefined;
    export let currentUnit: string | undefined = undefined;
    export let maxValue: string | undefined = undefined;
    export let maxUnit: string | undefined = undefined;
    export let progressValue: number;
    export let progressMax: number | undefined = undefined;
    export let showBar = true;
    export let progressBarData: Array<ProgressbarData> = [];

    $: progress = Math.round((progressValue / progressMax) * 100);
</script>

<section class="progress-bar">
    {#if currentValue !== undefined && currentUnit !== undefined && progress !== undefined}
        <div class="u-flex u-flex-vertical">
            <Layout.Stack direction="row" alignItems="center">
                <Layout.Stack gap="s" direction="row" alignItems="baseline">
                    <Typography.Title>
                        {currentValue}
                    </Typography.Title>
                    <Typography.Text>{currentUnit}</Typography.Text>
                    {#if maxValue !== undefined}
                        <Typography.Text color="--fgcolor-neutral-tertiary">
                            {maxValue}
                            {maxUnit ? maxUnit : ''}
                        </Typography.Text>
                    {/if}
                </Layout.Stack>
                {#if progressMax !== undefined}
                    <div>
                        <Badge variant="secondary" size="xs" content={`${progress}%`} />
                    </div>
                {/if}
            </Layout.Stack>
        </div>
    {/if}
    {#if showBar && progressBarData.length > 0}
        <ProgressBar maxSize={progressMax} data={progressBarData} />
    {/if}
</section>
