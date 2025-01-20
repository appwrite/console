<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import {
        CardGrid,
        Heading,
        DropListItem,
        Empty,
        Output,
        PaginationInline
    } from '$lib/components';
    import UploadVariables from './uploadVariablesModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '$routes/(console)/project-[project]/store';
    import Alert from '$lib/components/alert.svelte';
    import PromoteVariableModal from './promoteVariableModal.svelte';
    import CreateVariable from './createVariable.svelte';
    import RawVariableEditor from './rawVariableEditor.svelte';
    import { base } from '$app/paths';
    import { Badge, HiddenText, Icon, Layout, Popover, Table } from '@appwrite.io/pink-svelte';
    import {
        IconCode,
        IconDotsHorizontal,
        IconPlus,
        IconUpload
    } from '@appwrite.io/pink-icons-svelte';
    import Link from '$lib/elements/link.svelte';

    export let variableList: Models.VariableList;
    export let globalVariableList: Models.VariableList | undefined = undefined;

    export let isGlobal: boolean;
    export let sdkCreateVariable: (
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;
    export let sdkDeleteVariable: (variableId: string) => Promise<unknown>;
    export let product: 'function' | 'site' = 'function';

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
            await sdkCreateVariable(variable.key, variable.value, variable.secret);
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
            await sdkUpdateVariable(variable.$id, variable.key, variable.value, variable.secret);
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
                await sdk.forProject.projectApi.deleteVariable(globalVariable.$id);
                await sdk.forProject.projectApi.createVariable(
                    variable.key,
                    variable.value,
                    variable.secret
                );
                await sdk.forProject.functions.deleteVariable(variable.resourceId, variable.$id);
            } else {
                await sdk.forProject.projectApi.createVariable(
                    variable.key,
                    variable.value,
                    variable.secret
                );
                await sdk.forProject.functions.deleteVariable(variable.resourceId, variable.$id);
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
            Set the environment variables or secret keys that will be passed to all functions and
            sites within your project.
        </p>
    {:else}
        <p>
            Set the environment variables or secret keys that will be passed to your {product}.
            Global variables can be found in <Link
                href={`${base}/project-${$project.$id}/settings#variables`}>
                project settings</Link
            >.
        </p>
    {/if}
    <svelte:fragment slot="aside">
        <Layout.Stack justifyContent="space-between" direction="row">
            <Layout.Stack direction="row" gap="s">
                <Button secondary on:click={() => (showEditorModal = true)}>
                    <Icon size="s" icon={IconCode} />
                    <span class="text">Editor</span>
                </Button>
                <Button secondary on:click={() => (showVariablesUpload = true)}>
                    <Icon size="s" icon={IconUpload} />
                    <span class="text">Import .env file</span>
                </Button>
            </Layout.Stack>
            <Button secondary on:click={() => (showVariablesModal = true)}>
                <Icon size="s" icon={IconPlus} />
                <span class="text">Create variable</span>
            </Button>
        </Layout.Stack>
        {@const sum = variableList.total}
        {#if sum}
            <Layout.Stack gap="l">
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
                                href={`${base}/project-${$project.$id}/settings`}
                                title="Project settings"
                                class="link">
                                project settings</a
                            >.
                        </p>
                    </Alert>
                {/if}
                <Table.Root>
                    <svelte:fragment slot="header">
                        <Table.Header.Cell width="180px">Key</Table.Header.Cell>
                        <Table.Header.Cell width="180px">Value</Table.Header.Cell>
                        <Table.Header.Cell width="40px" />
                    </svelte:fragment>
                    {#each variableList.variables.slice(offset, offset + limit) as variable, i}
                        <Table.Row>
                            <Table.Cell>
                                {@const isConflicting = globalVariableList
                                    ? globalVariableList.variables.find(
                                          (globalVariable) => globalVariable.key === variable.key
                                      ) !== undefined
                                    : false}

                                <Layout.Stack gap="xxs" alignItems="center" direction="row">
                                    {#if isConflicting && hasConflictOnPage}
                                        <span
                                            class="icon-exclamation u-color-text-warning"
                                            aria-hidden="true" />
                                    {/if}

                                    <Output value={variable.key} hideCopyIcon>
                                        {variable.key}
                                    </Output>
                                </Layout.Stack>
                            </Table.Cell>

                            <Table.Cell>
                                <div style="max-width: 20rem">
                                    {#if variable.secret}
                                        <Badge content="Secret" variant="secondary" />
                                    {:else}
                                        <HiddenText isVisible={false} text={variable.value} />
                                    {/if}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <div style="margin-inline-start: auto">
                                    <Popover placement="bottom-end" let:toggle>
                                        <Button
                                            text
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="s" icon={IconDotsHorizontal} />
                                        </Button>
                                        <svelte:fragment slot="tooltip">
                                            <Layout.Stack gap="s" alignItems="flex-start">
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
                                            </Layout.Stack>
                                        </svelte:fragment>
                                    </Popover>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Root>
                <Layout.Stack direction="row" justifyContent="space-between">
                    <p class="text">Total variables: {sum}</p>
                    <PaginationInline {sum} {limit} bind:offset hidePages />
                </Layout.Stack>
            </Layout.Stack>
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
        {product}
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
        {product}
        {isGlobal}
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {variableList}
        bind:show={showVariablesUpload} />
{/if}
