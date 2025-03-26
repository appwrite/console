<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Box, CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import Delete from './delete.svelte';
    import UpdateExpirationDate from './updateExpirationDate.svelte';
    import type { Models } from '@appwrite.io/console';
    import { symmetricDifference } from '$lib/helpers/array';
    import Scopes from '../keys/scopes.svelte';
    import { InteractiveText, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let key: Models.DevKey | Models.Key;
    export let keyType: 'api' | 'dev' = 'api';

    let name = null;
    let scopes = null;

    let showDelete = false;
    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'Dev';
    const event = isApiKey ? Submit.KeyUpdateName : Submit.DevKeyUpdateName;
    const dependency = isApiKey ? Dependencies.KEY : Dependencies.DEV_KEY;

    onMount(() => {
        name ??= key.name;
        if (isApiKey) {
            scopes ??= (key as Models.Key).scopes;
        }
    });

    function asApiKey(key: Models.Key | Models.DevKey) {
        return key as Models.Key;
    }

    async function updateName() {
        try {
            isApiKey
                ? await sdk.forConsole.projects.updateKey(
                      $project.$id,
                      key.$id,
                      name,
                      scopes,
                      key.expire
                  )
                : await sdk.forConsole.projects.updateDevKey(
                      $project.$id,
                      key.$id,
                      name,
                      key.expire
                  );
            await invalidate(dependency);
            trackEvent(event);
            addNotification({
                type: 'success',
                message: `${label} key name has been updated`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, event);
        }
    }

    async function updateScopes() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                key.$id,
                key.name,
                scopes,
                key.expire
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

    let tiles: Record<string, string>;
    $: tiles = {
        Name: key.name,
        'Last accessed': key.accessedAt ? toLocaleDate(key.accessedAt) : 'never',
        'Expiration date': key.expire ? toLocaleDateTime(key.expire) : 'never',
        Secret: key.secret
    };
</script>

<svelte:head>
    <title>{label} key - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
    <CardGrid>
        <svelte:fragment slot="title">Key details</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.GridFraction start={1} end={2} gap="xxxl" rowGap="xl">
                {#each Object.entries(tiles) as [label, value]}
                    <Layout.Stack gap="xxxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            {label}
                        </Typography.Text>
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                            {#if label === 'Secret'}
                                <InteractiveText
                                    variant="secret-code"
                                    isVisible={false}
                                    text={value} />
                            {:else}
                                {value}
                            {/if}
                        </Typography.Text>
                    </Layout.Stack>
                {/each}
            </Layout.GridFraction>
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <svelte:fragment slot="title">Name</svelte:fragment>
            Choose any name that will help you distinguish between {label} keys.
            <svelte:fragment slot="aside">
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === key.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    {#if isApiKey}
        <Form onSubmit={updateScopes}>
            {@const apiKey = asApiKey(key)}
            <CardGrid>
                <svelte:fragment slot="title">Scopes</svelte:fragment>
                You can choose which permission scope to grant your application. It is a best practice
                to allow only the permissions you need to meet your project goals.
                <svelte:fragment slot="aside">
                    {#if scopes !== null}
                        <Scopes bind:scopes />
                    {/if}
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        submit
                        disabled={scopes &&
                            apiKey?.scopes &&
                            !symmetricDifference(scopes, apiKey.scopes).length}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/if}

    <UpdateExpirationDate {keyType} {key} />

    <CardGrid>
        <svelte:fragment slot="title">Delete {label} key</svelte:fragment>
        The Dev key will be permanently deleted. This action is irreversible.
        <svelte:fragment slot="aside">
            <Box>
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold" data-private>{key.name}</h6>
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

<Delete {keyType} {key} bind:showDelete />
