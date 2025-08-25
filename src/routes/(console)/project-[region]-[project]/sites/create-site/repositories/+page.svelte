<script lang="ts">
    import { goto } from '$app/navigation';
    import { Click, trackEvent } from '$lib/actions/analytics.js';
    import Card from '$lib/components/card.svelte';
    import { Repositories } from '$lib/components/git/index.js';
    import Button from '$lib/elements/forms/button.svelte';
    import { Wizard } from '$lib/layout';
    import { installation, repository } from '$lib/stores/vcs.js';
    import type { Models } from '@appwrite.io/console';
    import { Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    let { data } = $props();

    let selectedRepository: string = $state(null);

    function onConnect(e: Models.ProviderRepository) {
        trackEvent(Click.ConnectRepositoryClick, {
            from: 'cover'
        });
        repository.set(e);
        const target = getProjectRoute(
            `/sites/create-site/repositories/repository-${e.id}?installation=${$installation.$id}`
        );
        goto(target);
    }
</script>

<Wizard title="Create site" href={getProjectRoute('/sites/')} hideFooter>
    {#if !!data?.installations?.total}
        <Fieldset legend="Git repository">
            <Repositories
                bind:selectedRepository
                product="sites"
                action="button"
                connect={onConnect} />
        </Fieldset>
    {:else}
        <Repositories bind:selectedRepository product="sites" action="button" connect={onConnect} />
    {/if}

    <svelte:fragment slot="aside">
        <Card radius="s" padding="s">
            <Layout.Stack gap="l">
                {#if !data?.installations?.total}
                    <Layout.Stack gap="xxs">
                        <Typography.Text variation="m-400">
                            Don't have a repository set up yet? Explore our templates, available in
                            all your favorite frameworks, and deploy in seconds.
                        </Typography.Text>
                    </Layout.Stack>
                    <Button href={getProjectRoute('/sites/create-site/templates')} secondary
                        >View templates</Button>
                {:else}
                    <Layout.Stack gap="s">
                        <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                            Missing a repository?
                        </Typography.Text>
                        <Typography.Text variation="m-400">
                            Make sure Appwrite has access to your GitHub repositories. If you chose
                            specific repos, you may need to update your permissions to include the
                            missing one.
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="s" direction="row">
                        <Button href="#" secondary>Docs</Button>
                        <Button
                            href={`https://github.com/${data.installations.installations[0].organization}`}
                            text>Go to GitHub</Button>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Card>
    </svelte:fragment>
</Wizard>
