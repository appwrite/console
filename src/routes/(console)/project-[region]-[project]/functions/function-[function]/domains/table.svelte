<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconRefresh,
        IconTrash,
        IconDocumentText
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { columns } from './store';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { getApexDomain } from '$lib/helpers/tlds';
    import { isCloud } from '$lib/system';

    let {
        proxyRules,
        organizationDomains
    }: {
        proxyRules: Models.ProxyRuleList;
        organizationDomains?: Models.DomainsList;
    } = $props();

    let showDelete = $state(false);
    let showRetry = $state(false);
    let selectedProxyRule: Models.ProxyRule = $state(null);

    const proxyTarget = (proxy: Models.ProxyRule) => {
        return proxy?.redirectUrl
            ? 'Redirect to ' + proxy.redirectUrl
            : proxy?.deploymentVcsProviderBranch
              ? 'Deployed from ' + proxy.deploymentVcsProviderBranch
              : 'Active deployment';
    };

    function getDomainIdForRule(rule: Models.ProxyRule): string | null {
        if (!isCloud || !organizationDomains) return null;

        const apexDomain = getApexDomain(rule.domain);
        if (!apexDomain) return null;

        const domain = organizationDomains.domains.find(
            (d: Models.Domain) => d.domain === apexDomain
        );
        return domain?.$id || null;
    }

    function navigateToDnsRecords(rule: Models.ProxyRule) {
        const apexDomain = getApexDomain(rule.domain);
        const domain = organizationDomains.domains.find(
            (d: Models.Domain) => d.domain === apexDomain
        );

        trackEvent(Click.DomainDnsRecordsClick, {
            source: 'functions_domain_overview',
            domain: rule.domain,
            apexDomain
        });

        goto(`${base}/organization-${domain.teamId}/domains/domain-${domain.$id}`);
    }
</script>

<Table.Root columns={[...$columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each proxyRules.rules as proxyRule}
        <Table.Row.Base {root}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'domain'}
                        <Layout.Stack direction="row" gap="xs">
                            <Link
                                external
                                variant="quiet"
                                href={`${$regionalProtocol}${proxyRule.domain}`}>
                                <Typography.Text truncate>
                                    {proxyRule.domain}
                                </Typography.Text>
                            </Link>
                            {#if proxyRule.status === 'verifying'}
                                <Badge variant="secondary" content="Verifying" size="s" />
                            {:else if proxyRule.status !== 'verified'}
                                <Badge
                                    variant="secondary"
                                    type="warning"
                                    content="Verification failed"
                                    size="s" />
                            {/if}
                        </Layout.Stack>
                    {:else if column.id === 'target'}
                        {proxyTarget(proxyRule)}
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <Button
                            text
                            icon
                            on:click={(e) => {
                                e.preventDefault();
                                toggle(e);
                            }}>
                            <Icon icon={IconDotsHorizontal} size="s" />
                        </Button>

                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                {#if proxyRule.status !== 'verified' && proxyRule.status !== 'verifying'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={(e) => {
                                            selectedProxyRule = proxyRule;
                                            showRetry = true;
                                            toggle(e);
                                        }}>
                                        Retry
                                    </ActionMenu.Item.Button>
                                {/if}
                                {#if getDomainIdForRule(proxyRule)}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconDocumentText}
                                        on:click={(e) => {
                                            navigateToDnsRecords(proxyRule);
                                            toggle(e);
                                        }}>
                                        DNS Records
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        selectedProxyRule = proxyRule;
                                        showDelete = true;
                                        toggle(e);
                                        trackEvent(Click.DomainDeleteClick, {
                                            source: 'functions_domain_overview'
                                        });
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Layout.Stack>
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedProxyRule} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedProxyRule} />
{/if}
