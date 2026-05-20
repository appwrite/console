<script lang="ts">
    import { isSelfHosted } from '$lib/system';
    import { connectGitHub } from '$lib/stores/git';
    import Button from '$lib/elements/forms/button.svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Alert, Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { page } from '$app/state';

    let { callbackState = null }: { callbackState?: Record<string, string> } = $props();

    const isVcsEnabled = $derived($regionalConsoleVariables?._APP_VCS_ENABLED === true);

    const settingsUrl = $derived(
        `/console/project-${page.params.region}-${page.params.project}/settings`
    );
</script>

<Layout.Stack>
    {#if !isVcsEnabled && isSelfHosted}
        <Alert.Inline status="info" title="Set up Git for this instance">
            <Layout.Stack>
                <p>Create a GitHub App to enable Git deployments on your self-hosted instance.</p>
                <div>
                    <Button compact href={settingsUrl}>Set up GitHub App</Button>
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
                <Button
                    secondary
                    href={connectGitHub(callbackState).toString()}
                    disabled={!isVcsEnabled}>
                    <Icon slot="start" icon={IconGithub} />
                    Connect to GitHub
                </Button>
            </svelte:fragment>
        </Empty>
    </Card.Base>
</Layout.Stack>
