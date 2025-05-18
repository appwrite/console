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

    export let data;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery placeholder="Search domain" />
        <Button
            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains/add-domain`}
            on:click={() => {
                trackEvent(Click.DomainCreateClick, {
                    source: 'sites_domain_overview'
                });
            }}>
            <Icon icon={IconPlus} size="s" />
            Add domain
        </Button>
    </Layout.Stack>

    {#if data.domains.total}
        <Table domains={data.domains} />

        <PaginationWithLimit
            name="Domains"
            limit={data.limit}
            offset={data.offset}
            total={data.domains.total} />
    {:else if data?.search}
        <EmptySearch hidePages bind:search={data.search} target="domains" hidePagination>
            <Button
                secondary
                on:click={() => {
                    data.search = '';
                }}>Clear search</Button>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/domains/empty-domain-dark.svg`
                    : `${base}/images/domains/empty-domain-light.svg`}
                title="Use a custom domain for your site"
                description="Give your site a unique identity and make it easier to find by by assigning it a custom domain.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/sites/domains#add-a-custom-domain"
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="add domain">Documentation</Button>

                    <Button
                        secondary
                        href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains/add-domain`}
                        size="s">
                        Add domain
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
