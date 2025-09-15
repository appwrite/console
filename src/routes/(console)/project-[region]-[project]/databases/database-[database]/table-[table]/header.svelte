<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import AnimatedTitle from '$lib/layout/animatedTitle.svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import { expandTabs, table } from './store';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { preferences } from '$lib/stores/preferences';

    const databaseId = $derived(page.params.database);

    const tableId = $derived(page.params.table);

    const computedPath = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${tableId}`
    );
    let { path: _path, back: _back } = $props();
    const path = $derived(_path ?? computedPath);

    const tabs = $derived(
        [
            {
                href: path,
                title: 'Rows',
                event: 'rows',
                hasChildren: true
            },
            {
                href: `${path}/columns`,
                title: 'Columns',
                event: 'columns'
            },
            {
                href: `${path}/indexes`,
                title: 'Indexes',
                event: 'indexes'
            },
            {
                href: `${path}/activity`,
                title: 'Activity',
                event: 'activity',
                hasChildren: true
            },
            {
                href: `${path}/usage`,
                title: 'Usage',
                event: 'usage',
                hasChildren: true
            },
            {
                href: `${path}/settings`,
                title: 'Settings',
                event: 'settings',
                disabled: !$canWriteTables
            }
        ].filter((tab) => !tab.disabled)
    );

    const computedBack = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}`
    );
    const back = $derived(_back ?? computedBack);

    const nonSheetPages = $derived.by(() => {
        const endings = ['table-[table]', 'table-[table]/columns', 'table-[table]/indexes'];
        const isSpreadsheetPage = endings.some((end) => page.route.id?.endsWith(end));
        return !isSpreadsheetPage;
    });

    $effect(() => {
        if (nonSheetPages) expandTabs.set(true);
        else {
            expandTabs.set(preferences.getKey('tableHeaderExpanded', true));
        }
    });
</script>

<div class:nonSheetPages>
    <Cover animate expanded collapsed={!$expandTabs} blocksize={$expandTabs ? '152px' : '90px'}>
        <svelte:fragment slot="header">
            <Layout.Stack direction="row" alignContent="center" alignItems="center" inline>
                <AnimatedTitle href={back} collapsed={!$expandTabs}>
                    {$table?.name}
                </AnimatedTitle>

                {#key $table?.$id}
                    <Id value={$table?.$id} tooltipPlacement={$expandTabs ? undefined : 'right'}
                        >{$table?.$id}</Id>
                {/key}
            </Layout.Stack>
        </svelte:fragment>

        <div class="tabs-container" class:collapsed={!$expandTabs}>
            <Tabs>
                {#each tabs as tab}
                    <Tab
                        href={tab.href}
                        selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                        event={tab.event}>
                        {tab.title}
                    </Tab>
                {/each}
            </Tabs>
        </div>
    </Cover>
</div>

<style lang="scss">
    .nonSheetPages :global(.cover-container) {
        @media (min-width: 1440px) {
            padding-inline: 7px !important;
        }

        @media (min-width: 1728px) {
            padding-inline: 10.25rem !important;
        }
    }

    .tabs-container {
        opacity: 1;
        transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);

        &.collapsed {
            opacity: 0;
            pointer-events: none;

            & :global([role='tab']) {
                cursor: default;
            }
        }
    }
</style>
