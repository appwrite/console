<script lang="ts">
    import { page } from '$app/stores';
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
    import type { PageData } from './$types';
    const permissions = ['Users', 'Databases', 'Documents', 'Files', 'Functions'];

    export let data: PageData;

    let isChecking = false;
    let errorMessage = null;
    let errors = {};
    const sourceId = $page.params.source;

    const runChecks = async () => {
        isChecking = true;
        errorMessage = null;

        try {
            let result = await sdkForProject.transfers.validateSource(sourceId);

            addNotification({
                message: `Destination is valid`,
                type: 'success'
            });

            errors = result.errors ?? {};

            isChecking = false;
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message
            });

            errors = error.response.errors ?? {};
            errorMessage = error.message;
        }

        isChecking = false;
    };

    onMount(() => {
        let lastCheck: any = data.source.lastCheck;

        errors = lastCheck.errors ?? {};
        errorMessage = lastCheck.errorMessage ?? null;
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Source Checks</Heading>

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

                        {#if errors[permission] && errors[permission].length > 0}
                            <Helper type="warning">
                                {#each errors[permission] as error}
                                    {error} <br />
                                {/each}
                            </Helper>
                        {/if}
                    </TableCellText>
                    <TableCellText title="Status">
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
                There are errors with the permissions of this source. Please fix the errors and run
                the checks again.
            </p>

            <br />

            <div class="u-flex u-gap-16 u-cross-center card">
                <Output value={errorMessage}>{errorMessage}</Output>
            </div>
        </Card>
    {/if}
</Container>
