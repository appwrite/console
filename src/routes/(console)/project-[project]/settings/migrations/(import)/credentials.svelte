<script lang="ts">
    import { provider } from '.';
    import { Button, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { InputNumber, InputPassword, InputText, InputTextarea } from '$lib/elements/forms';

    export let formSubmitted = false;

    $: disableButton = (() => {
        if (!$provider) return true;

        switch ($provider.provider) {
            case 'appwrite':
                return !$provider.endpoint || !$provider.projectID || !$provider.apiKey;

            case 'firebase':
                return !$provider.serviceAccount;

            case 'supabase':
                return (
                    !$provider.host ||
                    !$provider.port ||
                    !$provider.password ||
                    !$provider.endpoint ||
                    !$provider.apiKey
                );

            case 'nhost':
                return (
                    !$provider.region ||
                    !$provider.subdomain ||
                    !$provider.password ||
                    !$provider.adminSecret
                );

            default:
                return true;
        }
    })();
</script>

<Layout.Stack gap="xl">
    {#if $provider.provider === 'appwrite'}
        <Layout.Stack gap="l">
            <Layout.Stack></Layout.Stack>
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
        </Layout.Stack>
    {:else if $provider.provider === 'firebase'}
        <Layout.Stack gap="l">
            <InputTextarea
                id="credentials"
                label="Service Account JSON credentials"
                required
                bind:value={$provider.serviceAccount}
                placeholder="Enter Service Account JSON credentials" />
        </Layout.Stack>
    {:else if $provider.provider === 'supabase'}
        <Layout.Stack gap="l">
            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary"
                >Postgres credentials</Typography.Text>

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

            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary"
                >Supabase credentials</Typography.Text>

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
        </Layout.Stack>
    {:else if $provider.provider === 'nhost'}
        <Layout.Stack gap="l">
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
                placeholder={$provider.subdomain
                    ? `Default: ${$provider.subdomain}`
                    : 'Enter database'}
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
        </Layout.Stack>
    {/if}

    <Layout.Stack direction="row" justifyContent="flex-end">
        <Button.Button
            size="s"
            disabled={disableButton}
            on:click={() => {
                formSubmitted = true;
            }}>Next</Button.Button>
    </Layout.Stack>
</Layout.Stack>
