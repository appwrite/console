<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Box, CardGrid, Heading, Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import Scopes from '../scopes.svelte';
    import Delete from './delete.svelte';
    import { key } from './store';
    import UpdateExpirationDate from './updateExpirationDate.svelte';

    let showDelete = false;
    let name: string = null;
    let secret: string = null;
    let scopes: string[] = null;

    onMount(() => {
        name ??= $key.name;
        secret ??= $key.secret;
        scopes ??= $key.scopes;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                name,
                $key.scopes,
                $key.expire
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

    async function updateScopes() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                scopes,
                $key.expire
            );
            await invalidate(Dependencies.KEY);
            trackEvent(Submit.KeyUpdateScopes, {
                scopes
            });
            addNotification({
                type: 'success',
                message: 'API key scopes have been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyUpdateScopes);
        }
    }
</script>

<svelte:head>
    <title>API key - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = $key.accessedAt ? toLocaleDate($key.accessedAt) : 'never'}
    <CardGrid>
        <div data-private>
            <Heading tag="h6" size="7">{$key.name}</Heading>
        </div>
        <svelte:fragment slot="aside">
            <p>
                Last accessed: {accessedAt}<br />
                Scopes granted: {$key.scopes.length}
            </p>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">API key secret</Heading>
        <svelte:fragment slot="aside">
            <Secret copyEvent="key" bind:value={secret} />
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Name</Heading>
            <p class="text">Choose any name that will help you distinguish between API keys.</p>
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
                <Button disabled={name === $key.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updateScopes}>
        <CardGrid>
            <Heading tag="h6" size="7">Scopes</Heading>
            <p class="text">
                You can choose which permission scope to grant your application. It is a best
                practice to allow only the permissions you need to meet your project goals.
            </p>
            <svelte:fragment slot="aside">
                {#if scopes !== null}
                    <Scopes bind:scopes />
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    submit
                    disabled={scopes &&
                        $key?.scopes &&
                        !symmetricDifference(scopes, $key.scopes).length}>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateExpirationDate />

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete API key</Heading>
        </div>
        <p>The API key will be permanently deleted. This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <Box>
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold" data-private>{$key.name}</h6>
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
