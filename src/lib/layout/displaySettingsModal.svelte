<script lang="ts">
    import { page } from '$app/state';
    import { Confirm, ViewToggle } from '$lib/components';
    import ColumnSelector from '$lib/components/columnSelector.svelte';
    import type { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { preferences } from '$lib/stores/preferences';
    import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
    import { Button, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import type { Writable } from 'svelte/store';

    let {
        show = $bindable(false),
        hideView = false,
        view = $bindable(),
        columns,
        hideColumns = false,
        isCustomCollection = false
    }: {
        show?: boolean;
        hideView?: boolean;
        view?: View;
        columns?: Writable<Column[]>;
        hideColumns?: boolean;
        isCustomCollection?: boolean;
    } = $props();
</script>

<Confirm title="Adjustments" bind:open={show} canDelete={false}>
    <Layout.Stack>
        {#if !hideView}
            <Layout.Stack gap="xs">
                <Typography.Text>Layout</Typography.Text>
                <ViewToggle bind:view />
            </Layout.Stack>
        {/if}
        {#if !hideColumns && $columns?.length}
            <Layout.Stack gap="xs">
                <Typography.Text>Columns</Typography.Text>
                <ColumnSelector {columns} {isCustomCollection}>
                    {#snippet children(toggle, selectedColumnsNumber)}
                        <Button.Button
                            size="s"
                            variant="secondary"
                            badge={selectedColumnsNumber.toString()}
                            on:click={toggle}>
                            Columns
                            <Icon slot="start" icon={IconViewBoards} />
                        </Button.Button>
                    {/snippet}
                </ColumnSelector>
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Confirm>
