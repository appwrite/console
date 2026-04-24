<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { InputSwitch } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { authMethods, type AuthMethod } from '$lib/stores/auth-methods';
    import { addNotification } from '$lib/stores/notifications';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import { MethodId, type Models } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import {
        Avatar,
        Badge,
        Card,
        Dialog,
        Divider,
        Layout,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';
    import type { PageProps } from './$types';
    import { SvelteSet } from 'svelte/reactivity';
    import { get } from 'svelte/store';

    let { data }: PageProps = $props();
    /** Must stay derived from `data` so OAuth/auth toggles reflect `invalidate(Dependencies.PROJECT)` without a full reload. */
    const project = $derived(data.project);

    let showProvider = $state(false);
    let selectedProvider: Models.AuthProvider | null = $state(null);
    let isUpdatingAllAuthMethods = $state(false);
    let showUpdateAuthMethodsDialog = $state(false);
    let updateAuthMethodsEnabledMode = $state<boolean | null>(null);
    let apiAuthMethodUpdates = new SvelteSet<MethodId>();

    const isAnyAuthMethodUpdating = $derived(apiAuthMethodUpdates.size > 0);
    const isAnyUpdateInProgress = $derived(isUpdatingAllAuthMethods || isAnyAuthMethodUpdating);

    const allAuthMethodsEnabled = $derived.by(() => {
        if (isAnyUpdateInProgress) return false;
        return $authMethods.list.every((method) => method.value);
    });

    const allAuthMethodsDisabled = $derived.by(() => {
        if (isAnyUpdateInProgress) return false;
        return $authMethods.list.every((method) => !method.value);
    });

    const shouldDisableEnableAllButton = $derived(isAnyUpdateInProgress || allAuthMethodsEnabled);
    const shouldDisableDisableAllButton = $derived(isAnyUpdateInProgress || allAuthMethodsDisabled);

    async function authUpdate(box: AuthMethod) {
        apiAuthMethodUpdates.add(box.method);
        try {
            await sdk.forProject(project.region, project.$id).project.updateAuthMethod({
                methodId: box.method,
                enabled: box.value
            });
            addNotification({
                type: 'success',
                message: `${box.label} authentication has been updated`
            });
            trackEvent(Submit.AuthStatusUpdate, {
                method: box.method,
                value: box.value
            });
            await invalidate(Dependencies.PROJECT);
        } catch (error) {
            box.value = !box.value;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthStatusUpdate);
        } finally {
            apiAuthMethodUpdates.delete(box.method);
        }
    }

    async function toggleAllAuthMethods(status: boolean | null) {
        if (status === null) return;

        isUpdatingAllAuthMethods = true;

        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            for (const method of get(authMethods).list) {
                if (method.value === status) continue;
                await projectSdk.updateAuthMethod({
                    methodId: method.method,
                    enabled: status
                });
            }

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message:
                    'All authentication methods for ' +
                    project.name +
                    ' have been ' +
                    (status ? 'enabled.' : 'disabled.')
            });
            trackEvent(Submit.AuthStatusUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthStatusUpdate);
        } finally {
            await invalidate(Dependencies.PROJECT);
            isUpdatingAllAuthMethods = false;
            showUpdateAuthMethodsDialog = false;
            updateAuthMethodsEnabledMode = null;
        }
    }

    const dialogDetails = $derived.by(() => {
        if (updateAuthMethodsEnabledMode) {
            return {
                title: 'Enable all auth methods',
                message: 'All authentication methods will be enabled.',
                actionButton: 'Enable all'
            };
        }

        return {
            title: 'Disable all auth methods',
            message:
                'Are you sure you want to disable all authentication methods? This will prevent users from signing in until at least one method is re-enabled.',
            actionButton: 'Disable all'
        };
    });

    $effect(() => {
        authMethods.load(project);
    });
</script>

{#if $authMethods && project}
    <Container>
        <Layout.Stack gap="xxl">
            <CardGrid>
                <svelte:fragment slot="title">Auth methods</svelte:fragment>
                Enable the authentication methods you wish to use.
                <svelte:fragment slot="aside">
                    <Layout.Stack gap="m" class="auth-methods-list">
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Button
                                extraCompact
                                on:click={() => {
                                    showUpdateAuthMethodsDialog = true;
                                    updateAuthMethodsEnabledMode = true;
                                }}
                                disabled={shouldDisableEnableAllButton}>Enable all</Button>
                            <span style:height="20px">
                                <Divider vertical />
                            </span>
                            <Button
                                extraCompact
                                on:click={() => {
                                    showUpdateAuthMethodsDialog = true;
                                    updateAuthMethodsEnabledMode = false;
                                }}
                                disabled={shouldDisableDisableAllButton}>Disable all</Button>
                        </Layout.Stack>
                        <Layout.Stack gap="l">
                            <Divider />
                            <Layout.Stack direction="row" wrap="wrap">
                                {#each $authMethods.list as box}
                                    <span style:flex-basis="30%">
                                        <Layout.Stack direction="row" alignItems="center">
                                            <InputSwitch
                                                label={box.label}
                                                id={box.method}
                                                bind:value={box.value}
                                                disabled={apiAuthMethodUpdates.has(box.method)}
                                                on:change={() => authUpdate(box)} />

                                            {#if apiAuthMethodUpdates.has(box.method)}
                                                <span style:opacity="0.75">
                                                    <Spinner size="s" />
                                                </span>
                                            {/if}
                                        </Layout.Stack>
                                    </span>
                                {/each}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Layout.Stack>
                </svelte:fragment>
            </CardGrid>
            <Layout.Stack>
                <Typography.Title size="s">OAuth2 Providers</Typography.Title>
                <ul class="grid-box" style:--grid-gap="1rem" style:--grid-item-size="15rem">
                    {#each project.oAuthProviders
                        .filter((p) => p.name !== 'Mock')
                        .sort( (a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1) ) as provider}
                        {@const oAuthProvider = oAuthProviders[provider.key]}
                        {#if oAuthProvider && !oAuthProvider.internal}
                            <Card.Button
                                padding="s"
                                on:click={() => {
                                    selectedProvider = provider;
                                    showProvider = true;
                                    trackEvent(`click_select_provider`, {
                                        provider: provider.key.toLowerCase()
                                    });
                                }}>
                                <Layout.Stack alignItems="flex-start" gap="xxl">
                                    <Layout.Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center">
                                        <Avatar size="s">
                                            <img
                                                height="20"
                                                width="20"
                                                src={`${base}/icons/${$app.themeInUse}/color/${oAuthProvider.icon}.svg`}
                                                alt={provider.name} />
                                        </Avatar>
                                        <Typography.Text>{provider.name}</Typography.Text>
                                    </Layout.Stack>
                                    <Badge
                                        type={provider.enabled ? 'success' : undefined}
                                        variant="secondary"
                                        content={provider.enabled ? 'enabled' : 'disabled'} />
                                </Layout.Stack>
                            </Card.Button>
                        {/if}
                    {/each}
                </ul>
            </Layout.Stack>
        </Layout.Stack>
    </Container>
{/if}

{#if selectedProvider && showProvider}
    {@const OAuthProvider = oAuthProviders[selectedProvider.key].component}

    <OAuthProvider
        bind:provider={selectedProvider}
        bind:show={showProvider}
        onclose={() => {
            selectedProvider = null;
            showProvider = false;
        }} />
{/if}

<Dialog title={dialogDetails.title} bind:open={showUpdateAuthMethodsDialog}>
    <p class="text" data-private>{dialogDetails.message}</p>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (showUpdateAuthMethodsDialog = false)}>Cancel</Button>

            <Button
                secondary
                submissionLoader
                disabled={isUpdatingAllAuthMethods}
                forceShowLoader={isUpdatingAllAuthMethods}
                on:click={() => toggleAllAuthMethods(updateAuthMethodsEnabledMode)}>
                {dialogDetails.actionButton}
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
