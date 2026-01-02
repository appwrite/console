<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Box, CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import Delete from './delete.svelte';
    import UpdateExpirationDate from './updateExpirationDate.svelte';
    import type { Models } from '@appwrite.io/console';
    import { symmetricDifference } from '$lib/helpers/array';
    import Scopes from '../api-keys/scopes.svelte';
    import { InteractiveText, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getEffectiveScopes } from '../api-keys/scopes.svelte';

    export let key: Models.DevKey | Models.Key;
    export let keyType: 'api' | 'dev' | 'organization' | 'account' = 'api';

    let name: string = null;
    let scopes: string[] = null;

    function getCardTitle() {
        switch (keyType) {
            case 'api':
            case 'dev':
            case 'organization':
                return 'Key details';
            case 'account':
                return 'Token details';
        }
    }

    function getLabel() {
        switch (keyType) {
            case 'api':
                return 'API key';
            case 'dev':
                return 'Dev key';
            case 'organization':
                return 'Organization key';
            case 'account':
                return 'Account token';
        }
    }

    function getEvent() {
        switch (keyType) {
            case 'api':
                return Submit.KeyUpdateName;
            case 'dev':
                return Submit.DevKeyUpdateName;
            case 'organization':
                return Submit.OrganizationKeyUpdateName;
            case 'account':
                return Submit.AccountTokenUpdateName;
        }
    }

    function getScopeUpdateEvent() {
        switch (keyType) {
            case 'api':
                return Submit.KeyUpdateScopes;
            case 'organization':
                return Submit.OrganizationKeyUpdateScopes;
            case 'account':
                return Submit.AccountTokenUpdateScopes;
            default:
                return Submit.KeyUpdateScopes;
        }
    }

    function getDependency() {
        switch (keyType) {
            case 'api':
                return Dependencies.KEY;
            case 'dev':
                return Dependencies.DEV_KEY;
            case 'organization':
                return Dependencies.ORGANIZATION;
            case 'account':
                return Dependencies.ACCOUNT;
        }
    }

    function hasScopes() {
        switch (keyType) {
            case 'api':
            case 'organization':
            case 'account':
                return true;
            case 'dev':
                return false;
        }
    }

    let showDelete = false;

    onMount(() => {
        name ??= key.name;
        if (hasScopes()) {
            scopes ??= (key as Models.Key).scopes;
        }
    });

    function asApiKey(key: Models.Key | Models.DevKey) {
        return key as Models.Key;
    }

    async function updateName() {
        try {
            switch (keyType) {
                case 'api':
                    await sdk.forConsole.projects.updateKey({
                        projectId: $project.$id,
                        keyId: key.$id,
                        name,
                        scopes: asApiKey(key).scopes,
                        expire: key.expire
                    });
                    break;
                case 'dev':
                    await sdk.forConsole.projects.updateDevKey({
                        projectId: $project.$id,
                        keyId: key.$id,
                        name,
                        expire: key.expire
                    });
                    break;
                case 'account':
                    await sdk.forConsole.account.updateKey({
                        keyId: key.$id,
                        name,
                        expire: key.expire,
                        scopes: asApiKey(key).scopes
                    });
                    break;
                case 'organization':
                    await sdk.forConsole.organizations.updateKey({
                        organizationId: page.params.organization,
                        keyId: key.$id,
                        name,
                        expire: key.expire,
                        scopes: asApiKey(key).scopes
                    });
                    break;
            }

            await invalidate(getDependency());
            trackEvent(getEvent());
            addNotification({
                type: 'success',
                message: `${getLabel()} name has been updated`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, getEvent());
        }
    }

    async function updateScopes() {
        try {
            switch (keyType) {
                case 'api':
                    await sdk.forConsole.projects.updateKey({
                        projectId: $project.$id,
                        keyId: key.$id,
                        name: key.name,
                        scopes,
                        expire: key.expire
                    });
                    break;
                case 'account':
                    await sdk.forConsole.account.updateKey({
                        keyId: key.$id,
                        name: key.name,
                        scopes,
                        expire: key.expire
                    });
                    break;
                case 'organization':
                    await sdk.forConsole.organizations.updateKey({
                        organizationId: page.params.organization,
                        keyId: key.$id,
                        name: key.name,
                        scopes,
                        expire: key.expire
                    });
                    break;
            }
            await invalidate(getDependency());
            trackEvent(getScopeUpdateEvent(), {
                scopes
            });
            addNotification({
                type: 'success',
                message: getLabel() + ' scopes have been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, getScopeUpdateEvent());
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
    <title>{getLabel()} - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
    <CardGrid>
        <svelte:fragment slot="title">{getCardTitle()}</svelte:fragment>
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
            Choose any name that will help you distinguish between {getLabel()}s.
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

    {#if hasScopes() && keyType !== 'dev'}
        <Form onSubmit={updateScopes}>
            {@const apiKey = asApiKey(key)}
            {@const apiKeyCorrectScopes = getEffectiveScopes(apiKey.scopes)}
            {@const currentEffective = scopes ? getEffectiveScopes(scopes) : null}
            <CardGrid>
                <svelte:fragment slot="title">Scopes</svelte:fragment>
                You can choose which permission scope to grant your {getLabel()}. It is a best
                practice to allow only the permissions you need to meet your goals.
                <svelte:fragment slot="aside">
                    {#if scopes !== null}
                        <Scopes type={keyType} bind:scopes />
                    {/if}
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        submit
                        disabled={scopes &&
                            !symmetricDifference(currentEffective, apiKeyCorrectScopes).length}
                        >Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/if}

    <UpdateExpirationDate {keyType} {key} />

    <CardGrid>
        <svelte:fragment slot="title">Delete {getLabel()}</svelte:fragment>
        The {getLabel()} will be permanently deleted. This action is irreversible.
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
