<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import Card from '$lib/components/card.svelte';
    import Heading from '$lib/components/heading.svelte';
    import Output from '$lib/components/output.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Helper from '$lib/elements/forms/helper.svelte';
    import Pill from '$lib/elements/pill.svelte';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    const permissions = ['Users', 'Databases', 'Documents', 'Files', 'Functions'];
    let errors = permissions.map((permission) => {
        return {
            [permission]: false
        };
    });

    let isChecking = false;
    let errorMessage = null;
    const destinationId = $page.params.destination;

    const runChecks = async () => {
        isChecking = true;
        errorMessage = null;

        try {
            await sdkForProject.transfers.validateDestination(destinationId);

            isChecking = false;
            trackEvent(Submit.DestinationValidate, {
                customId: !!destinationId
            });
        } catch (error) {
            if (error.response.errors) {
                errors = error.response.errors;
            } else {
                errors = permissions.map((permission) => {
                    return {
                        [permission]: true
                    };
                });
            }

            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message
            });
            errorMessage = error.message;
            console.error(error);
        }

        isChecking = false;
    };

    onMount(() => {
        runChecks();
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Destination Checks</Heading>

        <Button disabled={isChecking} on:click={runChecks}>
            <span class="icon-check-circle" aria-hidden="true" />
            <span class="text">Run Checks</span>
        </Button>
    </div>

    <TableScroll>
        <TableHeader>
            <TableCellHead width={150}>Permission</TableCellHead>
            <TableCellHead width={60}>Status</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each permissions as permission}
                <TableRow>
                    <TableCellText title="Permission">
                        {permission}

                        {#if errors[permission]}
                            <Helper type="warning">
                                {#each errors[permission] as error}
                                    {error} <br />
                                {/each}
                            </Helper>
                        {/if}
                    </TableCellText>
                    <TableCellText title="Permission Level">
                        <Pill
                            danger={errors[permission]}
                            success={!errors[permission]}
                            warning={isChecking}>
                            {#if !errors[permission] && !isChecking}
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
                There are errors with the permissions of this destination. Please fix the errors and
                run the checks again.
            </p>

            <br />

            <div class="u-flex u-gap-16 u-cross-center card">
                <Output value={errorMessage}>{errorMessage}</Output>
            </div>
        </Card>
    {/if}
</Container>
