<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { CardGrid, Empty, Output, PaginationInline } from '$lib/components';
    import UploadVariables from './uploadVariablesModal.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '$routes/(console)/project-[project]/store';
    import PromoteVariableModal from './promoteVariableModal.svelte';
    import CreateVariable from './createVariableModal.svelte';
    import RawVariableEditor from './rawVariableEditor.svelte';
    import { base } from '$app/paths';
    import {
        ActionMenu,
        Badge,
        InteractiveText,
        Icon,
        Layout,
        Popover,
        Table,
        Alert
    } from '@appwrite.io/pink-svelte';
    import {
        IconCode,
        IconDotsHorizontal,
        IconEyeOff,
        IconGlobeAlt,
        IconPencil,
        IconPlus,
        IconTrash,
        IconUpload
    } from '@appwrite.io/pink-icons-svelte';
    import Link from '$lib/elements/link.svelte';
    import Copy from '$lib/components/copy.svelte';
    import { page } from '$app/stores';
    import UpdateVariablesModal from './updateVariablesModal.svelte';
    import SecretVariableModal from './secretVariableModal.svelte';

    export let variableList: Models.VariableList;
    export let globalVariableList: Models.VariableList | undefined = undefined;
    export let analyticsSource = '';
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

    let selectedVar: Models.Variable = null;
    let showVariablesUpload = false;
    let showVariablesModal = false;
    let showPromoteModal = false;
    let showEditorModal = false;
    let showUpdate = false;
    let showSecretModal = false;
    let offset = 0;
    const limit = 10;

    async function handleVariableCreated(event: CustomEvent<Models.Variable[]>) {
        const variables = event.detail;
        console.log(variables);
        try {
            const promises = variables.map((variable) =>
                sdkCreateVariable(variable.key, variable.value, variable?.secret || false)
            );
            await Promise.all(promises);
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
    async function handleVariableSecret(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;
        console.log(variable);
        try {
            await sdkUpdateVariable(variable.$id, variable.key, variable.value, variable.secret);
            selectedVar = null;
            showVariablesModal = false;
            addNotification({
                type: 'success',
                message: `${$project.name} ${
                    isGlobal ? 'global variable' : 'variable'
                } has been marked as secret.`
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
                if (product === 'site') {
                    await sdk.forProject.sites.deleteVariable(variable.resourceId, variable.$id);
                } else {
                    await sdk.forProject.functions.deleteVariable(
                        variable.resourceId,
                        variable.$id
                    );
                }
            } else {
                await sdk.forProject.projectApi.createVariable(
                    variable.key,
                    variable.value,
                    variable.secret
                );
                if (product === 'site') {
                    await sdk.forProject.sites.deleteVariable(variable.resourceId, variable.$id);
                } else {
                    await sdk.forProject.functions.deleteVariable(
                        variable.resourceId,
                        variable.$id
                    );
                }
            }

            selectedVar = null;
            showPromoteModal = false;

            await Promise.all([
                invalidate(Dependencies.FUNCTION),
                invalidate(Dependencies.VARIABLES),
                invalidate(Dependencies.PROJECT_VARIABLES),
                invalidate(Dependencies.SITE)
            ]);

            addNotification({
                type: 'success',
                message: `Variable has been ${isConflicting ? 'overwritten' : 'promoted'}. You can find it in the project settings.`,
                buttons: [
                    {
                        method: () => goto(`${base}/project-${$page.params.project}/settings`),
                        name: 'Go to settings'
                    }
                ]
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
    <svelte:fragment slot="title"
        >{isGlobal ? 'Global variables' : 'Environment variables'}</svelte:fragment>
    {#if isGlobal}
        Set the environment variables or secret keys that will be passed to all Functions and Sites
        within your project.
    {:else}
        Set the environment variables or secret keys that will be passed to your {product}. Global
        variables can be found in <Link href={`${base}/project-${$project.$id}/settings#variables`}>
            project settings</Link
        >.
    {/if}
    <svelte:fragment slot="aside">
        <Layout.Stack gap="l">
            <Layout.Stack direction="row">
                <Layout.Stack direction="row" gap="s">
                    <Button
                        secondary
                        on:mousedown={() => {
                            showEditorModal = true;
                            trackEvent(Click.VariablesUpdateClick, { source: analyticsSource });
                        }}>
                        <Icon slot="start" icon={IconCode} /> Editor
                    </Button>
                    <Button
                        secondary
                        on:mousedown={() => {
                            showEditorModal = true;
                            trackEvent(Click.VariablesUpdateClick, { source: analyticsSource });
                        }}>
                        <Icon slot="start" icon={IconUpload} /> Import .env
                    </Button>
                </Layout.Stack>
                {#if variableList.total}
                    <Button
                        secondary
                        on:mousedown={() => {
                            showVariablesModal = true;
                            trackEvent(Click.VariablesCreateClick, { source: 'project_settings' });
                        }}>
                        <Icon slot="start" icon={IconPlus} /> Create variable
                    </Button>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
        {@const sum = variableList.total}
        {#if sum}
            <Layout.Stack gap="l">
                {#if conflictVariables.length > 0}
                    <Alert.Inline status="warning">
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
                    </Alert.Inline>
                {/if}
                <Table.Root
                    columns={[
                        { id: 'key', width: { min: 200, max: 400 } },
                        { id: 'value', width: { min: 200, max: 400 } },
                        { id: 'actions', width: 50 }
                    ]}
                    let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="key" {root}>Key</Table.Header.Cell>
                        <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    {#each variableList.variables.slice(offset, offset + limit) as variable}
                        <Table.Row.Base {root}>
                            <Table.Cell column="key" {root}>
                                {@const isConflicting = globalVariableList
                                    ? globalVariableList.variables.find(
                                          (globalVariable) => globalVariable.key === variable.key
                                      ) !== undefined
                                    : false}

                                <Layout.Stack gap="xxs" alignItems="center" direction="row">
                                    {#if isConflicting && hasConflictOnPage}
                                        <span
                                            class="icon-exclamation u-color-text-warning"
                                            aria-hidden="true"></span>
                                    {/if}
                                    <Copy value={variable.key} />
                                    <Output value={variable.key} hideCopyIcon>
                                        {variable.key}
                                    </Output>
                                </Layout.Stack>
                            </Table.Cell>

                            <Table.Cell column="value" {root}>
                                {#if variable.secret}
                                    <Badge content="Secret" variant="secondary" />
                                {:else}
                                    <InteractiveText
                                        variant="secret"
                                        isVisible={false}
                                        text={variable.value} />
                                {/if}
                            </Table.Cell>
                            <Table.Cell column="actions" {root}>
                                <Popover placement="bottom-end" let:toggle padding="none">
                                    <Button
                                        text
                                        icon
                                        on:click={(e) => {
                                            e.preventDefault();
                                            toggle(e);
                                        }}>
                                        <Icon size="s" icon={IconDotsHorizontal} />
                                    </Button>
                                    <svelte:fragment slot="tooltip" let:toggle>
                                        <ActionMenu.Root>
                                            {#if !variable.secret}
                                                <ActionMenu.Item.Button
                                                    trailingIcon={IconPencil}
                                                    on:click={(e) => {
                                                        selectedVar = variable;
                                                        showUpdate = true;
                                                        toggle(e);
                                                    }}>
                                                    Update
                                                </ActionMenu.Item.Button>
                                                <ActionMenu.Item.Button
                                                    trailingIcon={IconEyeOff}
                                                    on:click={(e) => {
                                                        selectedVar = variable;
                                                        showSecretModal = true;
                                                        toggle(e);
                                                    }}>
                                                    Secret
                                                </ActionMenu.Item.Button>
                                            {/if}
                                            {#if !isGlobal}
                                                <ActionMenu.Item.Button
                                                    trailingIcon={IconGlobeAlt}
                                                    on:click={async (e) => {
                                                        selectedVar = variable;
                                                        showPromoteModal = true;
                                                        toggle(e);
                                                    }}>
                                                    Promote
                                                </ActionMenu.Item.Button>
                                            {/if}
                                            <ActionMenu.Item.Button
                                                status="danger"
                                                trailingIcon={IconTrash}
                                                on:click={async (e) => {
                                                    handleVariableDeleted(variable);
                                                    toggle(e);
                                                }}>
                                                Delete
                                            </ActionMenu.Item.Button>
                                        </ActionMenu.Root>
                                    </svelte:fragment>
                                </Popover>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
                {#if sum > limit}
                    <Layout.Stack direction="row" justifyContent="space-between">
                        <p class="text">Total variables: {sum}</p>
                        <PaginationInline {sum} {limit} bind:offset hidePages />
                    </Layout.Stack>
                {/if}
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
        bind:showCreate={showVariablesModal}
        on:created={handleVariableCreated} />
{/if}

{#if showUpdate}
    <UpdateVariablesModal
        {isGlobal}
        {product}
        bind:selectedVar
        bind:show={showUpdate}
        on:updated={handleVariableUpdated} />
{/if}
{#if showSecretModal}
    <SecretVariableModal
        bind:show={showSecretModal}
        {selectedVar}
        on:updated={handleVariableSecret} />
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
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {variableList}
        bind:show={showVariablesUpload} />
{/if}
