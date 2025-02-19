<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Wizard } from '$lib/layout';
    import { Layout, Typography, Icon, Lights, Step } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import Check from './(components)/check.svelte';
    import type { PageData } from './$types';
    import Button from '$lib/elements/forms/button.svelte';
    import OpenOnMobileModal from '../../(components)/openOnMobileModal.svelte';
    import SiteCard from '../../(components)/siteCard.svelte';
    import ConnectRepoModal from '../../(components)/connectRepoModal.svelte';
    import { onMount } from 'svelte';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import { protocol } from '$routes/(console)/store';

    export let data: PageData;

    let showConnectRepositry = false;
    let showOpenOnMobile = false;
    let showInviteCollaborator = false;

    onMount(() => {
        if (
            $page.url.searchParams.has('connectRepo') &&
            $page.url.searchParams.get('connectRepo') === 'true'
        ) {
            showConnectRepositry = true;
        }
    });
</script>

<Wizard column href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
    <!-- Creating a new stack -->
    <div style:position="relative" style="z-index: 1;">
        <Layout.Stack gap="xxl">
            <!-- TODO: switch to xxxl -->
            <Layout.Stack gap="xxl">
                <Layout.Stack gap="l" direction="column" alignItems="center">
                    <Check />
                    <Layout.Stack gap="xs" direction="column" alignItems="center">
                        <Typography.Title size="l">Congratulations!</Typography.Title>
                        <Typography.Text variant="l-400">
                            You deployed your Site successfully
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
                <Lights style="top: -100px; height:200px; width: 50%" />
                <SiteCard deployment={data.deployment} hideQRCode>
                    <svelte:fragment slot="footer">
                        <Button href={`${$protocol}${data.deployment.domain}`} external>
                            Visit site
                        </Button>
                    </svelte:fragment>
                </SiteCard>
            </Layout.Stack>
            <div style="margin-block-start: var(--gap-xxl);">
                <Step.List>
                    <Step.Item state="current" shortLine={true}>
                        {#if !data.deployment.providerCommitHash}
                            <Layout.Stack direction="row" gap="l">
                                {#if !data.site.installationId && !data.site.providerRepositoryId}
                                    <Card
                                        isTile
                                        radius="s"
                                        padding="s"
                                        isButton
                                        on:click={() => (showConnectRepositry = true)}>
                                        <Layout.Stack gap="s">
                                            <Layout.Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center">
                                                <Typography.Title size="s">
                                                    Connect to repository
                                                </Typography.Title>
                                                <Icon
                                                    icon={IconArrowSmRight}
                                                    size="l"
                                                    color="--color-fgcolor-neutral-weak" />
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
                                    padding="s"
                                    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}/domains`}>
                                    <Layout.Stack gap="s">
                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <Typography.Title size="s">Add domain</Typography.Title>
                                            <Icon
                                                icon={IconArrowSmRight}
                                                size="l"
                                                color="--color-fgcolor-neutral-weak" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            Connect to an existing domain or purchase a new one.
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Card>
                                <Card
                                    isTile
                                    radius="s"
                                    isButton
                                    padding="s"
                                    on:click={() => (showInviteCollaborator = true)}>
                                    <Layout.Stack gap="s">
                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <Typography.Title size="s"
                                                >Add collaborators</Typography.Title>
                                            <Icon
                                                icon={IconArrowSmRight}
                                                size="l"
                                                color="--color-fgcolor-neutral-weak" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            Share your progress and start collaborating with your
                                            team.
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Card>
                                <Card
                                    isTile
                                    radius="s"
                                    isButton
                                    padding="s"
                                    on:click={() => (showOpenOnMobile = true)}>
                                    <Layout.Stack gap="s">
                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <Typography.Title size="s"
                                                >Open on mobile</Typography.Title>
                                            <Icon
                                                icon={IconArrowSmRight}
                                                size="l"
                                                color="--color-fgcolor-neutral-weak" />
                                        </Layout.Stack>
                                        <Typography.Text variant="m-400">
                                            Open the preview of your site on any mobile or tablet
                                            device.
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Card>
                            </Layout.Stack>
                        {/if}
                    </Step.Item>
                </Step.List>
            </div>
        </Layout.Stack>
    </div>

    <svelte:fragment slot="footer">
        <Button
            size="s"
            fullWidthMobile
            secondary
            href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
            Go to dashboard
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepositry}
    <ConnectRepoModal
        bind:show={showConnectRepositry}
        site={data.site}
        callbackState={{ connectRepo: 'true' }} />
{/if}
{#if showOpenOnMobile && data.deployment.domain}
    <OpenOnMobileModal bind:show={showOpenOnMobile} siteURL={data.deployment.domain} />
{/if}

{#if showInviteCollaborator}
    <AddCollaboratorModal bind:show={showInviteCollaborator} />
{/if}
