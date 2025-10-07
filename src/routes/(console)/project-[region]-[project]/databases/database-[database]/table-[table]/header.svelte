<script lang="ts">
    import { page } from '$app/state';
    import { Header } from '$database/(entity)';
    import { expandTabs, table } from './store';
    import { canWriteTables } from '$lib/stores/roles';
    import { preferences } from '$lib/stores/preferences';
    import { resolveRoute } from '$lib/stores/navigation';

    const path = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
            page.params
        )
    );

    const link = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        )
    );

    const nonSheetPages = $derived.by(() => {
        const endings = ['table-[table]', 'table-[table]/columns', 'table-[table]/indexes'];
        const isSpreadsheetPage = endings.some((end) => page.route.id?.endsWith(end));
        return !isSpreadsheetPage;
    });

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
