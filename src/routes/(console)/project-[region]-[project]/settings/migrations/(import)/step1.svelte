<script lang="ts">
    import { InputNumber, InputPassword, InputText, InputTextarea } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import type { Provider } from '$lib/stores/migration';
    import { provider } from '.';

    const providers: Record<Provider, string> = {
        appwrite: 'Appwrite',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };
</script>

<WizardStep>
    <svelte:fragment slot="title">Source</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Select a source platform with the project you want to migrate. <a
            class="link"
            href="https://appwrite.io/docs/advanced/migrations"
            target="_blank"
            rel="noopener noreferrer">
            Learn about which platforms are supported</a
        >.
    </svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-8">
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
            bind:value={$provider.apiKey} />
    {:else if $provider.provider === 'firebase'}
        <div class="u-margin-block-start-16">
            <InputTextarea
                id="credentials"
                label="Account credentials"
                required
                bind:value={$provider.serviceAccount}
                placeholder="Enter account credentials" />
        </div>
    {:else if $provider.provider === 'supabase'}
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
            bind:value={$provider.apiKey} />
    {:else if $provider.provider === 'nhost'}
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
            placeholder={$provider.subdomain ? `Default: ${$provider.subdomain}` : 'Enter database'}
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
            bind:value={$provider.password} />
        <InputPassword
            id="adminSecret"
            label="Admin secret"
            required
            placeholder="Enter admin secret"
            bind:value={$provider.adminSecret} />
    {/if}
</WizardStep>
