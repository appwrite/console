<script lang="ts">
    import { page } from '$app/state';
    import { Cover } from '$lib/layout';
    import { AnimatedTitle } from '$lib/layout';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { type Entity, useTerminology } from '$database/(entity)';

    interface EntityTab {
        href: string;
        title: string;
        event: string;
        hasChildren?: boolean;
    }

    let {
        entity,
        parentHref,
        tabs,
        expanded = $bindable(true)
    }: {
        entity: Entity;
        parentHref: string;
        tabs: EntityTab[];
        expanded?: boolean;
    } = $props();

    const terminology = $derived(useTerminology(page));
    const entityType = $derived(terminology.entity.lower.singular);
    const basePath = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/${entityType}-${page.params[entityType]}`
    );
</script>

<Cover animate {expanded} collapsed={!expanded} blocksize={expanded ? '152px' : '90px'}>
    <svelte:fragment slot="header">
        <Layout.Stack direction="row" alignContent="center" alignItems="center" inline>
            <AnimatedTitle href={parentHref} collapsed={!expanded}>
                {entity.name}
            </AnimatedTitle>

            {#key entity.$id}
                <Id value={entity.$id} tooltipPlacement={expanded ? undefined : 'right'}>
                    {entity.$id}
                </Id>
            {/key}
        </Layout.Stack>
    </svelte:fragment>

    <div class="tabs-container" class:collapsed={!expanded}>
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

<style lang="scss">
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
