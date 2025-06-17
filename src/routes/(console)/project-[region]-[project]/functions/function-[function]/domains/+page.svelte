<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import Container from '$lib/layout/container.svelte';
    import type { Models } from '@appwrite.io/console';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { app } from '$lib/stores/app';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import Table from './table.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    let { data } = $props();

    let showDelete = $state(false);
    let showRetry = $state(false);
    let selectedProxyRule: Models.ProxyRule = null;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery placeholder="Search domain" />
        <Button
            href={getProjectRoute(`/functions/function-${page.params.function}/domains/add-domain`)}
            on:click={() => {
                trackEvent(Click.DomainCreateClick, {
                    source: 'functions_domain_overview'
                });
            }}>
            <Icon icon={IconPlus} size="s" />
            Add domain
        </Button>
    </Layout.Stack>
    {#if data.proxyRules.total}
        <Table proxyRules={data.proxyRules} />

        <PaginationWithLimit
            name="Domains"
            limit={data.limit}
            offset={data.offset}
            total={data.proxyRules.total} />
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
                title="Use a custom domain for your function"
                description="Make your function easier to access and integrate by assigning it a custom domain.">
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
                        href={getProjectRoute(
                            `/functions/function-${page.params.function}/domains/add-domain`
                        )}
                        size="s">
                        Add domain
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedProxyRule} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedProxyRule} />
{/if}
