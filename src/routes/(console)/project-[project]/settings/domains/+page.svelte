<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import Container from '$lib/layout/container.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { app } from '$lib/stores/app';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import Table from './table.svelte';
    import { ResponsiveContainerHeader } from '$lib/layout';

    let { data } = $props();
</script>

<Container>
    <ResponsiveContainerHeader hasSearch hideView searchPlaceholder="Search by domain">
        <Button
            href={`${base}/project-${page.params.project}/settings/domains/add-domain`}
            on:click={() => {
                trackEvent(Click.DomainCreateClick, {
                    source: 'settings_domain_overview'
                });
            }}>
            <Icon icon={IconPlus} size="s" />
            Add domain
        </Button>
    </ResponsiveContainerHeader>
    {#if data.rules.total}
        <Table domains={data.rules} />

        <PaginationWithLimit
            name="Domains"
            limit={data.limit}
            offset={data.offset}
            total={data.rules.total} />
    {:else if data?.search}
        <EmptySearch hidePages bind:search={data.search} target="domains" hidePagination>
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        data.search = '';
                    }}>Clear search</Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/domains/empty-domain-dark.svg`
                    : `${base}/images/domains/empty-domain-light.svg`}
                title="Use a custom domain for your API"
                description="Connect your own domain to Appwrite, so your API is accessible from a custom URL instead of the default Appwrite endpoint.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="#/"
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="add domain">Documentation</Button>

                    <Button
                        secondary
                        href={`${base}/project-${page.params.project}/settings/domains/add-domain`}
                        size="s">
                        Add domain
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
