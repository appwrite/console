<script lang="ts">
    import { page } from '$app/state';
    import { Cover } from '$lib/layout';
    import { AnimatedTitle } from '$lib/layout';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { type Entity, useTerminology } from '$database/(entity)';
    import { resolveRoute, withPath } from '$lib/stores/navigation';

    import { preferences } from '$lib/stores/preferences';
    import { expandTabs } from '$database/table-[table]/store';

    interface EntityTab {
        href: string;
        title: string;
        event: string;
        hasChildren?: boolean;
    }

    let {
        entity,
        parentHref,
        tabs
    }: {
        entity: Entity;
        parentHref: string;
        tabs: EntityTab[];
    } = $props();

    /**
     * `useTerminology` is needed because -
     * 1. headers are initialized **before** content,
     * 2. `getTerminologies` isn't available at that point.
     */
    const terminology = useTerminology(page);

    const basePath = $derived.by(() => {
        const entityType = terminology.entity.lower.singular;
        return withPath(
            resolveRoute(
                `/(console)/project-[region]-[project]/databases/database-[database]`,
                page.params
            ),
            `${entityType}-${entity.$id}`
        );
    });

    const nonSheetPages = $derived.by(() => {
        const field = terminology.field.lower.plural;
        const entityType = terminology.entity.lower.singular;

        const resourceSeg = `${entityType}-[${entityType}]`;

        const endings = [resourceSeg, `${resourceSeg}/${field}`, `${resourceSeg}/indexes`];
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
                <AnimatedTitle href={parentHref} collapsed={!$expandTabs}>
                    {entity?.name}
                </AnimatedTitle>

                {#key entity?.$id}
                    <Id value={entity?.$id} tooltipPlacement={$expandTabs ? undefined : 'right'}>
                        {entity?.$id}
                    </Id>
                {/key}
            </Layout.Stack>
        </svelte:fragment>

        <div class="tabs-container" class:collapsed={!$expandTabs}>
            <Tabs>
                {#each tabs as tab}
                    <Tab
                        href={tab.href}
                        selected={isTabSelected(tab, page.url.pathname, basePath, tabs)}
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
