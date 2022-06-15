<script lang="ts">
    import { Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';
    import { authMethods, OAuthProviders } from './auth';
    import type { Provider } from './auth';
    import MainAuth from './_mainOAuth.svelte';

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
        <div>
            <h2 class="heading-level-6">Auth Methods</h2>
            <p>Enable the auth methods you wish to use.</p>
        </div>
        <ul class="">
            {#each $authMethods.list as box}
                <li class="form-item ">
                    <label class="label" for={box.method}>{box.label}</label>
                    <div class="input-text-wrapper">
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
                    </div>
                </li>
            {/each}
            <li class="form-item ">
                <label class="label" for="Phone">Phone</label>
                <div class="input-text-wrapper">
                    <span>(soon)</span>
                </div>
            </li>
        </ul>
    </Card>
    <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
    <ul class="grid-box  common-section">
        {#each $OAuthProviders.providers as provider}
            <button
                on:click={() => {
                    selectedProvider = provider;
                    showModal = true;
                }}
                class="card u-flex u-flex-vertical u-cross-center">
                <div class="card-image">
                    <img
                        height="50"
                        width="50"
                        src={`/icons/color/${provider.icon}.svg`}
                        alt={provider.name} />
                </div>
                <p>{provider.name}</p>
                <Pill success={provider.active}>{provider.active ? 'Active' : 'Inactive'}</Pill>
            </button>
        {/each}
    </ul>
</Container>

{#if selectedProvider}
    {#if !selectedProvider?.component}
        <MainAuth provider={selectedProvider} bind:showModal />
    {:else}
        <svelte:component
            this={selectedProvider.component}
            provider={selectedProvider}
            bind:showModal />
    {/if}
{/if}
