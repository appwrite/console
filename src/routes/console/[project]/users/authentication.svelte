<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';
    import { authMethods } from '$lib/stores/auth-methods';
    import { OAuthProviders } from '$lib/stores/oauth-providers';
    import { event } from '$lib/actions/analytics';
    import type { Provider } from '$lib/stores/oauth-providers';
    import { app } from '$lib/stores/app';

    $: projectId = $project.$id;
    $: authMethods.load($project);
    $: OAuthProviders.load($project);
    let showModal = false;

    const authUpdate = async (id: string, value: boolean) => {
        try {
            await sdkForConsole.projects.updateAuthStatus(projectId, id, value);
            addNotification({
                type: 'success',
                message: 'Updated project authentication status successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    let selectedProvider: Provider | null = null;

    //TODO: if operation not successful revert switchbox value
</script>

<Container>
    <CardGrid>
        <h2 class="heading-level-7">Authentication Methods</h2>
        <p>Enable the authentication methods you wish to use.</p>
        <svelte:fragment slot="aside">
            <form class="form">
                <ul class="form-list is-multiple">
                    {#each $authMethods.list as box}
                        <InputSwitch
                            label={box.label}
                            id={box.method}
                            bind:value={box.value}
                            on:change={() => {
                                authUpdate(box.method, box.value);
                            }} />
                    {/each}
                </ul>
            </form>
        </svelte:fragment>
    </CardGrid>
    <section class="common-section">
        <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
        <ul class="grid-box common-section">
            {#each $OAuthProviders.providers as provider}
                <button
                    on:click={() => {
                        selectedProvider = provider;
                        showModal = true;
                    }}
                    use:event={{
                        name: 'console_users',
                        action: 'click_update',
                        event: 'click',
                        parameters: {
                            provider: provider.name
                        }
                    }}
                    class="card u-flex u-flex-vertical u-cross-center">
                    <div class="image-item">
                        <img
                            height="20"
                            width="20"
                            src={`/icons/${$app.themeInUse}/color/${provider.icon}.svg`}
                            alt={provider.name} />
                    </div>
                    <p class="u-margin-block-start-8">{provider.name}</p>
                    <div class="u-margin-block-start-24">
                        <Pill success={provider.active}>
                            {provider.active ? 'Enabled' : 'Disabled'}
                        </Pill>
                    </div>
                </button>
            {/each}
        </ul>
    </section>
</Container>

{#if selectedProvider}
    <svelte:component
        this={selectedProvider.component}
        provider={selectedProvider}
        bind:showModal />
{/if}
