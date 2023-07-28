<script lang="ts">
    import SvgIcon from '$lib/components/svgIcon.svelte';
    import { Button, FormList, InputNumber, InputPassword, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import type { Provider } from '$lib/stores/migration';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { provider } from '.';

    const providers: Record<Provider, string> = {
        appwrite: 'Appwrite Self-hosted',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };

    function connectGoogle() {
        const redirect = new URL($page.url);
        const target = new URL(
            `${sdk.forProject.client.config.endpoint}/migrations/firebase/connect`
        );
        target.searchParams.set('projectId', $page.params.project);
        target.searchParams.set('redirect', redirect.toString());
        return target;
    }

    function getFirebaseProjects() {
        sdk.forProject.migrations.listFirebaseProjects().then((res) => {
            firebaseProjects = res.projects;
        });
    }

    let firebaseProjects = [];

    let showAuth = false;

    $: if ($provider.provider === 'firebase') {
        getFirebaseProjects();
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Choose provider</svelte:fragment>
    <div class="cards">
        {#each Object.entries(providers) as [key, value]}
            <label
                class="card is-allow-focus u-height-100-percent u-flex u-flex-vertical u-cursor-pointer">
                <input
                    class="is-small"
                    type="radio"
                    name="provider"
                    bind:group={$provider.provider}
                    value={key} />
                <div class="content">
                    <p>{value}</p>
                </div>
            </label>
        {/each}
    </div>

    {#if $provider.provider === 'appwrite'}
        <FormList class="u-margin-block-start-24">
            <InputText
                id="endpoint"
                label="Endpoint"
                required
                placeholder="Enter endpoint"
                bind:value={$provider.endpoint} />
            <InputText
                id="project-id"
                label="Project ID"
                required
                placeholder="Enter project ID"
                bind:value={$provider.projectID} />
            <InputPassword
                id="api-key"
                label="API Key"
                required
                placeholder="Enter API Key"
                showPasswordButton
                bind:value={$provider.apiKey} />
        </FormList>
    {:else if $provider.provider === 'firebase'}
        {#if firebaseProjects.length == 0}
            <div class="box u-flex u-flex-vertical u-gap-16 u-cross-center u-margin-block-start-24">
                <p class="u-text-center u-bold">Sign in with Google to get started</p>
                <Button secondary href={connectGoogle().toString()}>
                    <SvgIcon name="google" />Sign in
                </Button>
            </div>
        {:else}
            {#each firebaseProjects as project}
                <div
                    class="card is-allow-focus u-height-100-percent u-flex u-flex-vertical u-cursor-pointer u-margin-block-start-24">
                    <div class="content">
                        <p>{project.displayName}</p>
                    </div>
                </div>
            {/each}
        {/if}
        <button
            class="tag u-margin-block-start-16"
            type="button"
            on:click={() => (showAuth = !showAuth)}
            class:is-selected={showAuth}>
            <span class="icon-lock-closed" aria-hidden="true" />
            <span class="text">Manual authentication</span>
        </button>

        {#if showAuth}
            <div class="u-margin-block-start-16">
                <InputText
                    id="credentials"
                    label="Account credentials"
                    required
                    bind:value={$provider.serviceAccount}
                    placeholder="Enter account credentials" />
            </div>
        {/if}
    {:else if $provider.provider === 'supabase'}
        <FormList class="u-margin-block-start-24">
            <p class="body-text-1 u-bold">Postgres credentials</p>

            <InputText
                id="host"
                label="Host"
                required
                placeholder="Enter host"
                bind:value={$provider.host} />
            <InputNumber
                id="port"
                label="Port"
                required
                placeholder="Enter port"
                bind:value={$provider.port} />
            <InputText
                id="username"
                label="Username"
                required
                placeholder="Enter username"
                bind:value={$provider.username} />
            <InputPassword
                id="password"
                label="Password"
                required
                placeholder="Enter password"
                showPasswordButton
                bind:value={$provider.password} />
            <p class="body-text-1 u-bold">Supabase credentials</p>

            <InputText
                id="endpoint"
                label="Endpoint"
                required
                placeholder="Enter endpoint"
                bind:value={$provider.endpoint} />
            <InputPassword
                id="api-key"
                label="API Key"
                required
                placeholder="Enter API Key"
                showPasswordButton
                bind:value={$provider.apiKey} />
        </FormList>
    {:else if $provider.provider === 'nhost'}
        <FormList class="u-margin-block-start-24">
            <InputText
                id="region"
                label="Region"
                required
                placeholder="Enter region"
                bind:value={$provider.region} />
            <InputText
                id="subdomain"
                label="Subdomain"
                required
                placeholder="Enter subdomain"
                bind:value={$provider.subdomain} />
            <InputText
                id="database"
                label="Database"
                required
                placeholder="Enter database"
                bind:value={$provider.database} />
            <InputText
                id="username"
                label="Username"
                required
                placeholder="Enter username"
                bind:value={$provider.username} />
            <InputPassword
                id="password"
                label="Password"
                required
                placeholder="Enter password"
                showPasswordButton
                bind:value={$provider.password} />
            <InputPassword
                id="adminSecret"
                label="Admin secret"
                required
                placeholder="Enter admin secret"
                showPasswordButton
                bind:value={$provider.adminSecret} />
        </FormList>
    {/if}
</WizardStep>

<style lang="scss">
    .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9.125rem, 1fr));
        align-items: stretch;
        gap: 1rem;
    }

    .card {
        --card-padding: 0;
        --card-border-radius: var(--border-radius-small);
        display: block;
        position: relative;

        block-size: auto;
        display: grid;
        place-items: center;
        text-align: center;

        input {
            position: absolute;
            top: 0.5rem;
            left: 0.5rem;
        }

        .content {
            width: 9.125rem;
            height: 5.5rem;

            padding: 0 2rem;

            display: grid;
            place-items: center;
        }
    }
</style>
