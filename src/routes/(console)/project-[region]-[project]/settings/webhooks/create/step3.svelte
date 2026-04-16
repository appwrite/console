<script lang="ts">
    import { InputText, InputPassword, InputChoice } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { Alert, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let authUsername: string;
    export let authPassword: string;
    export let tls: boolean;
</script>

<Fieldset legend="Security">
    <Layout.Stack gap="xl">
        <Layout.Stack gap="s">
            <InputChoice
                type="switchbox"
                id="Security"
                label="Certificate verification (SSL/TLS)"
                bind:value={tls} />
            {#if !tls}
                <Alert.Inline
                    status="warning"
                    title="Untrusted or self-signed certificates may not be secure.">
                    <Button
                        compact
                        href="https://appwrite.io/docs/advanced/self-hosting/tls-certificates"
                        external>
                        Learn more</Button>
                </Alert.Inline>
            {/if}
        </Layout.Stack>
        <Layout.Stack gap="m">
            <div>
                <Typography.Text variant="m-600">HTTP authentication</Typography.Text>
                <Typography.Text
                    >Use to secure your endpoint from untrusted sources.</Typography.Text>
            </div>
            <InputText
                label="User"
                id="user"
                placeholder="Enter username"
                bind:value={authUsername} />
            <InputPassword
                label="Password"
                id="password"
                placeholder="Enter password"
                minlength={0}
                bind:value={authPassword} />
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
