<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Header } from '$database/(entity)';
    import { expandTabs, table } from './store';
    import { canWriteTables } from '$lib/stores/roles';
    import { preferences } from '$lib/stores/preferences';

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
    <Header {tabs} entity={$table} parentHref={link} bind:expanded={$expandTabs} />
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
</style>
