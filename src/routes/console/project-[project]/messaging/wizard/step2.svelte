<script lang="ts">
    import { Card } from '$lib/components';
    import UserTargetsModal, { type Target } from '../userTargetsModal.svelte';
    import { ProviderTypes } from '../providerType.svelte';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType, targetsById } from './store';

    let showDropdown = false;
    let targetIdsLength = 0;

    function update(event: CustomEvent<Record<string, Target>>) {
        $targetsById = event.detail;
        showDropdown = false;
    }

    function removeTarget(targetId: string) {
        const { [targetId]: _, ...rest } = $targetsById;
        $targetsById = rest;
    }

    async function beforeSubmit() {
        $messageParams[$providerType].targets = Object.keys($targetsById);
        console.log($messageParams[$providerType]);
    }

    $: targetIdsLength = Object.keys($targetsById).length;
    $: console.log(targetIdsLength);
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Targets</svelte:fragment>
    <!-- TODO: add support for topics -->
    <svelte:fragment slot="subtitle"
        >Select users to whom this message should be directed.</svelte:fragment>
    {#if targetIdsLength == 0}
        <Card>
            <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                    <i class="icon-plus" />
                </Button>
                <div class="common-section">
                    <span class="text"> Select recipients to get started</span>
                </div>
            </div>
        </Card>
    {:else}
        <div class="table-wrapper">
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead width={140}>Target</TableCellHead>
                    <TableCellHead width={32} />
                </TableHeader>
                <TableBody>
                    {#each Object.entries($targetsById) as [targetId, target] (targetId)}
                        <TableRow>
                            <TableCell title="Target">
                                <div class="u-flex u-cross-center">
                                    <span class="text"
                                        >{target.name ? target.name : target.identifier}</span>
                                </div>
                            </TableCell>

                            <TableCell title="Remove" width={40}>
                                <div class="u-flex u-main-end">
                                    <button
                                        class="button is-text is-only-icon"
                                        type="button"
                                        aria-label="delete"
                                        on:click={() => removeTarget(targetId)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add target</span>
        </Button>
    {/if}
</WizardStep>

<UserTargetsModal
    providerType={ProviderTypes.Email}
    bind:show={showDropdown}
    bind:targetsById={$targetsById}
    on:update={update} />
