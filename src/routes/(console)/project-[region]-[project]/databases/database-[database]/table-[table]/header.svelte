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

    const databaseId = $derived(page.params.database);

    const tableId = $derived(page.params.table);

    const path = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${tableId}`
    );

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

    const link = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}`
    );
</script>

<Cover expanded collapsed={!$expandTabs} blocksize={$expandTabs ? '152px' : '90px'} animate={true}>
    <svelte:fragment slot="header">
        <Layout.Stack direction="row" alignContent="center" alignItems="center" inline>
            <AnimatedTitle href={link} collapsed={!$expandTabs}>
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

<style lang="scss">
    .tabs-container {
        opacity: 1;
        transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);

        &.collapsed {
            opacity: 0;

            & :global([role='tab']) {
                cursor: default;
            }
        }
    }
</style>
