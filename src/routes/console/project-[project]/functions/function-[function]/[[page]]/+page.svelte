<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import {
        CardGrid,
        Copy,
        DropList,
        DropListItem,
        Empty,
        Status,
        Heading,
        Pagination
    } from '$lib/components';
    import {
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText,
        TableScroll
    } from '$lib/elements/table';
    import { execute, func } from '../store';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';
    import { invalidate } from '$app/navigation';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import Delete from '../delete.svelte';
    import Create from '../create.svelte';
    import Activate from '../activate.svelte';
    import { browser } from '$app/environment';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import Output from '$lib/components/output.svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';

    export let data: PageData;

    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;

    let selectedDeployment: Models.Deployment = null;

    const handleActivate = () => {
        invalidate(Dependencies.DEPLOYMENTS);
    };

    $: activeDeployment = data.deployments.deployments.find((d) => d.$id === $func?.deployment);

    if (browser) {
        sdkForConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (message.events.includes('functions.*.deployments.*.create')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.update')) {
                invalidate(Dependencies.DEPLOYMENTS);
                invalidate(Dependencies.FUNCTION);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.delete')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
        });
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Deployments</Heading>
        <Button on:click={() => (showCreate = true)} event="create_deployment">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create deployment</span>
        </Button>
    </div>
    {#if data.deployments.total}
        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if activeDeployment}
            <CardGrid>
                <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <div class="u-flex u-gap-12 u-cross-center">
                            <p><b>Function ID: </b></p>
                            <Output value={$func.$id}><b>{$func.$id}</b></Output>
                        </div>

                        <div class="u-flex u-gap-12 u-cross-center">
                            <p>Deployment ID:</p>
                            <Output value={$func.deployment}>
                                {$func.deployment}
                            </Output>
                        </div>
                    </div>
                </div>
                <svelte:fragment slot="aside">
                    <div class="u-flex u-main-space-between">
                        <div>
                            <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                            <p>Updated at: {toLocaleDateTime($func.$updatedAt)}</p>
                            <p>Entrypoint: {activeDeployment?.entrypoint}</p>
                        </div>
                        <div class="u-flex u-flex-vertical u-cross-end">
                            <Status status={activeDeployment.status}>
                                {activeDeployment.status}
                            </Status>
                            <p class="text">
                                {calculateTime(activeDeployment.buildTime)}
                            </p>
                        </div>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        text
                        on:click={() => {
                            $log.show = true;
                            $log.func = $func;
                            $log.data = activeDeployment;
                        }}>
                        Build logs
                    </Button>
                    <Button secondary on:click={() => execute.set($func)}>Execute now</Button>
                </svelte:fragment>
            </CardGrid>
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/functions#createFunction"
                target="deployment"
                on:click={() => (showCreate = true)} />
        {/if}

        <div class="common-section">
            <Heading tag="h3" size="7">Inactive</Heading>
        </div>
        {#if data.deployments.total > 1 || (!activeDeployment && data.deployments.total === 1)}
            <TableScroll>
                <TableHeader>
                    <TableCellHead width={90}>Deployment ID</TableCellHead>
                    <TableCellHead width={140}>Created</TableCellHead>
                    <TableCellHead width={100}>Status</TableCellHead>
                    <TableCellHead width={100}>Build Time</TableCellHead>
                    <TableCellHead width={70}>Size</TableCellHead>
                    <TableCellHead width={25} />
                </TableHeader>
                <TableBody>
                    {#each data.deployments.deployments as deployment, index}
                        {#if deployment.$id !== $func.deployment}
                            <TableRow>
                                <TableCell title="Deployment ID">
                                    <Copy value={deployment.$id}>
                                        <Pill button trim>
                                            <span class="icon-duplicate" aria-hidden="true" />
                                            <span class="text u-trim">{deployment.$id}</span>
                                        </Pill>
                                    </Copy>
                                </TableCell>
                                <TableCellText title="Created">
                                    {toLocaleDateTime(deployment.$createdAt)}
                                </TableCellText>

                                <TableCell title="Status">
                                    <Status status={deployment.status}>
                                        {deployment.status}
                                    </Status>
                                </TableCell>

                                <TableCellText title="Build Time">
                                    {#if ['processing', 'building'].includes(deployment.status)}
                                        <span use:timer={{ start: deployment.$createdAt }} />
                                    {:else}
                                        {calculateTime(deployment.buildTime)}
                                    {/if}
                                </TableCellText>

                                <TableCellText title="Size">
                                    {calculateSize(deployment.size)}
                                </TableCellText>

                                <TableCell showOverflow>
                                    <DropList
                                        bind:show={showDropdown[index]}
                                        placement="bottom-start"
                                        noArrow>
                                        <button
                                            class="button is-only-icon is-text"
                                            aria-label="More options"
                                            on:click|preventDefault={() => {
                                                showDropdown[index] = !showDropdown[index];
                                            }}>
                                            <span class="icon-dots-horizontal" aria-hidden="true" />
                                        </button>
                                        <svelte:fragment slot="list">
                                            <DropListItem
                                                icon="lightning-bolt"
                                                on:click={() => {
                                                    selectedDeployment = deployment;
                                                    showActivate = true;
                                                    showDropdown = [];
                                                }}>
                                                Activate
                                            </DropListItem>
                                            <DropListItem
                                                icon="terminal"
                                                on:click={() => {
                                                    $log.show = true;
                                                    $log.func = $func;
                                                    $log.data = deployment;
                                                    showDropdown = [];
                                                }}>
                                                Output
                                            </DropListItem>
                                            <DropListItem
                                                icon="trash"
                                                on:click={() => {
                                                    selectedDeployment = deployment;
                                                    showDropdown = [];
                                                    showDelete = true;
                                                }}>
                                                Delete
                                            </DropListItem>
                                        </svelte:fragment>
                                    </DropList>
                                </TableCell>
                            </TableRow>
                        {/if}
                    {/each}
                </TableBody>
            </TableScroll>
        {:else}
            <Empty single target="deployment" on:click={() => (showCreate = true)}>
                <div class="u-text-center">
                    <Heading size="7" tag="h2"
                        >You have no inactive deployments. Create one to see it here.</Heading>
                    <p class="body-text-2 u-margin-block-start-4">
                        Learn more about deployments in our Documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button
                        external
                        href="https://appwrite.io/docs/functions#createFunction"
                        text
                        event="empty_documentation"
                        ariaLabel={`create {target}`}>Documentation</Button>
                    <Button secondary on:click={() => (showCreate = true)}>
                        Create deployment
                    </Button>
                </div>
            </Empty>
        {/if}
    {:else}
        <Empty
            single
            target="deployment"
            href="https://appwrite.io/docs/functions#createFunction"
            on:click={() => (showCreate = true)} />
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.deployments.total ? data.deployments.total - 1 : 0}</p>
        <Pagination
            limit={PAGE_LIMIT}
            path={`/console/project-${$page.params.project}/functions/function-${$page.params.function}`}
            offset={data.offset}
            sum={data.deployments.total ? data.deployments.total - 1 : 0} />
    </div>
</Container>

<Create bind:showCreate />

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
{/if}
