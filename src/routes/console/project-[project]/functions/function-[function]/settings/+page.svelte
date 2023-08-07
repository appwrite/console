<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import {
        Box,
        CardGrid,
        DropList,
        DropListItem,
        Empty,
        Output,
        PaginationInline,
        Secret
    } from '$lib/components';
    import Heading from '$lib/components/heading.svelte';
    import { Roles } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputCron, InputNumber, InputText } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import Variable from '../../createVariable.svelte';
    import { execute, func } from '../store';
    import UploadVariables from './uploadVariables.svelte';
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
    import LL from '$i18n/i18n-svelte';

    export let data: PageData;

    const functionId = $page.params.function;
    let showDelete = false;
    let selectedVar: Models.Variable = null;
    let showVariablesUpload = false;
    let showVariablesModal = false;
    let showVariablesDropdown = [];
    let timeout: number = null;
    let functionName: string = null;
    let functionSchedule: string = null;
    let permissions: string[] = [];
    let arePermsDisabled = true;
    let offset = 0;

    onMount(async () => {
        timeout ??= $func.timeout;
        functionName ??= $func.name;
        functionSchedule ??= $func.schedule;
        permissions = $func.execute;
    });

    async function updateName() {
        try {
            await sdk.forProject.functions.update(
                functionId,
                functionName,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled
            );
            await invalidate(Dependencies.FUNCTION);
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
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                permissions,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: $LL.components.notification.permissionsUpdated(),
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
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                $func.events || undefined,
                functionSchedule,
                $func.timeout || undefined,
                $func.enabled
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: $LL.components.notification.cronUpdated()
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
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                timeout,
                $func.enabled
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: $LL.components.notification.timeOutUpdated()
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
            await sdk.forProject.functions.createVariable(functionId, variable.key, variable.value);
            await invalidate(Dependencies.VARIABLES);
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$func.name} ${$LL.components.notification.variablesUpdated()}`
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
            await sdk.forProject.functions.updateVariable(
                functionId,
                variable.$id,
                variable.key,
                variable.value
            );
            await invalidate(Dependencies.VARIABLES);
            selectedVar = null;
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$func.name} ${$LL.components.notification.variablesUpdated()}`
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
            await sdk.forProject.functions.deleteVariable(variable.functionId, variable.$id);
            await invalidate(Dependencies.VARIABLES);
            addNotification({
                type: 'success',
                message: $LL.components.notification.variablesUpdated()
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
                    <p>{$LL.console.project.texts.functions.addEvent()} {$func.$id}</p>
                    <p>
                        {$LL.console.project.texts.functions.addEvent()}
                        {toLocaleDateTime($func.$createdAt)}
                    </p>
                    <p>
                        {$LL.console.project.texts.functions.updatedAt()}
                        {toLocaleDateTime($func.$updatedAt)}
                    </p>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => ($execute = $func)}
                >{$LL.console.project.button.submit.executeNow()}</Button>
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.forms.functions.title.name()}</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label={$LL.console.project.forms.functions.inputs.name.label()}
                        placeholder={$LL.console.project.forms.functions.inputs.name.defaultPlaceholder()}
                        autocomplete={false}
                        bind:value={functionName} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={functionName === $func.name || !functionName} submit>
                    {$LL.console.project.button.submit.update()}
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form onSubmit={updatePermissions}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.executeAccess()}</Heading>
            <p>
                {$LL.console.project.texts.functions.setPermission()}
                <a
                    href="https://appwrite.io/docs/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    {$LL.console.project.texts.functions.permissionGuide()}
                </a>.
            </p>
            <svelte:fragment slot="aside">
                <Roles bind:roles={permissions} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={arePermsDisabled} submit
                    >{$LL.console.project.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateEvents />

    <Form onSubmit={updateSchedule}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.schedule()}</Heading>
            <p>
                {$LL.console.project.texts.functions.setCron()}
                <a
                    href="https://en.wikipedia.org/wiki/Cron"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    {$LL.console.project.texts.functions.moreDetailsCronSyntax()}</a>
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
                <Button disabled={$func.schedule === functionSchedule} submit
                    >{$LL.console.project.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.variables()}</Heading>
        <p>{$LL.console.project.texts.functions.setVariable()}</p>
        <svelte:fragment slot="aside">
            <div class="u-flex u-margin-inline-start-auto u-gap-16">
                <Button
                    secondary
                    event="download_env"
                    disabled={!data.variables.total}
                    on:click={downloadVariables}>
                    <span class="icon-download" />
                    <span class="text">{$LL.console.project.button.submit.downloadEnv}</span>
                </Button>
                <Button secondary on:click={() => (showVariablesUpload = true)}>
                    <span class="icon-upload" />
                    <span class="text">{$LL.console.project.button.submit.importEnv()}</span>
                </Button>
            </div>
            {@const limit = 10}
            {@const sum = data.variables.total}
            {#if sum}
                <div class="u-flex u-flex-vertical u-gap-16">
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead>{$LL.console.project.table.header.key()}</TableCellHead>
                            <TableCellHead width={180}
                                >{$LL.console.project.table.header.value()}</TableCellHead>
                            <TableCellHead width={30} />
                        </TableHeader>
                        <TableBody>
                            {#each data.variables.variables.slice(offset, offset + limit) as variable, i}
                                <TableRow>
                                    <TableCell title="key">
                                        <Output value={variable.key} hideCopyIcon>
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
                                                    {$LL.console.project.button.dropdown.edit()}
                                                </DropListItem>
                                                <DropListItem
                                                    icon="trash"
                                                    on:click={async () => {
                                                        handleVariableDeleted(variable);
                                                        showVariablesDropdown[i] = false;
                                                    }}>
                                                    {$LL.console.project.button.submit.delete()}
                                                </DropListItem>
                                            </svelte:fragment>
                                        </DropList>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                    <Button text noMargin on:click={() => (showVariablesModal = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">{$LL.console.project.button.createVariable()}</span>
                    </Button>
                    <div class="u-flex u-main-space-between">
                        <p class="text">
                            {$LL.console.project.texts.functions.totalVariables()}
                            {sum}
                        </p>
                        <PaginationInline {sum} {limit} bind:offset hidePages />
                    </div>
                </div>
            {:else}
                <Empty on:click={() => (showVariablesModal = !showVariablesModal)}>
                    {$LL.console.project.texts.functions.getStartedVar()}
                </Empty>
            {/if}
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateTimeout}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.timeout()}</Heading>
            <p>
                {$LL.console.project.texts.functions.timeLimit()}
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
                <Button disabled={$func.timeout === timeout || timeout < 1} submit
                    >{$LL.console.project.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid danger>
        <Heading tag="h6" size="7">{$LL.console.project.title.deleteFunction()}</Heading>
        <p>
            {$LL.console.project.texts.functions.permanentActionDelete()}
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
            <Button secondary on:click={() => (showDelete = true)}
                >{$LL.console.project.button.submit.delete()}</Button>
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
{#if showVariablesUpload}
    <UploadVariables bind:show={showVariablesUpload} />
{/if}
