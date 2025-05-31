<script lang="ts">
    import { Card } from '$lib/components';
    import { Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';

    export let description: string;
    export let value: string | number = null;
</script>

<Card radius="s" padding="xs">
    <Layout.Stack gap="xxxs">
        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
            {description}
        </Typography.Caption>
        <slot>
            {#if value !== null && value !== undefined}
                <Typography.Text size="s" truncate color="--fgcolor-neutral-primary">
                    {value}
                </Typography.Text>
            {:else}
                <Skeleton variant="line" width="100%" height={19.5} />
            {/if}
        </slot>
    </Layout.Stack>
</Card>
