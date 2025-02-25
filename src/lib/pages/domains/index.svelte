<script lang="ts">
    import { Empty, Modal, SearchQuery } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { dependencyStore, domain, typeStore } from './wizard/store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import type { Dependencies } from '$lib/constants';
    import type { Models, ResourceType } from '@appwrite.io/console';
    import Create from './create.svelte';
    import Delete from './delete.svelte';
    import Retry from './wizard/retry.svelte';
    import { canWriteRules } from '$lib/stores/roles';
    import {
        Layout,
        Table,
        Link,
        Icon,
        Badge,
        Popover,
        ActionMenu
    } from '@appwrite.io/pink-svelte';
    import {
        IconCheckCircle,
        IconDotsHorizontal,
        IconExclamationCircle,
        IconPlus,
        IconRefresh,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/stores';
    import { base } from '$app/paths';

    export let search: string;
    export let rules: Models.ProxyRuleList;
    export let type: ResourceType;
    export let dependency: Dependencies;

    let showDelete = false;
    let showRetry = false;
    let selectedDomain: Models.ProxyRule;
    let retryError = null;

    onMount(() => {
        typeStore.set(type);
        dependencyStore.set(dependency);
    });

    function openWizard() {
        wizard.start(Create);
    }

    function openRetry(rule: Models.ProxyRule) {
        retryError = null;
        selectedDomain = rule;
        showRetry = true;
    }
</script>

{#if $canWriteRules}
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery {search} placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button
                href={`${base}/project-${$page.params.project}/settings/domains/create`}
                event="create_user"
                size="s">
                <Icon size="s" icon={IconPlus} slot="start" />
                <span class="text">Create domain</span>
            </Button>
        </Layout.Stack>
    </Layout.Stack>
{/if}
{#if rules.total}
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Name</Table.Header.Cell>
            <Table.Header.Cell>Verification status</Table.Header.Cell>
            <Table.Header.Cell>Certificate status</Table.Header.Cell>
            {#if $canWriteRules}
                <Table.Header.Cell width="20px" />
            {/if}
        </svelte:fragment>
        {#each rules.rules as domain, index}
            <Table.Row>
                <Table.Cell>
                    <Layout.Stack direction="row" alignItems="center">
                        <Link.Anchor href={`https://${domain.domain}`} target="_blank">
                            {domain.domain}
                        </Link.Anchor>
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell>
                    {#if domain.status === 'created'}
                        <Layout.Stack direction="row" alignItems="center">
                            <Badge variant="secondary" content="failed" type="error">
                                <Icon slot="start" size="s" icon={IconExclamationCircle} />
                            </Badge>
                            <Link.Button variant="muted" on:click={() => openRetry(domain)}>
                                Retry
                            </Link.Button>
                        </Layout.Stack>
                    {:else}
                        <Badge content="verified" variant="secondary" type="success">
                            <Icon slot="start" size="s" icon={IconCheckCircle} />
                        </Badge>
                    {/if}
                </Table.Cell>
                <Table.Cell>
                    {#if domain.status === 'unverified'}
                        <Layout.Stack direction="row" alignItems="center">
                            <Badge variant="secondary" content="failed" type="error">
                                <Icon slot="start" size="s" icon={IconExclamationCircle} />
                            </Badge>
                            <Link.Button variant="muted" on:click={() => openRetry(domain)}>
                                Retry
                            </Link.Button>
                        </Layout.Stack>
                    {:else if domain.status === 'verified'}
                        <Layout.Stack direction="row" alignItems="center">
                            <Badge content="generated" variant="secondary" type="success">
                                <Icon slot="start" size="s" icon={IconCheckCircle} />
                            </Badge>
                            {#if domain.renewAt}
                                <span class="u-text-color-gray">
                                    Auto-renewal: {toLocaleDate(domain.renewAt)}
                                </span>
                            {/if}
                        </Layout.Stack>
                    {:else}
                        <Badge content="blocked by verification" variant="secondary" type="warning">
                            <Icon slot="start" size="s" icon={IconExclamationCircle} />
                        </Badge>
                    {/if}
                </Table.Cell>
                {#if $canWriteRules}
                    <Table.Cell>
                        <Popover let:toggle placement="bottom-start" padding="none">
                            <Button text icon ariaLabel="more options" on:click={toggle}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button>
                            <ActionMenu.Root slot="tooltip">
                                {#if domain.status !== 'verified'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={() => openRetry(domain)}>
                                        {domain.status === 'unverified'
                                            ? 'Retry generation'
                                            : 'Retry verification'}
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    leadingIcon={IconTrash}
                                    on:click={() => {
                                        selectedDomain = domain;
                                        showDelete = true;
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </Popover>
                    </Table.Cell>
                {/if}
            </Table.Row>
        {/each}
    </Table.Root>
{:else}
    <Empty
        single
        href="https://appwrite.io/docs/advanced/platform/custom-domains"
        target="domain"
        on:click={openWizard} />
{/if}

<Delete bind:showDelete bind:selectedDomain {dependency} />
<Modal
    bind:show={showRetry}
    bind:error={retryError}
    title={`Retry ${selectedDomain?.status === 'unverified' ? 'certificate generation' : 'verification'}`}>
    <Retry domain={selectedDomain} on:error={(e) => (retryError = e.detail)} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showRetry = false)}>Close</Button>
    </svelte:fragment>
</Modal>
