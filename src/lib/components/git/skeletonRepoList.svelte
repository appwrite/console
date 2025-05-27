<script lang="ts">
    import { Layout, Table, Skeleton } from '@appwrite.io/pink-svelte';
</script>

<Table.Root columns={1} let:root>
    {#each Array(4) as _}
        <Table.Row.Base {root}>
            <Table.Cell {root}>
                <Layout.Stack direction="row" alignItems="center">
                    <Skeleton variant="circle" width={24} />

                    <Layout.Stack gap="s" direction="row" alignItems="center">
                        <Skeleton variant="line" width={200} height={20} />
                    </Layout.Stack>
                    <Skeleton variant="line" width={76} height={32} />
                </Layout.Stack>
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>
