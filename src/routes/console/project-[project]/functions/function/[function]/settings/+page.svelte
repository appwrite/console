<script lang="ts">
    import { CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import {
        Button,
        InputNumber,
        InputSelect,
        InputCron,
        Form,
        FormList
    } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { execute, func } from '../store';
    import Delete from './_delete.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import type { Models } from '@aw-labs/appwrite-console';

    const functionId = $page.params.function;
    let showDelete = false;
    let timeout = 0;
    let deployment: Models.Deployment = null;

    onMount(async () => {
        if ($func?.$id !== functionId) {
            await func.load(functionId);
        }
        deployment = await func.getDeployment(functionId, $func.deployment);
        timeout = $func.timeout;
    });

    let options = [
        { label: 'seconds', value: 'seconds' },
        { label: 'minutes', value: 'minutes' }
    ];

    const updateTimeout = async () => {
        try {
            await sdkForProject.functions.update(
                functionId,
                $func.name,
                $func.execute,
                $func.vars,
                $func.events,
                $func.schedule,
                timeout
            );

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
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
                <h6 class="heading-level-7">{$func.name}</h6>
                <p>{$func.runtime}</p>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div class="u-flex u-main-space-between">
                <div>
                    <p>Function ID: {$func.$id}</p>
                    <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                    <p>Updated at: {toLocaleDateTime($func.$updatedAt)}</p>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button text on:click={() => console.log('open Logs')}>View as JSON</Button>
            <Button
                secondary
                on:click={() => {
                    $execute.selected = deployment;
                    $execute.show = true;
                }}>Execute now</Button>
        </svelte:fragment>
    </CardGrid>

    <Form commonSection on:submit={() => console.log($func.schedule)}>
        <CardGrid>
            <h2 class="heading-level-6">Update CRON Schedule</h2>
            <p>
                Set a CRON schedule to trigger your function. Leave blank for no schedule. <a
                    href="#/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">
                    More details on CRON syntax here.</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputCron
                        bind:value={$func.schedule}
                        label="Schedule (CRON Syntax)"
                        id="schedule" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={false} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form commonSection on:submit={updateTimeout}>
        <CardGrid>
            <h2 class="heading-level-6">Update Timeout</h2>
            <p>
                Limit the execution time of your function. Maximum value is 900 seconds (15
                minutes).
            </p>
            <svelte:fragment slot="aside">
                <div class="form u-grid u-gap-16">
                    <ul class="form-list is-multiple">
                        <InputNumber id="length" label="Time" value={timeout} />
                        <InputSelect
                            id="Increment"
                            {options}
                            label="Time Period"
                            value={options[0].value} />
                    </ul>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={true} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <h6 class="heading-level-7">Delete Function</h6>
        <p>
            The function will be permanently deleted, including all deployments associated with it.
            This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold">{$func.name}</h6>
                </svelte:fragment>
                <p>Last Updated: {toLocaleDateTime($func.$updatedAt)}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
