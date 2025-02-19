<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import {
        CardGrid,
        Heading,
        DropList,
        DropListItem,
        Empty,
        Output,
        PaginationInline,
        Secret
    } from '$lib/components';
    import UploadVariables from './uploadVariablesModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import Alert from '$lib/components/alert.svelte';
    import PromoteVariableModal from './promoteVariableModal.svelte';
    import CreateVariable from './createVariable.svelte';
    import RawVariableEditor from './rawVariableEditor.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let variableList: Models.VariableList;
    export let globalVariableList: Models.VariableList | undefined = undefined;

    export let isGlobal: boolean;
    export let sdkCreateVariable: (key: string, value: string) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string
    ) => Promise<unknown>;
    export let sdkDeleteVariable: (variableId: string) => Promise<unknown>;

    let showVariablesDropdown = [];
    let selectedVar: Models.Variable = null;
    let showVariablesUpload = false;
    let showVariablesModal = false;
    let showPromoteModal = false;
    let showEditorModal = false;
    let offset = 0;
    const limit = 10;

    async function handleVariableCreated(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;

        try {
            await sdkCreateVariable(variable.key, variable.value);
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$project.name} ${
                    isGlobal ? 'global variable' : 'variable'
                } has been created.`
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
            await sdkUpdateVariable(variable.$id, variable.key, variable.value);
            selectedVar = null;
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$project.name} ${
                    isGlobal ? 'global variable' : 'variable'
                } has been updated.`
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
            await sdkDeleteVariable(variable.$id);
            addNotification({
                type: 'success',
                message: `${$project.name} ${
                    isGlobal ? 'global variable' : 'variable'
                } has been deleted.`
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

    async function handleVariablePromoted(variable: Models.Variable) {
        try {
            const globalVariable = globalVariableList
                ? globalVariableList.variables.find(
                      (globalVariable) => globalVariable.key === variable.key
                  )
                : undefined;
            const isConflicting = globalVariable !== undefined;

            if (isConflicting) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .projectApi.deleteVariable(globalVariable.$id);
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .projectApi.createVariable(variable.key, variable.value);
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .functions.deleteVariable(variable.resourceId, variable.$id);
            } else {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .projectApi.createVariable(variable.key, variable.value);
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .functions.deleteVariable(variable.resourceId, variable.$id);
            }

            selectedVar = null;
            showPromoteModal = false;

            await Promise.all([
                invalidate(Dependencies.FUNCTION),
                invalidate(Dependencies.VARIABLES),
                invalidate(Dependencies.PROJECT_VARIABLES)
            ]);

            addNotification({
                type: 'success',
                message: `Variable has been ${isConflicting ? 'overwritten' : 'promoted'}.`
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

    $: conflictVariables = globalVariableList
        ? globalVariableList.variables.filter((globalVariable) => {
              return variableList.variables.find((variable) => {
                  return variable.key === globalVariable.key;
              });
          })
        : [];

    $: hasConflictOnPage = globalVariableList
        ? variableList.variables.slice(offset, offset + limit).filter((variable) => {
              return globalVariableList.variables.find((globalVariable) => {
                  return variable.key === globalVariable.key;
              });
          })
        : false;
</script>

<CardGrid>
    <Heading tag="h6" size="7" id="variables">
        {isGlobal ? 'Global variables' : 'Environment variables'}
    </Heading>
    {#if isGlobal}
        <p>
            Set the environment variables or secret keys that will be passed to all functions within
            your project.
        </p>
    {:else}
        <p>
            Set the environment variables or secret keys that will be passed to your function.
            Global variables can be found in <a
                href={`${base}/project-${$project.region}-${$project.$id}/settings#variables`}
                title="Project settings"
                class="link">
                project settings</a
            >.
        </p>
    {/if}
    <svelte:fragment slot="aside">
        <div class="u-flex u-flex-vertical-mobile u-main-space-between u-gap-16 u-flex-wrap">
            <ul class="buttons-list">
                <li class="buttons-list-item padding-start">
                    <Button text on:click={() => (showEditorModal = true)}>
                        <span class="icon-code" />
                        <span class="text">Editor</span>
                    </Button>
                </li>
                <li class="buttons-list-item">
                    <Button text on:click={() => (showVariablesUpload = true)}>
                        <span class="icon-upload" />
                        <span class="text">Import .env file</span>
                    </Button>
                </li>
            </ul>

            <Button secondary on:click={() => (showVariablesModal = true)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create variable</span>
            </Button>
        </div>
        {@const sum = variableList.total}
        {#if sum}
            <div class="u-flex u-flex-vertical u-gap-24">
                {#if conflictVariables.length > 0}
                    <Alert type="warning">
                        <p class="text">
                            {#if conflictVariables.length === 1}
                                <b class="u-bold">{conflictVariables[0].key}</b> has
                            {:else}
                                Some environment variables have
                            {/if}
                            a naming conflict with a global variable. View global variables in
                            <a
                                href={`${base}/project-${$project.region}-${$project.$id}/settings`}
                                title="Project settings"
                                class="link">
                                project settings</a
                            >.
                        </p>
                    </Alert>
                {/if}
                <Table noMargin noStyles>
                    <TableHeader>
                        <TableCellHead width={100}>Key</TableCellHead>
                        <TableCellHead width={180}>Value</TableCellHead>
                        <TableCellHead width={40} />
                    </TableHeader>
                    <TableBody>
                        {#each variableList.variables.slice(offset, offset + limit) as variable, i}
                            <TableRow>
                                <TableCell title="key">
                                    {@const isConflicting = globalVariableList
                                        ? globalVariableList.variables.find(
                                              (globalVariable) =>
                                                  globalVariable.key === variable.key
                                          ) !== undefined
                                        : false}
                                    <div
                                        class={isConflicting && hasConflictOnPage
                                            ? 'u-flex u-gap-4 u-cross-center'
                                            : ''}>
                                        {#if isConflicting && hasConflictOnPage}
                                            <span
                                                class="icon-exclamation u-color-text-warning"
                                                aria-hidden="true" />
                                        {/if}

                                        <Output value={variable.key} hideCopyIcon>
                                            {variable.key}
                                        </Output>
                                    </div>
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
                                            <span class="icon-dots-horizontal" aria-hidden="true" />
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
                                            {#if !isGlobal}
                                                <DropListItem
                                                    icon="globe-alt"
                                                    on:click={async () => {
                                                        selectedVar = variable;
                                                        showVariablesDropdown[i] = false;
                                                        showPromoteModal = true;
                                                    }}>
                                                    Promote
                                                </DropListItem>
                                            {/if}
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
                <div class="u-flex u-main-space-between">
                    <p class="text">Total variables: {sum}</p>
                    <PaginationInline {sum} {limit} bind:offset hidePages />
                </div>
            </div>
        {:else}
            <Empty on:click={() => (showVariablesModal = true)}>
                Create a {isGlobal ? 'global variable' : 'variable'} to get started
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showVariablesModal}
    <CreateVariable
        {isGlobal}
        bind:selectedVar
        bind:showCreate={showVariablesModal}
        on:created={handleVariableCreated}
        on:updated={handleVariableUpdated} />
{/if}

{#if showEditorModal}
    <RawVariableEditor
        {isGlobal}
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        {variableList}
        bind:showEditor={showEditorModal} />
{/if}

{#if showPromoteModal}
    <PromoteVariableModal
        isConflicting={globalVariableList
            ? globalVariableList.variables.find(
                  (globalVariable) => globalVariable.key === selectedVar.key
              ) !== undefined
            : false}
        bind:selectedVar
        bind:showPromote={showPromoteModal}
        on:promoted={() => handleVariablePromoted(selectedVar)} />
{/if}

{#if showVariablesUpload}
    <UploadVariables
        {isGlobal}
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {variableList}
        bind:show={showVariablesUpload} />
{/if}

<style>
    .padding-start {
        margin-left: -1rem;
    }
</style>
