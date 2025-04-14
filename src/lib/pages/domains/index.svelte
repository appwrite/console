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
    <TableScroll>
        <TableHeader>
            <TableCellHead width={150}>Name</TableCellHead>
            <TableCellHead width={120}>Verification Status</TableCellHead>
            <TableCellHead width={180}>Certificate Status</TableCellHead>
            {#if $canWriteRules}
                <TableCellHead width={40} />
            {/if}
        </TableHeader>
        <TableBody>
            {#each rules.rules as domain, i}
                <TableRow>
                    <TableCellLink
                        title="Domain"
                        href={`https://${domain.domain}`}
                        external
                        noStyle>
                        <span class="u-flex u-gap-4 u-cross-center">
                            <Trim>
                                <span class="link">{domain.domain}</span>
                            </Trim>
                            <span class="icon-external-link" aria-hidden="true" />
                        </span>
                    </TableCellLink>
                    <TableCell title="Verification">
                        {#if domain.status === 'created'}
                            <div class="u-flex u-gap-16 u-cross-center">
                                <Pill danger>
                                    <span
                                        class="icon-exclamation-circle u-color-text-danger"
                                        aria-hidden="true" />
                                    <span class="u-text">failed</span>
                                </Pill>
                                <button type="button" on:click={() => openRetry(domain)}>
                                    <span class="link">Retry</span>
                                </button>
                            </div>
                        {:else}
                            <Pill success>
                                <span
                                    class="icon-check-circle u-color-text-success"
                                    aria-hidden="true" />
                                <p class="text">verified</p>
                            </Pill>
                        {/if}
                    </TableCell>
                    <TableCell title="Certificate">
                        {#if domain.status === 'unverified'}
                            <div class="u-flex u-gap-16 u-cross-center">
                                <Pill danger>
                                    <span
                                        class="icon-exclamation-circle u-color-text-danger"
                                        aria-hidden="true" />
                                    <span class="u-text">failed</span>
                                </Pill>
                                <button type="button" on:click={() => openRetry(domain)}>
                                    <span class="link">Retry</span>
                                </button>
                            </div>
                        {:else if domain.status === 'verified'}
                            <div class="u-flex u-gap-16 u-cross-center">
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
                            </div>
                        {:else}
                            <Pill warning>
                                <span class="icon-clock u-text-color-gray" aria-hidden="true" />
                                <p class="text">blocked by verification</p>
                            </Pill>
                        {/if}
                    </TableCell>
                    {#if $canWriteRules}
                        <TableCell right>
                            <DropList
                                bind:show={showDomainsDropdown[i]}
                                placement="bottom-start"
                                noArrow>
                                <Button
                                    text
                                    round
                                    ariaLabel="more options"
                                    on:click={() =>
                                        (showDomainsDropdown[i] = !showDomainsDropdown[i])}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </Button>
                                <svelte:fragment slot="list">
                                    {#if domain.status !== 'verified'}
                                        <DropListItem
                                            icon="refresh"
                                            on:click={() => openRetry(domain, i)}>
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
                                            showDomainsDropdown[i] = false;
                                        }}>
                                        Delete
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCell>
                    {/if}
                </TableRow>
            {/each}
        </TableBody>
    </TableScroll>
{:else}
    <Empty
        single
        href="https://appwrite.io/docs/advanced/platform/custom-domains"
        target="domain"
        on:click={openWizard} />
{/if}

<Delete bind:showDelete bind:selectedDomain {dependency} />
<Modal bind:show={showRetry} headerDivider={false} bind:error={retryError} size="big">
    <svelte:fragment slot="title">
        Retry {$domain.status === 'unverified' ? 'certificate generation' : 'verification'}
    </svelte:fragment>
    <Retry on:error={(e) => (retryError = e.detail)} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showRetry = false)}>Close</Button>
    </svelte:fragment>
</Modal>
