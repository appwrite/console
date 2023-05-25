<script lang="ts">
    import { CardGrid, Box, Empty, EventModal } from '$lib/components';
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
    import Variables from '$lib/components/environmentVariables/variables.svelte';
    import GitConnection from './gitConnection.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';

    export let data: PageData;

    const functionId = $page.params.function;
    let showDelete = false;
    // let showVariablesUpload = false;
    let timeout: number = null;
    let functionName: string = null;
    let functionSchedule: string = null;
    let permissions: string[] = [];
    let arePermsDisabled = true;
    let logging: boolean = null;
    let entrypoint: string = null;
    let buildCommand: string = null;
    let installCommand: string = null;
    let branch: string = null;

    let showGitConnection = false;

    const eventSet: Writable<Set<string>> = writable(new Set());
    let showEvents = false;
    let areEventsDisabled = true;

    onMount(async () => {
        timeout ??= $func.timeout;
        functionName ??= $func.name;
        functionSchedule ??= $func.schedule;
        permissions = $func.execute;
        logging = $func.logging;
        entrypoint ??= $func.entrypoint;
        buildCommand ??= $func.buildCommand;
        installCommand ??= $func.installCommand;
        branch ??= $func.branch;
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
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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
                logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
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

    async function updateDeploymentSettings() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging,
                entrypoint,
                buildCommand,
                installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                $func.branch
            );

            invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Deployment settings has been updated'
            });
            trackEvent('submit_function_update_deployment_settings');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateBranch() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                $func.vcsInstallationId,
                $func.repositoryId,
                branch
            );

            invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Deployment settings has been updated'
            });
            trackEvent('submit_function_update_deployment_settings');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function disconnectVcs() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.events,
                $func.schedule,
                $func.timeout,
                $func.enabled,
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                '',
                '',
                ''
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Git has been disconnected'
            });
            trackEvent('submit_function_update_vcs_disconnect');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
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

    async function deleteVariable(variableId: string) {
        await sdkForProject.functions.deleteVariable($func.$id, variableId);
    }

    async function createVariable(key: string, value: string) {
        await sdkForProject.functions.createVariable($func.$id, key, value);
    }

    async function updateVariable(variableId: string, key: string, value: string) {
        await sdkForProject.functions.updateVariable($func.$id, variableId, key, value);
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

    {#if $func.vcsInstallationId}
        <Form on:submit={disconnectVcs}>
            <CardGrid>
                <Heading tag="h6" size="7">Git Integration</Heading>
                <p>SOME TEXT</p>
                <svelte:fragment slot="aside">
                    <ul>
                        <InputSelect
                            options={(data?.branches?.branches ?? []).map((branch) => {
                                return {
                                    label: branch.name,
                                    value: branch.name
                                };
                            })}
                            bind:value={branch}
                            id="branch"
                            label="Branch" />

                        <Button on:click={() => updateBranch()}>Update</Button>
                    </ul>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button on:click={disconnectVcs}>Disconnect</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {:else}
        <Form on:submit={() => (showGitConnection = true)}>
            <CardGrid>
                <Heading tag="h6" size="7">Git Integration</Heading>
                <p>SOME TEXT</p>
                <svelte:fragment slot="aside">
                    <ul>
                        <p>(Some info about connecting to git)</p>
                    </ul>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button on:click={() => (showGitConnection = true)}>Connect</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/if}

    <Form on:submit={updateDeploymentSettings}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Deployment Settings</Heading>
            <p>
                These settings are used default values when creating a deployment. They can be
                ovewritten when creating deployment.
            </p>
            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="entrypoint"
                        label="Entrypoint"
                        placeholder="main.js"
                        autocomplete={false}
                        bind:value={entrypoint} />
                </ul>
                <ul>
                    <InputText
                        id="install-command"
                        label="Install Command"
                        placeholder="npm install"
                        autocomplete={false}
                        bind:value={installCommand} />
                </ul>
                <ul>
                    <InputText
                        id="build-command"
                        label="Build Command"
                        placeholder="npm run build"
                        autocomplete={false}
                        bind:value={buildCommand} />
                </ul>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={entrypoint === $func.entrypoint &&
                        buildCommand === $func.buildCommand &&
                        installCommand === $func.installCommand}
                    on:click={updateDeploymentSettings}>Update</Button>
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
        <Heading tag="h6" size="7">Update Function Environment Variables</Heading>
        <p>
            Set the environment variables (or secret keys) that will be passed to your function at
            runtime and during build.
        </p>

        <svelte:fragment slot="aside">
            <Variables
                isGlobal={false}
                variables={data.variables}
                {deleteVariable}
                {createVariable}
                {updateVariable} />
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

<!-- <Upload bind:show={showVariablesUpload} on:uploaded={handleVariableCreated} /> -->
<EventModal bind:show={showEvents} on:created={handleEvent} />

{#if showGitConnection}
    <GitConnection installations={data.installations} bind:show={showGitConnection} />
{/if}
