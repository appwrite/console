<script lang="ts">
    import { DropList, DropListItem, Empty, Heading, Modal, Trim } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellLink,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
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
    import { Pill } from '$lib/elements';
    import { canWriteRules } from '$lib/stores/roles';
    import { Layout, Table, Link } from '@appwrite.io/pink-svelte';

    export let rules: Models.ProxyRuleList;
    export let type: ResourceType;
    export let dependency: Dependencies;

    let showDomainsDropdown = [];
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

    function openRetry(rule: Models.ProxyRule, index?: number) {
        retryError = null;
        if (index !== undefined) {
            showDomainsDropdown[index] = false;
        }
        domain.set(rule);
        showRetry = true;
    }
</script>

<div class="u-flex u-gap-12 common-section u-main-space-between">
    <Heading tag="h2" size="5">
        <slot name="heading" />
    </Heading>

    {#if $canWriteRules}
        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create domain</span>
        </Button>
    {/if}
</div>
{#if rules.total}
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Name</Table.Header.Cell>
            <Table.Header.Cell>Verification Status</Table.Header.Cell>
            <Table.Header.Cell>Certificate Status</Table.Header.Cell>
            {#if $canWriteRules}
                <Table.Header.Cell width="40" />
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
                            <Pill danger>
                                <span
                                    class="icon-exclamation-circle u-color-text-danger"
                                    aria-hidden="true" />
                                <span class="u-text">failed</span>
                            </Pill>
                            <button type="button" on:click={() => openRetry(domain)}>
                                <span class="link">Retry</span>
                            </button>
                        </Layout.Stack>
                    {:else}
                        <Pill success>
                            <span
                                class="icon-check-circle u-color-text-success"
                                aria-hidden="true" />
                            <p class="text">verified</p>
                        </Pill>
                    {/if}
                </Table.Cell>
                <Table.Cell>
                    {#if domain.status === 'unverified'}
                        <Layout.Stack direction="row" alignItems="center">
                            <Pill danger>
                                <span
                                    class="icon-exclamation-circle u-color-text-danger"
                                    aria-hidden="true" />
                                <span class="u-text">failed</span>
                            </Pill>
                            <button type="button" on:click={() => openRetry(domain)}>
                                <span class="link">Retry</span>
                            </button>
                        </Layout.Stack>
                    {:else if domain.status === 'verified'}
                        <Layout.Stack direction="row" alignItems="center">
                            <Pill success>
                                <span
                                    class="icon-check-circle u-color-text-success"
                                    aria-hidden="true" />
                                <span>generated</span>
                            </Pill>
                            {#if domain.renewAt}
                                <span class="u-text-color-gray">
                                    Auto-renewal: {toLocaleDate(domain.renewAt)}
                                </span>
                            {/if}
                        </Layout.Stack>
                    {:else}
                        <Pill warning>
                            <span class="icon-clock u-text-color-gray" aria-hidden="true" />
                            <p class="text">blocked by verification</p>
                        </Pill>
                    {/if}
                </Table.Cell>
                {#if $canWriteRules}
                    <Table.Cell>
                        <DropList
                            bind:show={showDomainsDropdown[index]}
                            placement="bottom-start"
                            noArrow>
                            <Button
                                text
                                icon
                                ariaLabel="more options"
                                on:click={() =>
                                    (showDomainsDropdown[index] = !showDomainsDropdown[index])}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if domain.status !== 'verified'}
                                    <DropListItem
                                        icon="refresh"
                                        on:click={() => openRetry(domain, index)}>
                                        {domain.status === 'unverified'
                                            ? 'Retry generation'
                                            : 'Retry verification'}
                                    </DropListItem>
                                {/if}
                                <DropListItem
                                    icon="trash"
                                    on:click={() => {
                                        selectedDomain = domain;
                                        showDelete = true;
                                        showDomainsDropdown[index] = false;
                                    }}>
                                    Delete
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
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
<Modal bind:show={showRetry} bind:error={retryError}>
    <svelte:fragment slot="title">
        Retry {$domain.status === 'unverified' ? 'certificate generation' : 'verification'}
    </svelte:fragment>
    <Retry on:error={(e) => (retryError = e.detail)} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showRetry = false)}>Close</Button>
    </svelte:fragment>
</Modal>
