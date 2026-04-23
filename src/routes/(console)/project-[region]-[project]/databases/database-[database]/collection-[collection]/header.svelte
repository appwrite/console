<script lang="ts">
    import { page } from '$app/state';
    import { canWriteTables } from '$lib/stores/roles';
    import { resolveRoute } from '$lib/stores/navigation';

    import { type Entity, Header } from '$database/(entity)';

    const path = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]',
            page.params
        )
    );

    const collection = $derived(page.data.collection) as Entity;

    const tabs = $derived(
        [
            {
                href: path,
                title: 'Documents',
                event: 'documents',
                hasChildren: true
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
</script>

{#if collection}
    <Header {tabs} entity={collection} />
{/if}
