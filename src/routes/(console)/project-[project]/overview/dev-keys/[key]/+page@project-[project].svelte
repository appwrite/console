<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Box, CardGrid, Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import Delete from './delete.svelte';
    import { devKey } from './store';
    import UpdateExpirationDate from './updateExpirationDate.svelte';

    let showDelete = false;
    let name: string = null;
    let secret: string = null;

    onMount(() => {
        name ??= $devKey.name;
        secret ??= $devKey.secret;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateDevKey(
                $project.$id,
                $devKey.$id,
                name,
                $devKey.expire
            );
            await invalidate(Dependencies.KEY);
            trackEvent(Submit.KeyUpdateName);
            addNotification({
                type: 'success',
                message: 'API key name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyUpdateName);
        }
    }
</script>

<svelte:head>
    <title>Dev key - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = $devKey.accessedAt ? toLocaleDate($devKey.accessedAt) : 'never'}
    <CardGrid>
        <svelte:fragment slot="title">{$devKey.name}</svelte:fragment>
        <svelte:fragment slot="aside">Last accessed: {accessedAt}</svelte:fragment>
    </CardGrid>

    <CardGrid>
        <svelte:fragment slot="title">Dev key secret</svelte:fragment>
        <svelte:fragment slot="aside">
            <Secret copyEvent="key" bind:value={secret} />
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <svelte:fragment slot="title">Name</svelte:fragment>
            Choose any name that will help you distinguish between Dev keys.
            <svelte:fragment slot="aside">
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $devKey.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateExpirationDate />

    <CardGrid>
        <svelte:fragment slot="title">Delete Dev key</svelte:fragment>
        The Dev key will be permanently deleted. This action is irreversible.
        <svelte:fragment slot="aside">
            <Box>
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold" data-private>{$devKey.name}</h6>
                        <p>Last accessed: {accessedAt}</p>
                    </div>
                </div>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
