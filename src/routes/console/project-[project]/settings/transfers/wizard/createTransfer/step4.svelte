<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createTransfer } from '../store';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import Pill from '$lib/elements/pill.svelte';
    import Card from '$lib/components/card.svelte';
    import Heading from '$lib/components/heading.svelte';
    import Output from '$lib/components/output.svelte';
    import Helper from '$lib/elements/forms/helper.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    const permissions = ['Users', 'Databases', 'Documents', 'Files', 'Functions'];
    let isChecking = false;
    let errorMessage = null;
    let sourceErrors = {};
    let destinationErrors = {};
    let canProgress = false;

    async function validate() {
        isChecking = true;
        errorMessage = null;
        canProgress = false;

        try {
            await sdkForProject.transfers.validateSource(
                $createTransfer.source,
                $createTransfer.resources
            );
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message
            });

            sourceErrors = error.response.errors ?? {};
            errorMessage = error.message;
            canProgress = false;
        }

        try {
            await sdkForProject.transfers.validateDestination(
                $createTransfer.destination,
                $createTransfer.resources
            );
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message
            });

            destinationErrors = error.response.errors ?? {};
            errorMessage = error.message;
            canProgress = false;
        }

        if (!errorMessage) {
            canProgress = true;
        }

        isChecking = false;
    }

    onMount(async () => {
        validate();
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Validation</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please wait while we perform validiation checks.</svelte:fragment>
    <input class="u-hide" type="checkbox" name="isVerified" required bind:checked={canProgress} />
    <div>
        <TableScroll>
            <TableHeader>
                <TableCellHead width={60}>Permission</TableCellHead>
                <TableCellHead width={60}>Source Status</TableCellHead>
                <TableCellHead width={60}>Destination Status</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each permissions as permission}
                    <TableRow>
                        <TableCellText title="Permission">
                            {permission}

                            {#if (sourceErrors[permission] && sourceErrors[permission].length > 0) || (destinationErrors[permission] && destinationErrors[permission].length > 0)}
                                <Helper type="warning">
                                    {#each sourceErrors[permission] as error}
                                        {error} <br />
                                    {/each}
                                    {#each destinationErrors[permission] as error}
                                        {error} <br />
                                    {/each}
                                </Helper>
                            {/if}
                        </TableCellText>
                        <TableCellText title="Source Status">
                            <Pill
                                danger={sourceErrors[permission]}
                                success={!sourceErrors[permission]}
                                warning={isChecking}>
                                {#if !sourceErrors[permission] && !isChecking}
                                    <span class="icon-check-circle" aria-hidden="true" />
                                {:else if isChecking}
                                    <span class="icon-question-mark-circle" aria-hidden="true" />
                                {:else}
                                    <span class="icon-x-circle" aria-hidden="true" />
                                {/if}
                            </Pill>
                        </TableCellText>
                        <TableCellText title="Destination Status">
                            <Pill
                                danger={destinationErrors[permission]}
                                success={!destinationErrors[permission]}
                                warning={isChecking}>
                                {#if !destinationErrors[permission] && !isChecking}
                                    <span class="icon-check-circle" aria-hidden="true" />
                                {:else if isChecking}
                                    <span class="icon-question-mark-circle" aria-hidden="true" />
                                {:else}
                                    <span class="icon-x-circle" aria-hidden="true" />
                                {/if}
                            </Pill>
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>

        {#if errorMessage}
            <Card danger>
                <div class="u-gap-16">
                    <Heading tag="h6" size="7">Validation Failed</Heading>
                </div>

                <p>
                    There were errors when validating this source. Please go back and fix the errors
                    then run the checks again.
                </p>

                <br />

                <div class="u-flex u-gap-16 u-cross-center card">
                    <Output value={errorMessage}>{errorMessage}</Output>
                </div>

                <br />

                <Button disabled={isChecking} on:click={validate}>
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">Re-run Checks</span>
                </Button>
            </Card>
        {/if}
    </div>
</WizardStep>
