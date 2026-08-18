<script lang="ts">
    import { isSelfHosted } from '$lib/system';
    import { connectVcsProvider, enabledVcsProviders } from '$lib/stores/git';
    import Button from '$lib/elements/forms/button.svelte';
    import { Alert, Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    export let callbackState: Record<string, string> = null;

    let isVcsEnabled = $regionalConsoleVariables?._APP_VCS_ENABLED === true;
    // Not in the SDK's generated types yet -- server already returns it.
    let vcsProviders = ($regionalConsoleVariables as { _APP_VCS_PROVIDERS?: string[] })
        ?._APP_VCS_PROVIDERS;
    let providers = enabledVcsProviders(vcsProviders);
</script>

<Layout.Stack>
    {#if !isVcsEnabled && isSelfHosted}
        <Alert.Inline status="info" title="Installing Git on a self-hosted instance ">
            <Layout.Stack>
                <p>
                    Before installing Git in a locally hosted Appwrite project, ensure your
                    environment variables are configured.
                </p>
                <div>
                    <Button
                        compact
                        external
                        href="https://appwrite.io/docs/advanced/self-hosting/configuration/version-control"
                        >Learn more</Button>
                </div>
            </Layout.Stack>
        </Alert.Inline>
    {/if}
    <Card.Base padding="none" border="dashed">
        <Empty
            type="secondary"
            title="No installation was added to the project yet"
            description="Add an installation to connect repositories">
            <svelte:fragment slot="actions">
                <Layout.Stack direction="row">
                    {#each providers as provider (provider.id)}
                        <Button
                            secondary
                            href={connectVcsProvider(provider.id, callbackState).toString()}
                            disabled={!isVcsEnabled}>
                            <Icon slot="start" icon={provider.icon} />
                            Connect to {provider.label}
                        </Button>
                    {/each}
                </Layout.Stack>
            </svelte:fragment>
        </Empty>
    </Card.Base>
</Layout.Stack>
