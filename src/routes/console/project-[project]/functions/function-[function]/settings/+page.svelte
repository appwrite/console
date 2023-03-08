<script lang="ts">
    import {
        CardGrid,
        Box,
        DropList,
        DropListItem,
        Copy,
        Empty,
        EventModal
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputNumber, InputText, InputCron, Form, FormList } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { execute, func } from '../store';
    import Delete from './delete.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import type { Models } from '@aw-labs/appwrite-console';
    import Variable from '../../createVariable.svelte';
    // import Upload from './uploadVariables.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Roles } from '$lib/components/permissions';
    import { symmetricDifference } from '$lib/helpers/array';
    import TableList from '$lib/elements/table/tableList.svelte';
    import { TableCell, TableCellText } from '$lib/elements/table';
    import Heading from '$lib/components/heading.svelte';
    import { writable, type Writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { PageData } from './$types';
    import { trackEvent } from '$lib/actions/analytics';
    import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';

    export let data: PageData;

    const functionId = $page.params.function;
    let showDelete = false;
    let selectedVar: Models.Variable = null;
    // let showVariablesUpload = false;
    let showVariablesModal = false;
    let showVariablesValue = [];
    let showVariablesDropdown = [];
    let timeout: number = null;
    let functionName: string = null;
    let functionSchedule: string = null;
    let permissions: string[] = [];
    let arePermsDisabled = true;
    let logging: boolean = null;

    const eventSet: Writable<Set<string>> = writable(new Set());
    let showEvents = false;
    let areEventsDisabled = true;

    onMount(async () => {
        timeout ??= $func.timeout;
        functionName ??= $func.name;
        functionSchedule ??= $func.schedule;
        permissions = $func.execute;
        logging = $func.logging;
        $eventSet = new Set($func.events);
    });

    async function updateName() {
        try {
            await sdkForProject.functions.update(
                functionId,
                functionName,
                $func.execute,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_function_update_name');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updateLogging() {
        try {
            await sdkForProject.functions.update(
                functionId,
                functionName,
                $func.execute,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                logging
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Logging has been updated',
                type: 'success'
            });
            trackEvent('submit_function_update_logging');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updatePermissions() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                permissions,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent('submit_function_update_permissions');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updateEvents() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                Array.from($eventSet),
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent('submit_function_update_events');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updateSchedule() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                functionSchedule,
                $func.timeout,
                $func.enabled,
                $func.logging
            );
            invalidate(Dependencies.FUNCTION);

            addNotification({
                type: 'success',
                message: 'CRON Schedule has been updated'
            });
            trackEvent('submit_function_update_schedule');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateTimeout() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                $func.schedule,
                timeout,
                $func.enabled,
                $func.logging
            );

            invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Timeout has been updated'
            });
            trackEvent('submit_function_update_timeout');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handleVariableCreated(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;

        try {
            await sdkForProject.functions.createVariable(functionId, variable.key, variable.value);
            showVariablesModal = false;
            invalidate(Dependencies.VARIABLES);
            addNotification({
                type: 'success',
                message: `${$func.name} variables have been updated`
            });
            trackEvent('submit_variable_create');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handleVariableUpdated(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;
        try {
            await sdkForProject.functions.updateVariable(
                functionId,
                variable.$id,
                variable.key,
                variable.value
            );
            selectedVar = null;
            showVariablesModal = false;
            invalidate(Dependencies.VARIABLES);
            addNotification({
                type: 'success',
                message: `${$func.name} variables have been updated`
            });
            trackEvent('submit_variable_update');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function handleVariableDeleted(variable: Models.Variable) {
        try {
            await sdkForProject.functions.deleteVariable(variable.functionId, variable.$id);
            invalidate(Dependencies.VARIABLES);
            addNotification({
                type: 'success',
                message: `Variable has been deleted`
            });
            trackEvent('submit_variable_delete');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    function downloadVariables() {
        if (data.variables.total) {
            let content = data.variables.variables
                .map((variable) => `${variable.key}=${variable.value}`)
                .join('\n');
            const file = new File([content], '.env', {
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

    function handleEvent(event: CustomEvent) {
        eventSet.set($eventSet.add(event.detail));
    }

    $: if (permissions) {
        if (symmetricDifference(permissions, $func.execute).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }

    $: if ($eventSet) {
        if (symmetricDifference(Array.from($eventSet), $func.events).length) {
            areEventsDisabled = false;
        } else areEventsDisabled = true;
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
                <Heading tag="h6" size="7">{$func.name}</Heading>

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
            <Button secondary on:click={() => ($execute = $func)}>Execute now</Button>
        </svelte:fragment>
    </CardGrid>

    <Form on:submit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        bind:value={functionName} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={functionName === $func.name || !functionName} submit>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateLogging}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Logging</Heading>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputSwitch bind:value={logging} id="logging" label="Logging" />
                </FormList>
                <p class="text">
                    When logging is enabled, every execution response will be stored and can be
                    accessed later. When logging is disabed, no data is stored about executions.
                </p>
                <p class="text">
                    Disabled logging can be useful when transfering privacy-critical data, or for
                    performance reasons.
                </p>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={logging === $func.logging} on:click={updateLogging}
                    >Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updatePermissions}>
        <CardGrid>
            <Heading tag="h6" size="7">Execute Access</Heading>
            <p>
                Choose who can execute this function using the client API. For more information,
                check out the Permissions Guide in our documentation.
            </p>
            <svelte:fragment slot="aside">
                <Roles bind:roles={permissions} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={arePermsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateEvents}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Events</Heading>
            <p>Set the events that will trigger your function. Maximum 100 events allowed.</p>
            <svelte:fragment slot="aside">
                {#if $eventSet.size}
                    <TableList>
                        {#each Array.from($eventSet) as event}
                            <li class="table-row">
                                <TableCellText title="id">
                                    {event}
                                </TableCellText>
                                <TableCell showOverflow title="options" width={40}>
                                    <button
                                        class="button is-text is-only-icon"
                                        aria-label="delete id"
                                        on:click|preventDefault={() => {
                                            $eventSet.delete(event);
                                            eventSet.set($eventSet);
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </TableCell>
                            </li>
                        {/each}
                    </TableList>

                    <div class="u-flex u-margin-block-start-16">
                        <Button text noMargin on:click={() => (showEvents = true)}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="u-text">Add event</span>
                        </Button>
                    </div>
                {:else}
                    <Empty on:click={() => (showEvents = true)}>Add an event to get started</Empty>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={areEventsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateSchedule}>
        <CardGrid>
            <Heading tag="h6" size="7">Update CRON Schedule</Heading>
            <p>
                Set a CRON schedule to trigger your function. Leave blank for no schedule. <a
                    href="https://appwrite.io/docs/functions#createFunction"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    More details on CRON syntax here.</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputCron
                        bind:value={functionSchedule}
                        label="Schedule (CRON Syntax)"
                        id="schedule" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={$func.schedule === functionSchedule} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateTimeout}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Timeout</Heading>
            <p>
                Limit the execution time of your function. Maximum value is 900 seconds (15
                minutes).
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputNumber
                        min={1}
                        max={900}
                        id="time"
                        label="Time (in seconds)"
                        bind:value={timeout} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={$func.timeout === timeout || timeout < 1} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <Heading tag="h6" size="7">Update Function Variables</Heading>
        <p>Set the variables (or secret keys) that will be passed to your function at runtime.</p>
        <svelte:fragment slot="aside">
            <div class="u-flex u-margin-inline-start-auto u-gap-16">
                <Button secondary on:click={downloadVariables}>
                    <span class="icon-download" />
                    <span class="text">Download .env file</span>
                </Button>
                <!-- <Button secondary on:click={() => (showVariablesUpload = true)}>
                    <span class="icon-upload" />
                    <span class="text">Import .env file</span>
                </Button> -->
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
                    {#if data.variables.total}
                        {#each data.variables.variables as variable, i}
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
                                        placement="bottom-start"
                                        noArrow>
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
                                                    handleVariableDeleted(variable);
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

    <CardGrid danger>
        <Heading tag="h6" size="7">Delete Function</Heading>
        <p>
            The function will be permanently deleted, including all deployments associated with it.
            This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$func.name}</h6>
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
        bind:selectedVar
        bind:showCreate={showVariablesModal}
        on:created={handleVariableCreated}
        on:updated={handleVariableUpdated} />
{/if}
<!-- <Upload bind:show={showVariablesUpload} on:uploaded={handleVariableCreated} /> -->
<EventModal bind:show={showEvents} on:created={handleEvent} />
