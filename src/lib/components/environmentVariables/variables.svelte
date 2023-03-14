<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import Copy from '../copy.svelte';
    import Modal from '../modal.svelte';
    import { tooltip } from '$lib/actions/tooltip';
    import DropList from '../dropList.svelte';
    import DropListItem from '../dropListItem.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent } from '$lib/actions/analytics';
    import Snippet from './snippet.svelte';
    import Create from './create.svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import Alert from '../alert.svelte';
    import { page } from '$app/stores';
    import Empty from '../empty.svelte';

    export let variables: { total: number; variables: Partial<Models.Variable>[] };
    export let isShared = false;
    export let isWizard = false;

    export let deleteVariable: (variableId: string) => Promise<void>;
    export let createVariable: (key: string, value: string) => Promise<void>;
    export let updateVariable: (variableId: string, key: string, value: string) => Promise<void>;

    const sharedVariablesUrl = `/console/project-${$page.params.project}/settings/variables`;

    let showPromote = false;
    let promoteVariable: Partial<Models.Variable>;

    let showSnippet = false;
    let snippetKey = '';

    let showVariablesValue = [];
    let showVariablesDropdown = [];

    let showVariablesModal = false;
    let selectedVar: Partial<Models.Variable> = null;

    function downloadVariables() {
        if (variables.total) {
            let content = variables.variables
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

    async function handleVariableDeleted(variable: Partial<Models.Variable>) {
        try {
            await deleteVariable(variable.$id);

            if (!isWizard) {
                invalidate(Dependencies.VARIABLES);
                addNotification({
                    type: 'success',
                    message: `Environment variable has been deleted`
                });
                trackEvent('submit_variable_delete');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function handlePromote(variable: Partial<Models.Variable>) {
        try {
            await sdkForProject.project.createVariable(variable.key, variable.value);
            await deleteVariable(variable.$id);

            if (!isWizard) {
                invalidate(Dependencies.VARIABLES);
                addNotification({
                    type: 'success',
                    message: `Environment variable has been promoted`
                });
                trackEvent('submit_variable_promote');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showPromote = false;
        }
    }

    async function handleVariableCreated(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;

        try {
            await createVariable(variable.key, variable.value);
            showVariablesModal = false;

            if (!isWizard) {
                invalidate(Dependencies.VARIABLES);
                addNotification({
                    type: 'success',
                    message: `Environment variable have been created`
                });
                trackEvent('submit_variable_create');
            }
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
            await updateVariable(variable.$id, variable.key, variable.value);
            selectedVar = null;
            showVariablesModal = false;

            if (!isWizard) {
                invalidate(Dependencies.VARIABLES);
                addNotification({
                    type: 'success',
                    message: `Environment variable have been updated`
                });
                trackEvent('submit_variable_update');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

{#if variables.variables.length}
    {#if !isWizard}
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
    {/if}
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
            {#if variables.total}
                {#each variables.variables as variable, i}
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
                                            (showVariablesValue[i] = !showVariablesValue[i])}
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
                                            <span class="icon-duplicate" aria-hidden="true" />
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
                                        (showVariablesDropdown[i] = !showVariablesDropdown[i])}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem
                                        icon="code"
                                        on:click={() => {
                                            snippetKey = variable.key;
                                            showSnippet = true;
                                        }}>
                                        Code snippets
                                    </DropListItem>
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
                                    {#if !isShared && !isWizard}
                                        <DropListItem
                                            icon="globe"
                                            on:click={() => {
                                                showPromote = true;
                                                promoteVariable = variable;
                                            }}>Promote</DropListItem>
                                    {/if}
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
            <span class="text">Create environment variable</span>
        </button>
    </div>
{:else}
    <Empty on:click={() => (showVariablesModal = !showVariablesModal)}
        >Create an environment variable to get started</Empty>
{/if}

{#if !isShared && !isWizard}
    <Alert type="info">
        Global variables from <a href={sharedVariablesUrl} class="link">project settings</a> are also
        available. When there is name conflict, function variable is used.
    </Alert>
{/if}

<Snippet bind:showSnippet variableKey={snippetKey} />
{#if showVariablesModal}
    <Create
        bind:selectedVar
        bind:showCreate={showVariablesModal}
        on:created={handleVariableCreated}
        on:updated={handleVariableUpdated} />
{/if}

{#if !isShared}
    <Modal bind:show={showPromote} on:submit={() => handlePromote(promoteVariable)} warning>
        <svelte:fragment slot="header">Promote To Global Variable</svelte:fragment>
        <p>
            Are you sure you want to promote <code>{promoteVariable.key}</code>? This will move
            variable into project settings and make it visible to all services.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showPromote = false)}>Cancel</Button>
            <Button secondary submit>Promote</Button>
        </svelte:fragment>
    </Modal>
{/if}
