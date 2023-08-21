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
    import Variable from '../../createVariable.svelte';
    import UploadVariables from './uploadVariablesModal.svelte';
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { func } from '../store';

    export let variableList: Models.VariableList;
    const functionId = $page.params.function;
    let showVariablesDropdown = [];
    let selectedVar: Models.Variable = null;
    let showVariablesUpload = false;
    let showVariablesModal = false;
    let offset = 0;

    async function handleVariableCreated(event: CustomEvent<Models.Variable>) {
        const variable = event.detail;

        try {
            await sdk.forProject.functions.createVariable(functionId, variable.key, variable.value);
            await invalidate(Dependencies.VARIABLES);
            showVariablesModal = false;
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
            await sdk.forProject.functions.deleteVariable(variable.functionId, variable.$id);
            await invalidate(Dependencies.VARIABLES);
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
        if (variableList.total) {
            let content = variableList.variables
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
</script>

<CardGrid>
    <Heading tag="h6" size="7" id="variables">Variables</Heading>
    <p>Set the variables (or secret keys) that will be passed to your function at runtime.</p>
    <svelte:fragment slot="aside">
        <div class="u-flex u-margin-inline-start-auto u-gap-16">
            <Button
                secondary
                event="download_env"
                disabled={!variableList.total}
                on:click={downloadVariables}>
                <span class="icon-download" />
                <span class="text">Download .env file</span>
            </Button>
            <Button secondary on:click={() => (showVariablesUpload = true)}>
                <span class="icon-upload" />
                <span class="text">Import .env file</span>
            </Button>
        </div>
        {@const limit = 10}
        {@const sum = variableList.total}
        {#if sum}
            <div class="u-flex u-flex-vertical u-gap-16">
                <Table noMargin noStyles>
                    <TableHeader>
                        <TableCellHead>Key</TableCellHead>
                        <TableCellHead width={180}>Value</TableCellHead>
                        <TableCellHead width={30} />
                    </TableHeader>
                    <TableBody>
                        {#each variableList.variables.slice(offset, offset + limit) as variable, i}
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
                <Button text noMargin on:click={() => (showVariablesModal = true)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create variable</span>
                </Button>
                <div class="u-flex u-main-space-between">
                    <p class="text">Total variables: {sum}</p>
                    <PaginationInline {sum} {limit} bind:offset hidePages />
                </div>
            </div>
        {:else}
            <Empty on:click={() => (showVariablesModal = !showVariablesModal)}>
                Create a variable to get started
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>

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
