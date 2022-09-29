<script lang="ts">
    import { CardGrid, Box, DropList, DropListItem, Copy } from '$lib/components';
    import { Container } from '$lib/layout';
    import {
        Button,
        InputNumber,
        InputSelect,
        InputCron,
        Form,
        FormList
    } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { execute, func } from '../store';
    import Delete from './delete.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import type { Models } from '@aw-labs/appwrite-console';
    import Variable from '../../../createVariable.svelte';
    import Upload from './uploadVariables.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { variableList } from '../../../store';

    const functionId = $page.params.function;
    let showDelete = false;
    let selectedVar: Models.Variable = null;
    let showVariablesUpload = false;
    let showVariablesModal = false;
    let showVariablesValue = [];
    let showVariablesDropdown = [];
    let timeout = 0;
    let deployment: Models.Deployment = null;

    onMount(async () => {
        if ($func?.$id !== functionId) {
            await func.load(functionId);
        }
        await variableList.load(functionId);
        deployment = await func.getDeployment(functionId, $func.deployment);
        timeout = $func.timeout;
    });

    let options = [
        { label: 'seconds', value: 'seconds' },
        { label: 'minutes', value: 'minutes' }
    ];

    async function updateTimeout() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                $func.schedule,
                timeout
            );

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handleVariableCreated(dispatcedData: CustomEvent) {
        const variable = dispatcedData.detail;

        try {
            await variableList.create(functionId, variable.key, variable.value);
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$func.name} variables have been updated`
            });
            variableList.load(functionId);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handleVariableUpdated(dispatcedData: CustomEvent) {
        const variable = dispatcedData.detail;
        try {
            await variableList.update(functionId, variable.$id, variable.key, variable.value);
            selectedVar = null;
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$func.name} variables have been updated`
            });
            variableList.load(functionId);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function handleVariableDeleted(variableId) {
        try {
            await variableList.delete(functionId, variableId);
            addNotification({
                type: 'success',
                message: `Variable has been deleted`
            });
            variableList.load(functionId);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    function downloadVariables() {
        if ($variableList?.total) {
            let data = $variableList.variables
                .map((variable) => {
                    return `${variable.key}=${variable.value}`;
                })
                .join('\n');
            const file = new File([data], '.env', {
                type: 'application/x-envoy'
            });

            const link = document.createElement('a');
            const url = URL.createObjectURL(file);

            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <div class="avatar is-medium">
                <img
                    src={`${base}/icons/${$app.themeInUse}/color/${
                        $func.runtime.split('-')[0]
                    }.svg`}
                    alt="technology" />
            </div>
            <div>
                <h6 class="heading-level-7">{$func.name}</h6>
                <p>{$func.runtime}</p>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div class="u-flex u-main-space-between">
                <div>
                    <p>Function ID: {$func.$id}</p>
                    <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                    <p>Updated at: {toLocaleDateTime($func.$updatedAt)}</p>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button text on:click={() => console.log('open Logs')}>View as JSON</Button>
            <Button
                secondary
                on:click={() => {
                    $execute.selected = deployment;
                    $execute.show = true;
                }}>Execute now</Button>
        </svelte:fragment>
    </CardGrid>

    <Form on:submit={() => console.log($func.schedule)}>
        <CardGrid>
            <h2 class="heading-level-6">Update CRON Schedule</h2>
            <p>
                Set a CRON schedule to trigger your function. Leave blank for no schedule. <a
                    href="#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    More details on CRON syntax here.</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputCron
                        bind:value={$func.schedule}
                        label="Schedule (CRON Syntax)"
                        id="schedule" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={false} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateTimeout}>
        <CardGrid>
            <h2 class="heading-level-6">Update Timeout</h2>
            <p>
                Limit the execution time of your function. Maximum value is 900 seconds (15
                minutes).
            </p>
            <svelte:fragment slot="aside">
                <div class="form u-grid u-gap-16">
                    <ul class="form-list is-multiple">
                        <InputNumber id="length" label="Time" value={timeout} />
                        <InputSelect
                            id="Increment"
                            {options}
                            label="Time Period"
                            value={options[0].value} />
                    </ul>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={true} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <h2 class="heading-level-6">Update Function Variables</h2>
        <p>Set the variables (or secret keys) that will be passed to your function at runtime.</p>
        <svelte:fragment slot="aside">
            <div class="u-flex u-margin-inline-start-auto u-gap-16">
                <Button secondary on:click={downloadVariables}>
                    <span class="icon-download" />
                    <span class="text">Download .env file</span>
                </Button>
                <Button secondary on:click={() => (showVariablesUpload = true)}>
                    <span class="icon-upload" />
                    <span class="text">Import .env file</span>
                </Button>
            </div>
            <table class="table is-remove-outer-styles">
                <thead class="table-thead">
                    <tr class="table-row">
                        <th class="table-thead-col">
                            <span class="eyebrow-heading-3">Key</span>
                        </th>
                        <th class="table-thead-col">
                            <span class="eyebrow-heading-3">Value</span>
                        </th>
                        <th class="table-thead-col" style="--p-col-width:40" />
                    </tr>
                </thead>
                <tbody class="table-tbody">
                    {#if $variableList?.total}
                        {#each $variableList.variables as variable, i}
                            <tr class="table-row">
                                <td class="table-col" data-title="Key">
                                    <span class="text">{variable.key}</span>
                                </td>
                                <td class="table-col u-overflow-visible" data-title="value">
                                    <div class="interactive-text-output">
                                        {#if showVariablesValue[i]}
                                            <span class="text">{variable.value}</span>
                                        {:else}
                                            <span class="text">••••••••</span>
                                        {/if}
                                        <div class="u-flex u-cross-child-start u-gap-8">
                                            <button
                                                on:click|preventDefault={() =>
                                                    (showVariablesValue[i] =
                                                        !showVariablesValue[i])}
                                                class="interactive-text-output-button"
                                                aria-label="show hidden text">
                                                {#if showVariablesValue[i]}
                                                    <span class="icon-eye-off" aria-hidden="true" />
                                                {:else}
                                                    <span class="icon-eye" aria-hidden="true" />
                                                {/if}
                                            </button>
                                            <Copy bind:value={variable.value}>
                                                <button
                                                    class="interactive-text-output-button"
                                                    aria-label="copy text">
                                                    <span
                                                        class="icon-duplicate"
                                                        aria-hidden="true" />
                                                </button>
                                            </Copy>
                                        </div>
                                    </div>
                                </td>
                                <td class="table-col u-overflow-visible" data-title="options">
                                    <DropList
                                        bind:show={showVariablesDropdown[i]}
                                        position="bottom"
                                        horizontal="left"
                                        arrow={false}>
                                        <button
                                            class="button is-text is-only-icon"
                                            aria-label="more options"
                                            on:click|preventDefault={() =>
                                                (showVariablesDropdown[i] =
                                                    !showVariablesDropdown[i])}>
                                            <span class="icon-dots-horizontal" aria-hidden="true" />
                                        </button>
                                        <svelte:fragment slot="list">
                                            <DropListItem
                                                icon="pencil"
                                                on:click={() => {
                                                    selectedVar = variable;
                                                    showVariablesDropdown[i] = false;
                                                    showVariablesModal = true;
                                                }}>
                                                Edit
                                            </DropListItem>
                                            <DropListItem
                                                icon="trash"
                                                on:click={async () => {
                                                    handleVariableDeleted(variable.$id);
                                                    showVariablesDropdown[i] = false;
                                                }}>
                                                Delete
                                            </DropListItem>
                                        </svelte:fragment>
                                    </DropList>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
            <div class="u-flex u-margin-block-start-16">
                <button
                    class="button is-text u-padding-inline-0"
                    type="button"
                    on:click={() => {
                        showVariablesModal = true;
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create variable</span>
                </button>
            </div>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <h6 class="heading-level-7">Delete Function</h6>
        <p>
            The function will be permanently deleted, including all deployments associated with it.
            This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold">{$func.name}</h6>
                </svelte:fragment>
                <p>Last Updated: {toLocaleDateTime($func.$updatedAt)}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
{#if showVariablesModal}
    <Variable
        bind:showCreate={showVariablesModal}
        bind:selectedVar
        on:created={handleVariableCreated}
        on:updated={handleVariableUpdated} />
{/if}

<Upload bind:show={showVariablesUpload} on:uploaded={handleVariableCreated} />
