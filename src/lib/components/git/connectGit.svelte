<script lang="ts">
    import { page } from '$app/stores';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Alert, Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { isSelfHosted } from '$lib/system';

    export let callbackState: Record<string, string> = null;

    let isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    function connectGitHub() {
        const redirect = new URL($page.url);
        if (callbackState) {
            Object.keys(callbackState).forEach((key) => {
                redirect.searchParams.append(key, callbackState[key]);
            });
        }
        const target = new URL(`${sdk.forProject.client.config.endpoint}/vcs/github/authorize`);
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target;
    }
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
                    <Button compact external href="#/">Learn more</Button>
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
                <Button secondary href={connectGitHub().toString()} disabled={!isVcsEnabled}>
                    <Icon slot="start" icon={IconGithub} />
                    Connect to GitHub
                </Button>
            </svelte:fragment>
        </Empty>
    </Card.Base>
</Layout.Stack>
