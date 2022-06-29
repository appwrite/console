<script lang="ts">
    import { Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';
    import { authMethods, OAuthProviders } from './auth';
    import type { Provider } from './auth';

    $: projectId = $project.$id;
    $: authMethods.load($project);
    $: OAuthProviders.load($project);
    let showModal = false;

    const authUpdate = async (id: string, value: boolean) => {
        try {
            await sdkForConsole.projects.updateAuthStatus(projectId, id, value);
            addNotification({
                type: 'success',
                message: 'Updated project auth status successfully'
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
    <Card>
        <div class="common-section grid-1-2">
            <div class="grid-1-2-col-1">
                <h2 class="heading-level-7">Auth Methods</h2>
                <p>Enable the auth methods you wish to use.</p>
            </div>
            <div class="grid-1-2-col-2">
                <form class="form">
                    <ul class="form-list is-multiple">
                        {#each $authMethods.list as box}
                            <li class="form-item ">
                                <label class="choice-item" for={box.method}>
                                    <input
                                        label={box.label}
                                        id={box.method}
                                        type="checkbox"
                                        class="switch"
                                        role="switch"
                                        bind:checked={box.value}
                                        on:change={() => {
                                            authUpdate(box.method, box.value);
                                        }} />
                                    <div class="choice-item-content">
                                        <div class="choice-item-title">{box.label}</div>
                                    </div>
                                </label>
                            </li>
                        {/each}
                        <li class="form-item ">
                            <label class="choice-item" for="phone">
                                <input
                                    label="Phone"
                                    id="phone"
                                    type="checkbox"
                                    class="switch"
                                    role="switch"
                                    disabled />
                                <div class="choice-item-content">
                                    <div class="choice-item-title">Phone</div>
                                    <span class="choice-item-paragraph">(soon)</span>
                                </div>
                            </label>
                        </li>
                    </ul>
                </form>
            </div>
        </div>
    </Card>
    <section class="common-section">
        <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
        <ul class="grid-box common-section">
            {#each $OAuthProviders.providers as provider}
                <button
                    on:click={() => {
                        selectedProvider = provider;
                        showModal = true;
                    }}
                    class="card u-flex u-flex-vertical u-cross-center">
                    <div class="image-item">
                        <img
                            height="20"
                            width="20"
                            src={`/icons/color/${provider.icon}.svg`}
                            alt={provider.name} />
                    </div>
                    <p class="u-margin-block-start-8">{provider.name}</p>
                    <div class="u-margin-block-start-24">
                        <Pill success={provider.active}
                            >{provider.active ? 'Enabled' : 'Disabled'}</Pill>
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
