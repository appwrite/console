<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
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
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

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
            invalidate(Dependencies.PROJECT);
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
        <CardGrid>
            <Heading tag="h2" size="7">Auth methods</Heading>
            <p>Enable the authentication methods you wish to use.</p>
            <svelte:fragment slot="aside">
                <form class="form">
                    <ul class="form-list is-multiple">
                        {#each $authMethods.list as box}
                            <InputSwitch
                                label={box.label}
                                id={box.method}
                                bind:value={box.value}
                                on:change={() => authUpdate(box)} />
                        {/each}
                    </ul>
                </form>
            </svelte:fragment>
        </CardGrid>
        <section class="common-section">
            <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
            <ul class="grid-box common-section">
                {#each $project.oAuthProviders
                    .filter((p) => p.name !== 'Mock')
                    .sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1)) as provider}
                    {@const oAuthProvider = oAuthProviders[provider.key]}
                    {#if oAuthProvider}
                        <li class="grid-box-item">
                            <button
                                class="card u-flex u-flex-vertical u-cross-center u-width-full-line"
                                on:click={() => {
                                    selectedProvider = provider;
                                    showProvider = true;
                                    trackEvent(`click_select_provider`, {
                                        provider: provider.key.toLowerCase()
                                    });
                                }}>
                                <div class="avatar">
                                    <img
                                        height="20"
                                        width="20"
                                        src={`${base}/icons/${$app.themeInUse}/color/${oAuthProvider.icon}.svg`}
                                        alt={provider.name} />
                                </div>
                                <p class="u-margin-block-start-8">{provider.name}</p>
                                <div class="u-margin-block-start-24">
                                    <Pill success={provider.enabled}>
                                        {provider.enabled ? 'enabled' : 'disabled'}
                                    </Pill>
                                </div>
                            </button>
                        </li>
                    {/if}
                {/each}
            </ul>
        </section>
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
