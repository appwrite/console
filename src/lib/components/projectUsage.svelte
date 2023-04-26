<script lang="ts">
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Card, Heading, ProgressBar } from '.';
    export let title: string;
    export let data: {
        name: string;
        icon: string;
        unit: string;
        max: number;
        used: number;
        status: null | 'warning' | 'error';
    }[];
</script>

<Card isTile>
    <div class="u-flex u-main-space-between">
        <Heading tag="h2" size="7">{title}</Heading>
        {#if data.some((d) => d.status === 'warning' || d.status === 'error')}
            {@const highestUsage = data.reduce(
                (acc, curr) => {
                    if (curr.status === 'error') return curr;
                    if (curr.status === 'warning' && acc.status !== 'error') return curr;
                    return acc;
                },
                { status: null, used: 0, max: 0 }
            )}
            <div class="grid-item-1-start-end">
                <Pill
                    warning={highestUsage.status === 'warning'}
                    danger={highestUsage.status === 'error'}>
                    {Math.round((highestUsage.used / highestUsage.max) * 100)}% of limit used
                </Pill>
            </div>
        {/if}
    </div>
    <ul class="u-flex-vertical u-gap-24 u-margin-block-start-32">
        {#each data as usage}
            <li>
                <ProgressBar
                    name={usage.name}
                    max={usage.max}
                    used={usage.used}
                    unit={usage.unit}
                    icon={usage.icon}
                    status={usage.status} />
            </li>
        {/each}
    </ul>
    <div class="u-flex u-main-end u-margin-block-start-8">
        <Button text noMargin href="https://#">More details</Button>
    </div>
</Card>
