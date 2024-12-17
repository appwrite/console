<script lang="ts">
    import { Card } from '$lib/components';
    import { Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';
    export let description: string;
    export let value: string = null;
</script>

<Card radius="s" padding="xs" isTile>
    <Layout.Stack gap="xxs">
        {#if value !== null && value !== undefined}
            <Typography.Title size="s">{value}</Typography.Title>
        {:else}
            <Skeleton variant="line" width={100} height={26} />
        {/if}
        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
            {description}
        </Typography.Text>
    </Layout.Stack>
</Card>
