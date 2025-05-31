<script lang="ts">
    import { Layout, Skeleton } from '@appwrite.io/pink-svelte';

    export let count: number = 5;
    export let textArea: boolean = true;
</script>

<Layout.Stack inline gap="xl">
    {#each Array.from({ length: count }) as _}
        <Layout.Stack inline gap="xs">
            <Skeleton variant="line" width="25%" height={18} />
            <Skeleton variant="line" width="100%" height={35} />
        </Layout.Stack>
    {/each}

    {#if textArea}
        <Layout.Stack inline gap="xs">
            <Skeleton variant="line" width="25%" height={18} />
            <Skeleton variant="line" width="100%" height={125} />
        </Layout.Stack>
    {/if}
</Layout.Stack>
