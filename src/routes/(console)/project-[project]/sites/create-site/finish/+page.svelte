<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Wizard } from '$lib/layout';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import Check from './(components)/check.svelte';
    import type { PageData } from './$types';
    import Button from '$lib/elements/forms/button.svelte';
    import OpenOnMobileModal from '../../(components)/openOnMobileModal.svelte';
    import SiteCard from '../../(components)/siteCard.svelte';
    import ConnectRepoModal from '../../(components)/connectRepoModal.svelte';
    import { onMount } from 'svelte';

    export let data: PageData;

    let showConnectRepositry = false;
    let showOpenOnMobile = false;
    let showInviteCollaborator = false;
    let showAddDomain = false;

    onMount(() => {
        if (
            $page.url.searchParams.has('connectRepo') &&
            $page.url.searchParams.get('connectRepo') === 'true'
        ) {
            showConnectRepositry = true;
        }
    });
</script>

<Wizard
    title="Create a site"
    hideAside={true}
    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
    <Layout.Stack gap="l">
        <Layout.Stack gap="xxl">
            <Layout.Stack gap="l" direction="column" alignItems="center">
                <Check />
                <Layout.Stack gap="s" direction="column" alignItems="center">
                    <Typography.Text variant="l-400">Congratulations!</Typography.Text>
                    <Typography.Text variant="m-400"
                        >You deployed your Site successfully.</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
            <SiteCard deployment={data.deployment} site={data.site} />
        </Layout.Stack>

        {#if !data.deployment.providerCommitHash}
            <Layout.Stack direction="row">
                {#if !data.site.installationId && !data.site.providerRepositoryId}
                    <Card isTile radius="s" isButton on:click={() => (showConnectRepositry = true)}>
                        <Layout.Stack gap="s">
                            <Layout.Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center">
                                <Typography.Title size="s">Connect to repository</Typography.Title>
                                <Icon icon={IconArrowSmRight} />
                            </Layout.Stack>
                            <Typography.Text variant="m-400">
                                Connect to a new repository or an existing one.
                            </Typography.Text>
                        </Layout.Stack>
                    </Card>
                {/if}
                <Card
                    isTile
                    radius="s"
                    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}/domains`}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Add domain</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Connect to an existing domain or purchase a new one.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
                <Card isTile radius="s" isButton on:click={() => (showInviteCollaborator = true)}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Add collaborators</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Share your progress and start collaborating with your team.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
                <Card isTile radius="s" isButton on:click={() => (showOpenOnMobile = true)}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Open on mobile</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Open the preview of your site on any mobile or tablet device.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
            </Layout.Stack>
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button
            size="s"
            fullWidthMobile
            href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
            Close
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepositry}
    <ConnectRepoModal
        bind:show={showConnectRepositry}
        site={data.site}
        callbackState={{ connectRepo: 'true' }} />
{/if}
{#if showOpenOnMobile}
    <OpenOnMobileModal bind:show={showOpenOnMobile} siteURL={data.deployment.domain} />
{/if}
