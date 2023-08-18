<script context="module" lang="ts">
    export enum ProxyTypes {
        API = 'api',
        FUNCTION = 'function'
    }
</script>

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
    import type { Models } from '@appwrite.io/console';
    import Create from './create.svelte';
    import Delete from './delete.svelte';
    import Retry from './wizard/retry.svelte';

    export let rules: Models.ProxyRuleList;
    export let type: ProxyTypes;
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

    <Button on:click={openWizard}>
        <span class="icon-plus" aria-hidden="true" /> <span class="text">Create domain</span>
    </Button>
</div>
{#if rules.total}
    <TableScroll>
        <TableHeader>
            <TableCellHead>Name</TableCellHead>
            <TableCellHead width={180}>Verification Status</TableCellHead>
            <TableCellHead>Certificate Status</TableCellHead>
            <TableCellHead width={40} />
        </TableHeader>
        <TableBody>
            {#each rules.rules as domain, i}
                <TableRow>
                    <TableCellLink
                        title="Domain"
                        href={`https://${domain.domain}`}
                        external
                        noStyle>
                        <Trim>
                            <span class="u-flex u-gap-4 u-cross-center">
                                <span class="link"> {domain.domain}</span>
                                <span class="icon-external-link" aria-hidden="true" />
                            </span>
                        </Trim>
                    </TableCellLink>
                    <TableCell title="Status">
                        {#if domain.status === 'created'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-x-circle u-color-text-danger"
                                    aria-hidden="true" />
                                <span class="u-text">Failed</span>
                                <button on:click={() => openRetry(domain)}>
                                    <span class="link">Retry</span>
                                </button>
                            </div>
                        {:else}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-check-circle u-color-text-success"
                                    aria-hidden="true" />
                                <p class="u-stretch">Verified</p>
                            </div>
                        {/if}
                    </TableCell>
                    <TableCell title="Name">
                        {#if domain.status === 'unverified'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-x-circle u-color-text-danger"
                                    aria-hidden="true" />
                                <p class="u-stretch">Failed</p>
                            </div>
                        {:else if domain.status === 'verified'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-check-circle u-color-text-success"
                                    aria-hidden="true" />
                                <span>Generated</span>
                                {#if domain.renewAt}
                                    <span class="u-text-color-gray">
                                        Auto-renewal: {toLocaleDate(domain.renewAt)}
                                    </span>
                                {/if}
                            </div>
                        {:else}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span class="icon-clock u-text-color-gray" aria-hidden="true" />
                                <p class="u-stretch">Waiting to run</p>
                            </div>
                        {/if}
                    </TableCell>
                    <TableCell>
                        <DropList
                            bind:show={showDomainsDropdown[i]}
                            placement="bottom-start"
                            noArrow>
                            <Button
                                text
                                round
                                ariaLabel="more options"
                                on:click={() => (showDomainsDropdown[i] = !showDomainsDropdown[i])}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </Button>
                            <svelte:fragment slot="list">
                                <DropListItem icon="refresh" on:click={() => openRetry(domain, i)}>
                                    Retry
                                </DropListItem>
                                <DropListItem
                                    icon="trash"
                                    on:click={() => {
                                        selectedDomain = domain;
                                        showDelete = true;
                                        showDomainsDropdown[i] = false;
                                    }}>
                                    Delete
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </TableCell>
                </TableRow>
            {/each}
        </TableBody>
    </TableScroll>
{:else}
    <Empty
        single
        href="https://appwrite.io/docs/custom-domains"
        target="domain"
        on:click={openWizard} />
{/if}

<Delete bind:showDelete bind:selectedDomain {dependency} />
<Modal bind:show={showRetry} headerDivider={false} bind:error={retryError}>
    <svelte:fragment slot="header">Retry verification</svelte:fragment>
    <Retry on:error={(e) => (retryError = e.detail)} />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRetry = false)}>Close</Button>
    </svelte:fragment>
</Modal>
