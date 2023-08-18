<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Dependencies } from '$lib/constants';
    import {
        FormList,
        InputNumber,
        InputPassword,
        InputSelect,
        InputText
    } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import type { Provider } from '$lib/stores/migration';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { provider } from '.';

    const providers: Record<Provider, string> = {
        appwrite: 'Appwrite Self-hosted',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };

    // function connectGoogle() {
    //     const redirect = new URL($page.url);
    //     const target = new URL(
    //         `${sdk.forProject.client.config.endpoint}/migrations/firebase/connect`
    //     );
    //     target.searchParams.set('redirect', redirect.toString());
    //     target.searchParams.set('projectId', $page.params.project);
    //     return target;
    // }

    function deauthorizeGoogle() {
        sdk.forProject.migrations.deleteFirebaseAuth().then(() => {
            firebaseProjects = [];
        });

        addNotification({
            type: 'success',
            message: 'Signed out of Google successfully'
        });

        invalidate(Dependencies.MIGRATIONS);
    }

    $: firebaseProjects = $page.data.firebaseProjects;

    $: console.log(firebaseProjects);

    // let showAuth = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Choose provider</svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-16">
        {#each Object.entries(providers) as [key, value]}
            <label class="u-flex u-cross-center u-cursor-pointer u-gap-8">
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
        {#if !firebaseProjects?.length}
            <!-- <div class="box u-flex u-flex-vertical u-gap-16 u-cross-center u-margin-block-start-24">
                <p class="u-text-center u-bold">Sign in with Google to get started</p>
                <Button secondary href={connectGoogle().toString()}>
                    <SvgIcon name="google" />Sign in
                </Button>
            </div> -->

            <!-- <button
                class="tag u-margin-block-start-16"
                type="button"
                on:click={() => (showAuth = !showAuth)}
                class:is-selected={showAuth}>
                <span class="icon-lock-closed" aria-hidden="true" />
                <span class="text">Manual authentication</span>
            </button> -->

            <!-- {#if showAuth} -->
            <div class="u-margin-block-start-16">
                <InputText
                    id="credentials"
                    label="Account credentials"
                    required
                    bind:value={$provider.serviceAccount}
                    placeholder="Enter account credentials" />
            </div>
            <!-- {/if} -->
        {:else}
            <FormList class="u-margin-block-start-24">
                <InputSelect
                    id="firebase-project"
                    label="Firebase project"
                    required
                    bind:value={$provider.projectId}
                    options={firebaseProjects.map((project) => ({
                        label: project.displayName,
                        value: project.projectId
                    }))} />
            </FormList>
            <p class="u-text-center u-margin-block-start-24">
                Signed in
                <button class="u-bold" on:click|preventDefault={deauthorizeGoogle}>
                    Sign Out?
                </button>
            </p>
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
            <InputNumber id="port" label="Port" placeholder="5432" bind:value={$provider.port} />
            <InputText
                id="username"
                label="Username"
                placeholder="postgres"
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
                placeholder={$provider.subdomain || 'Enter database'}
                bind:value={$provider.database} />
            <InputText
                id="username"
                label="Username"
                placeholder="postgres"
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
