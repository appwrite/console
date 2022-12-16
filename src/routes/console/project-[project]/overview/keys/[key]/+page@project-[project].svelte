<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid, Heading, Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText, InputDateTime } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { key } from './store';
    import Scopes from '../scopes.svelte';
    import Delete from './delete.svelte';
    import { trackEvent } from '$lib/actions/analytics';

    let showDelete = false;
    let name: string = '';
    let secret: string = '';
    let expire: string = '';
    let scopes: string[] = [];

    onMount(() => {
        name ??= $key.name;
        secret ??= $key.secret;
        expire ??= $key.expire;
        scopes ??= $key.scopes;
    });

    async function updateName() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                name,
                $key.scopes,
                $key.expire
            );
            invalidate(Dependencies.KEY);
            trackEvent('submit_key_update_name');
            addNotification({
                type: 'success',
                message: 'API Key name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateExpire() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                $key.scopes,
                expire
            );
            invalidate(Dependencies.KEY);
            trackEvent('submit_key_update_expire');
            addNotification({
                type: 'success',
                message: 'API Key expiration has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateScopes() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                scopes,
                $key.expire
            );
            invalidate(Dependencies.KEY);
            trackEvent('submit_key_update_scopes');
            addNotification({
                type: 'success',
                message: 'API Key scopes has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<svelte:head>
    <title>API Key - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = $key.accessedAt ? toLocaleDateTime($key.accessedAt) : 'never'}
    <CardGrid>
        <div>
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
        <Heading tag="h6" size="7">API Key Secret</Heading>
        <svelte:fragment slot="aside">
            <Secret bind:value={secret} />
        </svelte:fragment>
    </CardGrid>

    <Form on:submit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>
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
    <Form on:submit={updateScopes}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Scopes</Heading>
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
    <Form on:submit={updateExpire}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Expiration Date</Heading>
            <p class="text">Choose any name that will help you distinguish between API keys.</p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputDateTime id="expire" label="Expiration Date" bind:value={expire} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={expire === $key.expire} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete API Key</Heading>
        </div>
        <p>The API Key will be permanently deleted. This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <div class="box">
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold">{$key.name}</h6>
                        <p>Last accessed: {accessedAt}</p>
                    </div>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
