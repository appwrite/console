<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { authMethods, type AuthMethod } from '$lib/stores/auth-methods';
    import { addNotification } from '$lib/stores/notifications';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { project } from '../../store';
    import { base } from '$app/paths';
    import { Avatar, Badge, Card, Layout, Typography } from '@appwrite.io/pink-svelte';

    const projectId = $page.params.project;
    let showProvider = false;

    let selectedProvider: Models.AuthProvider | null = null;

    async function authUpdate(box: AuthMethod) {
        try {
            await sdk.forConsole.projects.updateAuthStatus(projectId, box.method, box.value);
            addNotification({
                type: 'success',
                message: `${box.label} authentication has been updated`
            });
            trackEvent(Submit.AuthStatusUpdate, {
                method: box.method,
                value: box.value
            });
        } catch (error) {
            box.value = !box.value;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthStatusUpdate);
        }
    }

    $: authMethods.load($project);
</script>

{#if $authMethods && $project}
    <Container>
        <Layout.Stack gap="xxl">
            <CardGrid>
                <svelte:fragment slot="title">Auth methods</svelte:fragment>
                Enable the authentication methods you wish to use.
                <svelte:fragment slot="aside">
                    <Layout.Stack gap="l" direction="row" wrap="wrap">
                        {#each $authMethods.list as box}
                            <div style="flex-basis: 45%;">
                                <InputSwitch
                                    label={box.label}
                                    id={box.method}
                                    bind:value={box.value}
                                    on:change={() => authUpdate(box)} />
                            </div>
                        {/each}
                    </Layout.Stack>
                </svelte:fragment>
            </CardGrid>
            <Layout.Stack>
                <Typography.Title size="s">OAuth2 Providers</Typography.Title>
                <ul class="grid-box" style:--grid-gap="1rem" style:--grid-item-size="15rem">
                    {#each $project.oAuthProviders
                        .filter((p) => p.name !== 'Mock')
                        .sort( (a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1) ) as provider}
                        {@const oAuthProvider = oAuthProviders[provider.key]}
                        {#if oAuthProvider}
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
    {@const oAuthProvider = oAuthProviders[selectedProvider.key]}
    <svelte:component
        this={oAuthProvider.component}
        bind:provider={selectedProvider}
        bind:show={showProvider}
        on:close={() => {
            selectedProvider = null;
            showProvider = false;
        }} />
{/if}
