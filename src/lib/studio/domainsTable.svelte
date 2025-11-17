<script lang="ts">
    import { onMount } from 'svelte';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { sdk, RuleType, DeploymentResourceType, RuleTrigger } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconExternalLink,
        IconPlus,
        IconRefresh,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Popover,
        Table,
        Typography,
        Skeleton,
        Divider
    } from '@appwrite.io/pink-svelte';
    import { resolve } from '$app/paths';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
    import { goto } from '$app/navigation';
    import DeleteDomainModal from '$routes/(console)/project-[region]-[project]/sites/site-[site]/domains/deleteDomainModal.svelte';
    import RetryDomainModal from '$routes/(console)/project-[region]-[project]/sites/site-[site]/domains/retryDomainModal.svelte';

    let {
        siteId,
        region,
        projectId
    }: {
        siteId: string;
        region: string;
        projectId: string;
    } = $props();

    let loading = $state(true);
    let showRetry = $state(false);
    let showDelete = $state(false);

    let selectedProxyRule: Models.ProxyRule = $state(null);
    let proxyRules = $state<Models.ProxyRuleList | null>(null);

    async function loadDomains() {
        loading = true;
        try {
            proxyRules = await sdk.forProject(region, projectId).proxy.listRules({
                queries: [
                    Query.equal('type', [RuleType.DEPLOYMENT, RuleType.REDIRECT]),
                    Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
                    Query.equal('deploymentResourceId', siteId),
                    Query.equal('trigger', RuleTrigger.MANUAL),
                    Query.limit(100)
                ]
            });
        } catch (error) {
            console.error('Failed to load domains:', error);
        } finally {
            loading = false;
        }
    }

    let previousDeleteState = $state(false);
    let previousRetryState = $state(false);

    onMount(loadDomains);

    $effect(() => {
        const wasDeleteOpen = previousDeleteState && !showDelete;
        const wasRetryOpen = previousRetryState && !showRetry;

        if (wasDeleteOpen || wasRetryOpen) {
            loadDomains();
        }

        previousDeleteState = showDelete;
        previousDeleteState = showDelete;
        previousRetryState = showRetry;
    });

    const addDomainUrl = $derived.by(() => {
        const baseUrl = resolve(
            '/(console)/project-[region]-[project]/sites/site-[site]/domains/add-domain',
            {
                region,
                project: projectId,
                site: siteId
            }
        );
        return `${baseUrl}?types=false`;
    });
</script>

<Table.Root columns={[{ id: 'domain' }, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        <Table.Header.Cell column="domain" {root}>Domain</Table.Header.Cell>
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#if loading}
        {#each Array(2) as _}
            <Table.Row.Base {root}>
                <Table.Cell column="domain" {root}>
                    <Layout.Stack direction="row" gap="xs" alignItems="center">
                        <Skeleton variant="line" width={200} height={20} />
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell column="actions" {root}>
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Skeleton variant="line" width={24} height={12} />
                    </Layout.Stack>
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    {:else if proxyRules && proxyRules.total > 0}
        {#each proxyRules.rules as rule}
            <Table.Row.Base {root}>
                <Table.Cell column="domain" {root}>
                    <Layout.Stack direction="row" gap="xs" alignItems="center">
                        <Link external variant="quiet" href={`${$regionalProtocol}${rule.domain}`}>
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                <Typography.Text truncate>
                                    {rule.domain}
                                </Typography.Text>
                                <Icon size="xs" icon={IconExternalLink} />
                            </Layout.Stack>
                        </Link>

                        {#if rule.status === 'verifying'}
                            <Badge variant="secondary" content="Verifying" size="s" />
                        {:else if rule.status !== 'verified'}
                            <Badge
                                size="s"
                                type="warning"
                                variant="secondary"
                                content="Verification failed" />
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell column="actions" {root}>
                    <Popover let:toggle padding="none">
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
                            {@render domainActions(rule, toggle)}
                        </svelte:fragment>
                    </Popover>
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    {/if}
</Table.Root>

<Layout.Stack style="width: min-content;">
    <Button compact on:onclick={async () => await goto(addDomainUrl)}>
        <Icon icon={IconPlus} size="s" />
        Add domain
    </Button>
</Layout.Stack>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedProxyRule} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedProxyRule} />
{/if}

{#snippet domainActions(rule: Models.ProxyRule, toggle: () => void)}
    <ActionMenu.Root>
        <ActionMenu.Item.Anchor href={`${$regionalProtocol}${rule.domain}`} external>
            Open domain
        </ActionMenu.Item.Anchor>
        {#if rule.status !== 'verified' && rule.status !== 'verifying'}
            <ActionMenu.Item.Button
                leadingIcon={IconRefresh}
                on:click={() => {
                    selectedProxyRule = rule;
                    showRetry = true;
                    toggle();
                }}>
                Retry
            </ActionMenu.Item.Button>

            <div class="action-menu-divider">
                <Divider />
            </div>
        {/if}

        <ActionMenu.Item.Button
            status="danger"
            leadingIcon={IconTrash}
            on:click={() => {
                selectedProxyRule = rule;
                showDelete = true;
                toggle();
                trackEvent(Click.DomainDeleteClick, {
                    source: 'studio_manage_domains'
                });
            }}>
            Delete
        </ActionMenu.Item.Button>
    </ActionMenu.Root>
{/snippet}

<style>
    .action-menu-divider {
        margin-inline: -1rem;
        padding-block-end: 0.25rem;
        padding-block-start: 0.25rem;
    }
</style>
