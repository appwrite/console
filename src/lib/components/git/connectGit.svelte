<script lang="ts">
    import { page } from '$app/stores';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Card, Empty, Icon } from '@appwrite.io/pink-svelte';
    import Alert from '../alert.svelte';
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

{#if !isVcsEnabled && isSelfHosted}
    <Alert>
        <span slot="title"> Installing Git on a self-hosted instance </span>
        <p>
            Before installing Git in a locally hosted Appwrite project, ensure your environment
            variables are configured.
        </p>
        <svelte:fragment slot="buttons">
            <Button secondary external href="#/">Learn more</Button>
        </svelte:fragment>
    </Alert>
{/if}
<Card.Base padding="none" border="dashed">
    <Empty
        title="No installation was added to the project yet"
        description="Add an installation to connect repositories">
        <svelte:fragment slot="actions">
            <Button size="m" secondary href={connectGitHub().toString()} disabled={!isVcsEnabled}>
                <Icon icon={IconGithub} size="m" />
                Connect to GitHub
            </Button>
        </svelte:fragment>
    </Empty>
</Card.Base>
