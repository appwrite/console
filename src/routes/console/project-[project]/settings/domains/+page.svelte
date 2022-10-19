<script lang="ts">
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { Empty } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import Create from './_create.svelte';
    import Delete from './_delete.svelte';
    import { domainList } from './store';
    import type { Models } from '@aw-labs/appwrite-console';

    const projectId = $page.params.project;
    let showDelete = false;
    let selectedDomain: Models.Domain;
    let isVerifying = {};

    const openWizard = () => {
        wizard.start(Create);
    };

    const refreshDomain = async (domain: Models.Domain, i: number) => {
        const domainId = domain.$id;
        try {
            isVerifying[domainId] = true;

            if (domain.verification) {
                await domainList.load(projectId);
                return;
            }
            const result = await sdkForConsole.projects.updateDomainVerification(
                projectId,
                domainId
            );
            $domainList.domains[i] = result;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            isVerifying[domainId] = false;
        }
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Custom Domains</h2>

        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create domain</span>
        </Button>
    </div>
    {#await domainList.load(projectId)}
        <div aria-busy="true" />
    {:then}
        {#if $domainList.total}
            <Table>
                <TableHeader>
                    <TableCellHead />
                    <TableCellHead>Domain Name</TableCellHead>
                    <TableCellHead>TLS</TableCellHead>
                    <TableCellHead />
                </TableHeader>
                <TableBody>
                    {#each $domainList.domains as domain, i}
                        <TableRow>
                            <TableCellText title="Status">
                                <Pill warning={!domain.verification} success={domain.verification}>
                                    {domain.verification ? 'verified' : 'unverified'}
                                </Pill>
                            </TableCellText>
                            <TableCellText title="Domain">
                                {domain.domain}
                            </TableCellText>
                            <TableCellText title="TLS">
                                {#if domain.certificateId}
                                    <Pill success>enabled</Pill>
                                {:else}
                                    <span
                                        use:tooltip={{
                                            content:
                                                "The process might take a while, click the retry button to see if it's finished"
                                        }}>
                                        <Pill warning>
                                            {!domain.verification
                                                ? 'pending verification'
                                                : 'in progress'}
                                        </Pill>
                                    </span>
                                {/if}
                            </TableCellText>
                            <TableCell title="Actions">
                                <div class="u-flex u-gap-8 u-cross-center u-main-end">
                                    {#if isVerifying[domain.$id]}
                                        <!-- TODO: remove inline styles -->
                                        <div
                                            class="loader"
                                            style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                                    {:else if !domain.certificateId}
                                        <!-- TODO: remove inline styles -->
                                        <button
                                            class="button is-text is-only-icon u-padding-inline-0"
                                            style="--p-button-size: var(--button-size, 2.0rem);"
                                            aria-label="Verify item"
                                            on:click={() => {
                                                refreshDomain(domain, i);
                                            }}>
                                            <span class="icon-refresh" aria-hidden="true" />
                                        </button>
                                    {/if}
                                    <!-- TODO: remove inline styles -->
                                    <button
                                        class="button tooltip is-text is-only-icon u-padding-inline-0"
                                        style="--p-button-size: var(--button-size, 2.0rem);"
                                        aria-label="Delete item"
                                        on:click={async () => {
                                            showDelete = true;
                                            selectedDomain = domain;
                                        }}>
                                        <span class="icon-trash" aria-hidden="true" />
                                        <span class="tooltip-popup is-bottom" role="tooltip">
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Empty isButton single on:click={openWizard}>
                <div class="common-section">
                    <div class="u-text-center common-section">
                        <p>Create your first Domain to get started</p>
                    </div>
                    <div class="u-flex u-gap-16 common-section u-main-center">
                        <Button external href="#/" text>Documentation</Button>
                        <Button secondary>Create domain</Button>
                    </div>
                </div>
            </Empty>
        {/if}
    {/await}
</Container>

<Delete bind:showDelete bind:selectedDomain />
