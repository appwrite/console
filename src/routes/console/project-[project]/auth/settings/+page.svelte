<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { authMethods, type AuthMethod } from '$lib/stores/auth-methods';
    import { OAuthProviders } from '$lib/stores/oauth-providers';
    import { app } from '$lib/stores/app';
    import { page } from '$app/stores';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    const projectId = $page.params.project;

    $: {
        authMethods.load($project);
        OAuthProviders.load($project);
    }

    async function authUpdate(box: AuthMethod) {
        try {
            await sdkForConsole.projects.updateAuthStatus(projectId, box.method, box.value);
            addNotification({
                type: 'success',
                message: `${box.label} authentication has been ${
                    box.value ? 'enabled' : 'disabled'
                }`
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

    let selectedProvider: Provider | null = null;
</script>

{#if $authMethods && $OAuthProviders}
    <Container>
        <CardGrid>
            <Heading tag="h2" size="7">Auth Methods</Heading>
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
                {#each $OAuthProviders.providers
                    .filter((p) => p.name !== 'Mock')
                    .sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1)) as provider}
                    <li class="grid-box-item">
                        <button
                            class="card u-flex u-flex-vertical u-cross-center u-width-full-line"
                            on:click={() => {
                                selectedProvider = provider;
                                trackEvent(`click_select_provider`, {
                                    provider: provider.name.toLowerCase()
                                });
                            }}>
                            <div class="image-item">
                                <img
                                    height="20"
                                    width="20"
                                    src={`/icons/${$app.themeInUse}/color/${provider.icon}.svg`}
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
                {/each}
            </ul>
        </section>
    </Container>
{/if}

{#if selectedProvider}
    <svelte:component
        this={selectedProvider.component}
        bind:provider={selectedProvider}
        on:close={() => (selectedProvider = null)} />
{/if}
