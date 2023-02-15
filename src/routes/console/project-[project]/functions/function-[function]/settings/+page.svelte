<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Box, CardGrid, DropList, DropListItem, Empty, Output, Secret } from '$lib/components';
    import Heading from '$lib/components/heading.svelte';
    import { Roles } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputCron, InputNumber, InputText } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { onMount } from 'svelte';
    import Variable from '../../createVariable.svelte';
    import { execute, func } from '../store';
    // import Upload from './uploadVariables.svelte';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import type { PageData } from './$types';
    import Delete from './delete.svelte';
    import UpdateEvents from './updateEvents.svelte';

    export let data: PageData;

    const functionId = $page.params.function;
    let showDelete = false;
    let selectedVar: Models.Variable = null;
    // let showVariablesUpload = false;
    let showVariablesModal = false;
    let showVariablesDropdown = [];
    let timeout: number = null;
    let functionName: string = null;
    let functionSchedule: string = null;
    let permissions: string[] = [];
    let arePermsDisabled = true;

    onMount(async () => {
        timeout ??= $func.timeout;
        functionName ??= $func.name;
        functionSchedule ??= $func.schedule;
        permissions = $func.execute;
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
                $func.enabled
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdateName);
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
                $func.enabled
            );
            invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdatePermissions);
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
                $func.enabled
            );
            invalidate(Dependencies.FUNCTION);

            addNotification({
                type: 'success',
                message: 'Cron Schedule has been updated'
            });
            trackEvent(Submit.FunctionUpdateSchedule);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateSchedule);
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
                $func.enabled
            );

            invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Timeout has been updated'
            });
            trackEvent(Submit.FunctionUpdateTimeout);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateTimeout);
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
            trackEvent(Submit.VariableCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.VariableCreate);
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
            trackEvent(Submit.VariableUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.VariableUpdate);
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
            trackEvent(Submit.VariableDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.VariableDelete);
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

    $: if (permissions) {
        if (symmetricDifference(permissions, $func.execute).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
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

                <p class="text u-capitalize">{$func.runtime}</p>
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

    <Form on:submit={updatePermissions}>
        <CardGrid>
            <Heading tag="h6" size="7">Execute Access</Heading>
            <p>
                Choose who can execute this function using the client API. For more information,
                check out the <a
                    href="https://appwrite.io/docs/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    Permissions Guide
                </a>.
            </p>
            <svelte:fragment slot="aside">
                <Roles bind:roles={permissions} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={arePermsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateEvents />

    <Form on:submit={updateSchedule}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Schedule</Heading>
            <p>
                Set a Cron schedule to trigger your function. Leave blank for no schedule. <a
                    href="https://en.wikipedia.org/wiki/Cron"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    More details on Cron syntax here.</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputCron
                        bind:value={functionSchedule}
                        label="Schedule (Cron Syntax)"
                        id="schedule" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={$func.schedule === functionSchedule} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <Heading tag="h6" size="7">Update Variables</Heading>
        <p>Set the variables (or secret keys) that will be passed to your function at runtime.</p>
        <svelte:fragment slot="aside">
            <div class="u-flex u-margin-inline-start-auto u-gap-16">
                <Button
                    secondary
                    event="download_env"
                    disabled={!data.variables.total}
                    on:click={downloadVariables}>
                    <span class="icon-download" />
                    <span class="text">Download .env file</span>
                </Button>
                <!-- <Button secondary on:click={() => (showVariablesUpload = true)}>
                    <span class="icon-upload" />
                    <span class="text">Import .env file</span>
                </Button> -->
            </div>
            {#if data.variables.total}
                <div class="u-flex u-flex-vertical u-gap-16">
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead>Key</TableCellHead>
                            <TableCellHead>Value</TableCellHead>
                            <TableCellHead width={30} />
                        </TableHeader>
                        <TableBody>
                            {#each data.variables.variables as variable, i}
                                <TableRow>
                                    <TableCell title="key">
                                        <Output value={variable.key}>
                                            {variable.key}
                                        </Output>
                                    </TableCell>

                                    <TableCell showOverflow title="value">
                                        <Secret copyEvent="variable" value={variable.value} />
                                    </TableCell>
                                    <TableCell showOverflow title="options">
                                        <DropList
                                            bind:show={showVariablesDropdown[i]}
                                            placement="bottom-start"
                                            noArrow>
                                            <Button
                                                text
                                                round
                                                ariaLabel="more options"
                                                on:click={() =>
                                                    (showVariablesDropdown[i] =
                                                        !showVariablesDropdown[i])}>
                                                <span
                                                    class="icon-dots-horizontal"
                                                    aria-hidden="true" />
                                            </Button>
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
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                    <Button
                        text
                        noMargin
                        on:click={() => {
                            showVariablesModal = true;
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create variable</span>
                    </Button>
                </div>
            {:else}
                <Empty on:click={() => (showVariablesModal = !showVariablesModal)}
                    >Create a variable to get started</Empty>
            {/if}
        </svelte:fragment>
    </CardGrid>

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
