<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics.js';
    import Card from '$lib/components/card.svelte';
    import { Repositories } from '$lib/components/git/index.js';
    import Button from '$lib/elements/forms/button.svelte';
    import { Wizard } from '$lib/layout';
    import { installation, repository } from '$lib/stores/vcs.js';
    import type { Models } from '@appwrite.io/console';
    import { Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let data;
    let hasInstallations = !!data?.installations?.total;
    let selectedRepository: string = null;

    function onConnect(e: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(e.detail);
        const target = `${base}/project-${$page.params.project}/sites/create-site/repositories/repository-${e.detail.id}?installation=${$installation.$id}`;
        goto(target);
    }
</script>

<Wizard title="Create site" href={`${base}/project-${$page.params.project}/sites/`} hideFooter>
    {#if hasInstallations}
        <Fieldset legend="Git repository">
            <Repositories
                bind:hasInstallations
                bind:selectedRepository
                product="sites"
                action="button"
                on:connect={onConnect} />
        </Fieldset>
    {:else}
        <Repositories
            bind:hasInstallations
            bind:selectedRepository
            product="sites"
            action="button"
            on:connect={onConnect} />
    {/if}

    <svelte:fragment slot="aside">
        <Card radius="s" padding="s">
            <Layout.Stack gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Text variation="m-400">
                        Don't have a repository set up yet? Explore our templates, available in all
                        your favorite frameworks, and deploy in seconds.
                    </Typography.Text>
                </Layout.Stack>
                <Button
                    href={`${base}/project-${$page.params.project}/sites/create-site/templates`}
                    secondary>View templates</Button>
            </Layout.Stack>
        </Card>
    </svelte:fragment>
</Wizard>
