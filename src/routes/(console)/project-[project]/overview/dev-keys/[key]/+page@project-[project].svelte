<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Box, CardGrid, Heading, Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { devKey } from './store';
    import Delete from '../../components/delete.svelte';
    import UpdateExpirationDate from '../../components/updateExpirationDate.svelte';

    let showDelete = false;
    let name: string = null;
    let secret: string = null;

    onMount(() => {
        name ??= $devKey.name;
        secret ??= $devKey.secret;
    });

    async function updateExpire() {
        try {
            await sdk.forConsole.projects.updateDevKey(
                $project.$id,
                $devKey.$id,
                $devKey.name,
                $devKey.expire
            );
            await invalidate(Dependencies.DEV_KEY);
            trackEvent(Submit.DevKeyUpdateExpire);
            addNotification({
                type: 'success',
                message: 'API key expiration has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DevKeyUpdateExpire);
        }
    }

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateDevKey(
                $project.$id,
                $devKey.$id,
                name,
                $devKey.expire
            );
            await invalidate(Dependencies.DEV_KEY);
            trackEvent(Submit.DevKeyUpdateName);
            addNotification({
                type: 'success',
                message: 'Dev key name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DevKeyUpdateName);
        }
    }
</script>

<svelte:head>
    <title>Dev key - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = $devKey.accessedAt ? toLocaleDate($devKey.accessedAt) : 'never'}
    <CardGrid>
        <div data-private>
            <Heading tag="h6" size="7">{$devKey.name}</Heading>
        </div>
        <svelte:fragment slot="aside">
            <p>
                Last accessed: {accessedAt}<br />
            </p>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Dev key secret</Heading>
        <svelte:fragment slot="aside">
            <Secret copyEvent="key" bind:value={secret} />
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Name</Heading>
            <p class="text">Choose any name that will help you distinguish between Dev keys.</p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="name"
                        label="Name"
                        bind:value={name}
                        required
                        placeholder="Enter name" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $devKey.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateExpirationDate key={$devKey} resourceType="Dev" onSubmit={updateExpire} />

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete Dev key</Heading>
        </div>
        <p>The Dev key will be permanently deleted. This action is irreversible.</p>
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

<Delete bind:showDelete key={$devKey} resourceType="Dev" />
