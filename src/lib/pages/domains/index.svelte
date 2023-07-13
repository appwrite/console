<script context="module" lang="ts">
    export enum ProxyTypes {
        API = 'api',
        FUNCTION = 'function'
    }
</script>

<script lang="ts">
    import { DropList, DropListItem, Empty, Heading, Modal } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { dependencyStore, typeStore } from './wizard/store';
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

    function openRetry(domain: Models.ProxyRule, index?: number) {
        retryError = null;
        if (index !== undefined) {
            showDomainsDropdown[index] = false;
        }
        selectedDomain = domain;
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
                    <TableCellText title="Domain">
                        <a
                            href={`https://${domain.domain}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {domain.domain}
                            <span
                                class="icon-external-link"
                                aria-hidden="true"
                                style="color: hsl(var(--color-neutral-50))" />
                        </a>
                    </TableCellText>
                    <TableCellText title="Status">
                        {#if domain.status === 'created'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-x-circle"
                                    aria-hidden="true"
                                    style="color: hsl(var(--color-danger-100))" />
                                <span class="u-text">Failed</span>
                                <Button text on:click={() => openRetry(domain)}>
                                    <span class="link">Retry</span>
                                </Button>
                            </div>
                        {:else}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-check-circle"
                                    aria-hidden="true"
                                    style="color: hsl(var(--color-success-100))" />
                                <p class="u-stretch">Verified</p>
                            </div>
                        {/if}
                    </TableCellText>
                    <TableCellText title="Name">
                        {#if domain.status === 'unverified'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-x-circle"
                                    aria-hidden="true"
                                    style="color: hsl(var(--color-danger-100))" />
                                <p class="u-stretch">Failed</p>
                            </div>
                        {:else if domain.status === 'verified'}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-check-circle"
                                    aria-hidden="true"
                                    style="color: hsl(var(--color-success-100))" />
                                <span>Generated</span>
                                <span style="color: hsl(var(--color-neutral-70));">
                                    Auto-renewal: {toLocaleDate(domain.renewAt)}
                                </span>
                            </div>
                        {:else}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span
                                    class="icon-clock"
                                    aria-hidden="true"
                                    style="color: hsl(var(--color-neutral-50))" />
                                <p class="u-stretch">Waiting to run</p>
                            </div>
                        {/if}
                    </TableCellText>
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
    {#if selectedDomain}
        <Retry on:error={(e) => (retryError = e.detail)} />
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRetry = false)}>Close</Button>
    </svelte:fragment>
</Modal>
